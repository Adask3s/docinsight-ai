# FastAPI - Framework, który pozwala stowrzyć seriws HTTP
from fastapi import FastAPI, UploadFile, File
from parsers.pdf_parser import extract_text_from_pdf # import funkcji z drugiego pliku (parser plików PDF)
from analyzer import router as analyzer_router # import routera z pliku analyzer.py


app = FastAPI() # utworzenie instacji aplikacji

# dołączenie routera z /analyze - endpoint staje się aktywny
app.include_router(analyzer_router)

# dekorator FastAPI
# jeśli ktoś wyśle żądanie POST na adres /parse i załączy plik — wykona się poniższa funkcja parse_pdf()
@app.post("/parse") # endpoint API typu POST
# parametr funkcji oznacza, że użytkownik przesyła plik
async def parse_pdf(file: UploadFile = File(...)): # File(...) - oczekujemy pliku "multipart/form-data"
    content = await file.read() # odczytywanie zawartości przesłanego pliku
    text = extract_text_from_pdf(content) # przekazanie bajtów pliku do naszej fukncji
    return {"text": text}