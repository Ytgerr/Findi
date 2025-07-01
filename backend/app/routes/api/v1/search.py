from fastapi import APIRouter, UploadFile, File, Form
import os

from app.utils.ml_search import ml_search, DocumentRequest

router = APIRouter(prefix="/api/v1/search", tags=["search"])

ml_url: str = os.getenv("ML_URL") or ""
search_link = "http://localhost:8000" + "/semantic-search/"


@router.post("/pdf_search")
async def pdf_search(
    file: UploadFile = File(...),
    query: str = Form(...)
):
    file_content = await file.read()
    with open("document.pdf", "wb") as f:
        f.write(file_content)
    
    response = ml_search(
        DocumentRequest(
            file_name=file.filename or "document.pdf",
            file_content=file_content,
            file_type="application/pdf",
            query=query,
        ),
        search_link,
    )
    return response


@router.post("/mp3_search")
async def mp3_search(
    file: UploadFile = File(...),
    query: str = Form(...)
):
    file_content = await file.read()
    
    response = ml_search(
        DocumentRequest(
            file_name=file.filename or "audio.mp3",
            file_content=file_content,
            file_type="audio/mp3",
            query=query,
        ),
        search_link,
    )
    return response


@router.post("/mp4_search")
async def mp4_search(
    file: UploadFile = File(...),
    query: str = Form(...)
):
    file_content = await file.read()
    
    response = ml_search(
        DocumentRequest(
            file_name=file.filename or "video.mp4",
            file_content=file_content,
            file_type="video/mp4",
            query=query,
        ),
        search_link,
    )
    return response
