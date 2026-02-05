import re # moduł do wyrażeń regularnych (np. dzielenie tekstu na zdania)
import os
from collections import Counter #  liczenie częstości występowania słów
from typing import Dict # podpowiedź typów

def count_words(text: str) -> int:
    return len(text.split())

def avg_sentence_length(text: str) -> float:
    # Dzielimy tekst na zdania na podstawie znaków końca zdania
    sentences = re.split(r'[.!?]', text)
    # Usuwamy puste ciągi lub zdania złożone tylko z białych znaków
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return 0.0
    # Liczymy słowa w każdym zdaniu i obliczamy średnią
    total_words = sum(len(s.split()) for s in sentences)
    return round(total_words / len(sentences), 2)

# funkcja przyjmuje tekst i listę keywords
from typing import Dict

import re
from collections import Counter
from typing import Dict

def keyword_frequencies(text: str, keywords: list[str]) -> Dict[str, int]:
    words = re.findall(r'\b\w+\b', text.lower())
    result = {}
    for kw in keywords:
        kw = kw.lower()
        count = sum(1 for w in words if kw in w)
        result[kw] = count
    return result

import re
from collections import Counter

STOPWORDS = set([
    "i", "oraz", "a", "w", "na", "do", "z", "za", "dla", "o", "u", "od", "po", "przez", "pod", "nad", "bez", "czy", "jest", "to", "że", "nie", "ma", "się", "jak", "ale", "lub", "też", "która", "który", "którzy", "które", "którą", "ten", "ta", "to", "te", "być", "było", "była", "byli", "były", "był", "będzie", "będą", "będziemy", "będziesz", "będę", "by", "dla", "ze", "za", "od", "do", "na", "w", "z", "o", "u", "pod", "nad", "przez", "po", "jak", "że", "czy", "nie", "jest", "są", "być", "było", "była", "byli", "były", "był", "będzie", "będą", "będziemy", "będziesz", "będę"
])

def top_words(text: str, n: int = 5) -> dict:
    words = re.findall(r'\b\w+\b', text.lower())
    words = [w for w in words if w not in STOPWORDS and len(w) > 2]
    counter = Counter(words)
    return dict(counter.most_common(n))


def risk_score(
        risk_list,
        keyword_freq,
        doc_length,
        hard_keywords,
        soft_keywords
):
    score = 0

    # 1. Punkty za ryzyka znalezione przez AI
    # To jest najważniejszy czynnik.
    for r in risk_list:
        sev = (r.get("severity") or "").lower()
        if sev == "wysokie":
            score += 40  # Zwiększamy wagę wysokiego ryzyka
        elif sev == "średnie":
            score += 20
        elif sev == "niskie":
            score += 10
        else:
            score += 10

    # 2. Punkty za słowa kluczowe (hard keywords)
    # Np. "nieodwołalnie", "kara" - każde wystąpienie podbija ryzyko
    for kw in hard_keywords:
        # Pobieramy liczbę wystąpień danego słowa
        count = keyword_freq.get(kw, 0)
        # Dodajemy punkty, ale z limitem na jedno słowo (np. max 15 pkt za same "kary")
        # żeby jedno słowo powtórzone 100 razy nie zabiło skali
        score += min(15, count * 5)

    # 3. Punkty za słowa kluczowe (soft keywords)
    for kw in soft_keywords:
        count = keyword_freq.get(kw, 0)
        score += min(10, count * 2)

    # USUNIĘTO: Fragment, który dzielił wynik przez długość tekstu.
    # if doc_length > 200:
    #     score = score * (200 / doc_length)

    # 4. Normalizacja do 100
    # Wynik nie może przekroczyć 100, ale nie zaniżamy go szcztucznie dzielac przez dlugosc.
    final_score = min(int(score), 100)

    return max(0, final_score)