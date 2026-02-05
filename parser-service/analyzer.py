import uuid  # generowanie unikalnych identyfikatorów dla plików
import json
from datetime import datetime  # zapisywanie aktualnej daty i czasu przesłania dokumentu
from fastapi import APIRouter, Request  # modularne definiowanie endpointów FastAPI
from pydantic import BaseModel  # walidacja danych wejściowych (AnalyzeRequest)
from typing import List, Dict, Any  # typy danych używane w funkcjach i zwracanych strukturach
from metrics import count_words, avg_sentence_length, keyword_frequencies  # lokalny moduł do metryk tekstu

# definicja AI
import requests
import re
from dotenv import load_dotenv
import os
import asyncio # opoóźnienei pomiędzy zapytaniami
import time
import random
import openai
from openai import AsyncOpenAI

# CACHE TYCH SAMYCH ANALIZ
from hashlib import sha256

CACHE = {}

# Funkcja do generowania klucza cache (hash tekstu)
def get_cache_key(text: str) -> str:
    return sha256(text.encode("utf-8")).hexdigest()

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

def error_response(message: str, context: str = None):
    return {
        "ok": False,
        "error": {
            "message": message,
            "context": context
        },
        "data": None
    }

async def query_openai(prompt: str, max_retries: int = 3) -> str:
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait = random.uniform(5.0, 15.0)
                # print(f"🔄 Retry {attempt}/{max_retries} – czekam {wait:.1f}s...")
                await asyncio.sleep(wait)

            response = await client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Jesteś ekspertem od analizy dokumentów. Odpowiadasz po polsku."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                timeout=60
            )
            return response.choices[0].message.content

        except openai.RateLimitError as e:
            print(f"❌ Rate limit: {e}")
            if attempt < max_retries - 1:
                continue
            return error_response("Błąd modelu AI (RateLimit)", str(e))
        except Exception as e:
            print(f"❌ Inny błąd: {e}")
            return error_response("Błąd modelu AI (ogólny)", str(e))

    return "⚠️ Nie udało się uzyskać odpowiedzi po kilku próbach."


# Funkcja pomocnicza do wyciągania JSON-a z odpowiedzi modelu, nawet jeśli doda komentarz
def extract_json_like(text: str) -> str:
    # usuń znaczniki markdown (```json, ```, ``` itp.)
    cleaned = re.sub(r"```(?:json)?", "", text).strip()

    # wyciągnij pierwszy obiekt JSON ({...}) lub listę ([...])
    match = re.search(r'(\{.*\}|\[.*\])', cleaned, re.DOTALL)
    return match.group(1).strip() if match else cleaned




# tworzy lokalny router API, który podłączamy w main.py
# dzięki temu FastAPI zna ścieżkę /analyze
router = APIRouter()

# oczekujemy, że ktoś prześle JSON z polem
# gdy przychodzi JSON FastAPI automatycznie parsuje JSON-a ({"text": "..."}),
# tworzy instancję klasy AnalyzeRequest z tego JSON-a, sprawdza, czy "text" istnieje i jest typu str
# i jeśli wszystko dobrze, przekazuje obiekt do request
class AnalyzeRequest(BaseModel):
    text: str

