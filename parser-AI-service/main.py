from fastapi import FastAPI, UploadFile, File

from analyzer import router as analyzer_router
from parsers.pdf_parser import extract_text_from_pdf

app = FastAPI()
app.include_router(analyzer_router)


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "parser-service"}


@app.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text_from_pdf(content)
    return {"text": text}
