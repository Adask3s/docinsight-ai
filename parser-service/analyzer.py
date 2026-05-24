import asyncio
import json
import os
import random
import re
from hashlib import sha256
from typing import Any, Dict, Optional # typy danych używane w funkcjach (np. Dict, Optional) i zwracanych strukturach danych

from dotenv import load_dotenv
from fastapi import APIRouter # modularny router FastAPI, który potem podłączymy do głównej aplikacji w main.py
from openai import AsyncOpenAI
import openai
from pydantic import BaseModel # walidacja danych wejściowych (np. sprawdzanie, czy "text" jest stringiem)

from metrics import (
    avg_sentence_length,
    count_words,
    keyword_frequencies,
    risk_score,
    top_words,
)

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL")

if not OPENAI_API_KEY or not OPENAI_MODEL:
    raise RuntimeError("OPENAI_API_KEY oraz OPENAI_MODEL muszą być ustawione w środowisku.")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

MAX_PROMPT_TEXT_CHARS = 16000
MAX_RETRIES = 3
RETRY_SLEEP_MIN = 5.0
RETRY_SLEEP_MAX = 15.0

CACHE: Dict[str, Any] = {}
router = APIRouter()


def get_cache_key(text: str) -> str:
    return sha256(text.encode("utf-8")).hexdigest()


def error_response(message: str, context: Optional[str] = None) -> Dict[str, Any]:
    return {
        "ok": False,
        "error": {"message": message, "context": context},
        "data": None,
    }


class AIError(Exception):
    pass


async def query_openai(prompt: str, max_retries: int = MAX_RETRIES) -> str:
    for attempt in range(max_retries):
        if attempt > 0:
            wait = random.uniform(RETRY_SLEEP_MIN, RETRY_SLEEP_MAX)
            await asyncio.sleep(wait)

        try:
            response = await client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "Jesteś ekspertem od analizy dokumentów. Odpowiadasz po polsku.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                timeout=60,
            )
            return response.choices[0].message.content

        except openai.RateLimitError as e:
            print(f"❌ Rate limit: {e}")
            if attempt == max_retries - 1:
                raise AIError("Błąd modelu AI (RateLimit)") from e
        except Exception as e:
            print(f"❌ Inny błąd: {e}")
            raise AIError("Błąd modelu AI (ogólny)") from e

    raise AIError("Nie udało się uzyskać odpowiedzi po kilku próbach.")


# Funkcja pomocnicza do wyciągania JSON-a z odpowiedzi modelu, nawet jeśli doda komentarz
def extract_json_like(text: str) -> str:
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    decoder = json.JSONDecoder()
    idx = 0

    while idx < len(cleaned):
        if cleaned[idx] in "{[":
            try:
                _, end = decoder.raw_decode(cleaned[idx:])
                return cleaned[idx : idx + end].strip()
            except json.JSONDecodeError:
                pass
        idx += 1

    raise ValueError("Nie znaleziono prawidłowego JSON-a w odpowiedzi modelu.")




def prepare_prompt_text(text: str, max_chars: int = MAX_PROMPT_TEXT_CHARS) -> str:
    if len(text) <= max_chars:
        return text

    truncated = text[:max_chars]
    last_newline = truncated.rfind("\n")
    if last_newline > 0:
        return truncated[:last_newline].strip()
    return truncated.strip()


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

    prompt_text = prepare_prompt_text(text)
    summary_prompt = (
        "Streszcz ten dokument po polsku w maksymalnie 5 zdaniach, zwracając uwagę na cel i ważne informacje. "
        "UWAGA: Odpowiedz TYLKO streszczeniem, BEZ żadnych komentarzy, uwag, znaków specjalnych ani wyjaśnień. "
        "Odpowiedź w formacie JSON: {\"summary\": \"...\", \"language\": \"...\"}\n\n"
        "Tekst:\n" + prompt_text
    )

    try:
        summary_content = await query_openai(summary_prompt)
        await asyncio.sleep(0.3)
        summary = json.loads(extract_json_like(summary_content))
    except AIError as e:
        return error_response(str(e), None)
    except Exception as e:
        return error_response("Błąd parsowania JSON streszczenia", str(e))

    visualization_data = {
        "length_in_words": count_words(text),
        "avg_sentence_length": avg_sentence_length(text),
        "top_words": top_words(text, 5),
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

    prompt_text = prepare_prompt_text(text)
    classification_prompt = (
        "Na podstawie poniższego tekstu, zwróć typ dokumentu i przypisane kategorie tematyczne. "
        "Odpowiedz w formacie JSON: {\"type\": \"...\", \"categories\": [\"...\", \"...\", \"...\"]}\n\n"
        "Tekst:\n" + prompt_text
    )

    try:
        classification_content = await query_openai(classification_prompt)
        await asyncio.sleep(0.3)
        print("📩 Odpowiedź z LLM (klasyfikacja):", classification_content)
        cleaned_classification = extract_json_like(classification_content)
        classification = json.loads(cleaned_classification)
        if not isinstance(classification, dict):
            raise ValueError("classification nie jest JSON-em typu dict")
        if "categories" not in classification or not isinstance(classification["categories"], list):
            classification["categories"] = []
    except AIError as e:
        return error_response(str(e), None)
    except Exception as e:
        print("❗ Błąd JSONDecodeError (klasyfikacja):", e)
        return error_response("Błąd parsowania klasyfikacji", str(e))

    result = {
        "ok": True,
        "error": None,
        "data": {"classification": classification}
    }
    # Cache’uj tylko jeśli classification nie jest błędem
    if not (isinstance(classification.get("type", ""), str) and classification["type"].startswith("⚠️")):
        CACHE[cache_key] = result
    return result

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
    prompt_text = prepare_prompt_text(text)

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
        "Tekst:\n" + prompt_text
    )

    try:
        risk_analysis_raw = await query_openai(risk_prompt)
        await asyncio.sleep(0.3)
        print("📩 Odpowiedź z LLM (ryzyko):", risk_analysis_raw)
        cleaned = extract_json_like(risk_analysis_raw)
        parsed = json.loads(cleaned)
        if not isinstance(parsed, dict):
            raise ValueError("Odpowiedź modelu nie jest obiektem JSON")
    except AIError as e:
        return error_response(str(e), None)
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

MAX_INPUT_CHARS = 8000  # dopasuj do limitów modelu używanego w Chat

@router.post("/chat")
async def chat_with_document(request: ChatRequest) -> Dict[str, Any]:
    prompt_text = prepare_prompt_text(request.text, MAX_INPUT_CHARS)
    prompt = (
        f"Na podstawie poniższego fragmentu dokumentu odpowiedz na pytanie użytkownika. "
        f"Odpowiadaj po polsku, cytuj fragmenty tekstu.\n\n"
        f"DOKUMENT:\n{prompt_text}\n\nPYTANIE:\n{request.question}"
    )

    try:
        answer = await query_openai(prompt)
    except AIError as e:
        return error_response(str(e), None)

    return {
        "ok": True,
        "error": None,
        "data": {"answer": answer}
    }