# po "POST /analyze" z JSON-em typu { "text": "..." } wywołuje się ta funkcja
@router.post("/analyze/summary")
async def analyze_summary(request: AnalyzeRequest) -> Dict[str, Any]:
    text = request.text
    cache_key = get_cache_key(text + "_summary")
    if cache_key in CACHE:
        print("🔁 Zwracam wynik z cache (summary)!")
        return CACHE[cache_key]

    summary_prompt = (
        "Streszcz ten dokument po polsku w maksymalnie 5 zdaniach, zwracając uwagę na cel i ważne informacje. "
        "UWAGA: Odpowiedz TYLKO streszczeniem, BEZ żadnych komentarzy, uwag, znaków specjalnych, ani wyjaśnień. "
        "Odpowiedź w formacie JSON: {\"summary\": \"...\", \"language\": \"...\"}\n\n"
        "Tekst:\n" + text[:4000] # dla wersji MVP, aktualnie większe teksty zostaną ucięte
    )
    summary_content = await query_openai(summary_prompt)
    await asyncio.sleep(0.3)
    print("Raw summary:\n", summary_content)
    try:
        summary = json.loads(extract_json_like(summary_content))
    except Exception as e:
        # jeśli to ewidentnie błąd modelu, nie udawaj, że to JSON
        if isinstance(summary_content, dict) and summary_content.get("ok") is False:
            return summary_content  # to już jest error_response z query_together_ai
        else:
            return error_response("Błąd parsowania JSON streszczenia", summary_content)

    from metrics import top_words, count_words, avg_sentence_length

    visualization_data = {
        "length_in_words": count_words(text),
        "avg_sentence_length": avg_sentence_length(text),
        "top_words": top_words(text, 5)
    }

    result = {
        "ok": True,
        "error": None,
        "data": {
            "summary": summary,
            "visualization_data": visualization_data
        }
    }
    # Cache’uj tylko jeśli summary nie jest błędem
    if not (isinstance(summary, str) and summary.startswith("⚠️")):
        CACHE[cache_key] = result
    return result

@router.post("/analyze/classification")
async def analyze_classification(request: AnalyzeRequest) -> Dict[str, Any]:
    text = request.text
    cache_key = get_cache_key(text + "_classification")
    if cache_key in CACHE:
        print("🔁 Zwracam wynik z cache (classification)!")
        return CACHE[cache_key]

    classification_prompt = (
        "Na podstawie poniższego tekstu, zwróć typ dokumentu i przypisane kategorie tematyczne. "
        "Odpowiedz w formacie JSON: {\"type\": \"...\", \"categories\": [\"...\", \"...\", \"...\"]}\n\n"
        "Tekst:\n" + text[:2000]
    )
    classification_content = await query_openai(classification_prompt)
    await asyncio.sleep(0.3)
    print("📩 Odpowiedź z LLM (klasyfikacja):", classification_content)
    try:
        cleaned_classification = extract_json_like(classification_content)
        classification = json.loads(cleaned_classification)
        if not isinstance(classification, dict):
            raise ValueError("classification nie jest JSON-em typu dict")
        if "categories" not in classification or not isinstance(classification["categories"], list):
            classification["categories"] = []
    except Exception as e:
        print("❗ Błąd JSONDecodeError (klasyfikacja):", e)
        return error_response("Błąd parsowania klasyfikacji", classification_content)

    result = {
        "ok": True,
        "error": None,
        "data": {"classification": classification}
    }
    # Cache’uj tylko jeśli classification nie jest błędem
    if not (isinstance(classification.get("type", ""), str) and classification["type"].startswith("⚠️")):
        CACHE[cache_key] = result
    return result

from metrics import risk_score, keyword_frequencies, count_words

