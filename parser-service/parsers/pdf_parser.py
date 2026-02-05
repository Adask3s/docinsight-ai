import fitz  # po zainstalowaniu PyMuPDF

# funkcja przyjmuje surową zawartość pliku PDF (to, co file.read() w main.py zwróciło)
def extract_text_from_pdf(pdf_bytes: bytes) -> str: # funkcja zwraca str - cały tekst z dokumentu
    # otwarcie PDF jako dokument PyMuPDF – można go teraz przeglądać „strona po stronie”
    doc = fitz.open("pdf", pdf_bytes)
    # dla każdej strony dokumentu odczytuje jego tekst i "skleja" wszystkie strony w jeden
    # długi string z odstępami linii pomiędzy sobą ("\n")
    full_text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return full_text