import re # moduł do wyrażeń regularnych, używany do analizy tekstu (np. dzielenie na zdania, liczenie słów)
from collections import Counter # do liczenia częstości słów
from typing import Any, Dict, List # typy danych używane w funkcjach (np. Dict, List)

STOPWORDS = {
    "i", "oraz", "a", "w", "na", "do", "z", "za", "dla", "o", "u", "od", "po", "przez",
    "pod", "nad", "bez", "czy", "jest", "to", "że", "nie", "ma", "się", "jak", "ale", "lub",
    "też", "która", "który", "którzy", "które", "którą", "ten", "ta", "te", "być", "było",
    "była", "byli", "były", "był", "będzie", "będą", "będziemy", "będziesz", "będę", "by",
    "ze", "są",
}


def count_words(text: str) -> int:
    """Policz liczbę słów w tekście."""
    return len(re.findall(r"\b\w+\b", text, flags=re.UNICODE))


def avg_sentence_length(text: str) -> float:
    """Oblicz średnią długość zdania (liczbę słów na zdanie)."""
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    if not sentences:
        return 0.0

    total_words = sum(
        len(re.findall(r"\b\w+\b", sentence, flags=re.UNICODE))
        for sentence in sentences
    )
    return round(total_words / len(sentences), 2)


def keyword_frequencies(text: str, keywords: List[str]) -> Dict[str, int]:
    """Policz częstość słów kluczowych w tekście."""
    words = re.findall(r"\b\w+\b", text.lower(), flags=re.UNICODE)
    counts = Counter(words)
    return {
        kw.lower(): sum(value for word, value in counts.items() if kw.lower() in word)
        for kw in keywords
    }


def top_words(text: str, n: int = 5) -> Dict[str, int]:
    """Zwróć n najczęściej występujących słów (bez stopwords)."""
    words = [
        w
        for w in re.findall(r"\b\w+\b", text.lower(), flags=re.UNICODE)
        if w not in STOPWORDS and len(w) > 2
    ]
    return dict(Counter(words).most_common(n))


def risk_score(
    risk_list: List[Dict[str, Any]],
    keyword_freq: Dict[str, int],
    doc_length: int,
    hard_keywords: List[str],
    soft_keywords: List[str],
) -> int:
    """
    Oblicz wynikowy wynik ryzyka dokumentu (0-100).
    
    Bierze pod uwagę:
    - Oceny ryzyka z LLM (wysokie/średnie/niskie)
    - Słowa kluczowe wskazujące na ryzyko
    """
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
    return max(0, min(int(score), 100))