@router.post("/analyze/risk")
async def analyze_risk(request: AnalyzeRequest) -> Dict[str, Any]:
    text = request.text
    cache_key = get_cache_key(text + "_risk")
    if cache_key in CACHE:
        print("🔁 Zwracam wynik z cache (risk)!")
        return CACHE[cache_key]

    KEYWORDS_MAP = {
        "wypowied": "wypowiedzenie",
        "kar": "kara",
        "opłat": "opłata",
        "zrzecz": "zrzeczenie",
        "zakaz": "zakaz",
        "bezwarunkow": "bezwarunkowo",
        "nieodwołaln": "nieodwołalnie"
    }

    keywords = list(KEYWORDS_MAP.keys())
    hard_keywords = ["bezwarunkow", "nieodwołaln", "zrzecz", "zakaz", "kar", "opłat"]
    soft_keywords = ["wypowied"]

    keyword_freq = keyword_frequencies(text, keywords)

    # zamiana rdzeni na pełne słowa
    keyword_freq_pretty = {KEYWORDS_MAP[k]: v for k, v in keyword_freq.items()}

    doc_length = count_words(text)

    risk_prompt = (
            "Przeanalizuj poniższy dokument i wypisz potencjalnie ryzykowne fragmenty wraz z uzasadnieniem. "
            "Najpierw oceń, czy dokument jest formalnym dokumentem prawnym/biznesowym lub umową i nadaje się do analizy ryzyka, nie analizujemy czegoś, czego nie da się podpisać. "
            "Jeśli dokument NIE jest formalny, zwróć JSON w formacie:\n"
            "{\n"
            "  \"is_legal\": false,\n"
            "  \"reason\": \"krótki powód\",\n"
            "  \"risk_analysis\": []\n"
            "}\n"
            "Jeśli dokument JEST formalny, zwróć JSON w formacie:\n"
            "{\n"
            "  \"is_legal\": true,\n"
            "  \"reason\": \"krótki powód\",\n"
            "  \"risk_analysis\": [\n"
            "    {\n"
            "      \"text_fragment\": \"...\",\n"
            "      \"reason\": \"...\",\n"
            "      \"severity\": \"niskie\"/\"średnie\"/\"wysokie\"\n"
            "    }\n"
            "  ]\n"
            "}\n"
            "Odpowiedz WYŁĄCZNIE poprawnym JSON, bez komentarzy, wyjaśnień ani dodatkowego tekstu. Nie używaj znaczników kodu (json, ani podobnych).\n\n"
            "Tekst:\n" + text[:2000]
    )

    risk_analysis_raw = await query_openai(risk_prompt)
    print("📩 Odpowiedź z LLM (ryzyko):", risk_analysis_raw)
    try:
        cleaned = extract_json_like(risk_analysis_raw)
        parsed = json.loads(cleaned)
        if not isinstance(parsed, dict):
            raise ValueError("Odpowiedź modelu nie jest obiektem JSON")
    except Exception as e:
        print("❗ Błąd JSONDecodeError (ryzyko):", e)
        return error_response("Błąd parsowania JSON ryzyka", str(e))

    # --- Obsługa flagi legalności dokumentu ---
    if parsed.get("is_legal") is False:
        return {
            "ok": False,
            "error": {
                "message": f"Dokument nie nadaje się do analizy ryzyka: {parsed.get('reason', '')}",
                "context": None
            },
            "data": None
        }

    # --- Analiza ryzyka dla dokumentów formalnych ---
    risk_analysis = parsed.get("risk_analysis", [])
    reason = parsed.get("reason", "")

    risk_score_value = risk_score(
        risk_list=risk_analysis if isinstance(risk_analysis, list) else [],
        keyword_freq=keyword_freq,
        doc_length=doc_length,
        hard_keywords=hard_keywords,
        soft_keywords=soft_keywords
    )

    result = {
        "ok": True,
        "error": None,
        "data": {
            "is_legal": True,
            "reason": reason,
            "risk_analysis": risk_analysis,
            "risk_score": risk_score_value,
            "keyword_frequencies": keyword_freq_pretty,
            "length_in_words": doc_length
        }
    }

    # --- Cache tylko jeśli jest sens (niepusty, formalny dokument) ---
    if parsed.get("is_legal") and isinstance(risk_analysis, list) and len(risk_analysis) > 0:
        CACHE[cache_key] = result
    else:
        print("🔒 Nie cache’uję – dokument bez ryzyk albo niefomalny")

    return result


# CZAT

class ChatRequest(BaseModel):
    text: str
    question: str

MAX_INPUT_CHARS = 4000  # albo 8000, w zależności od modelu Together

@router.post("/chat")
async def chat_with_document(request: ChatRequest):
    truncated_text = request.text[:MAX_INPUT_CHARS]
    prompt = (
        f"Na podstawie poniższego fragmentu dokumentu odpowiedz na pytanie użytkownika. "
        f"Odpowiadaj po polsku, cytuj fragmenty tekstu.\n\n"
        f"DOKUMENT:\n{truncated_text}\n\nPYTANIE:\n{request.question}"
    )
    answer = await query_openai(prompt)
    if isinstance(answer, dict) and answer.get("ok") is False:
        return answer  # przepuść error_response z query_together_ai

    return {
        "ok": True,
        "error": None,
        "data": {"answer": answer}
    }