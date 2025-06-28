from fastapi import APIRouter
import os

from app.utils.ml_search import ml_search, DocumentRequest

router = APIRouter(prefix="/api/v1/search", tags=["search"])

ml_url: str = os.getenv("ML_URL") or ""
search_link = ml_url + "/semantic_search"


@router.post("/pdf_search")
async def pdf_search(request: DocumentRequest):
    response = ml_search(
        DocumentRequest(
            file_name=request.file_name,
            file_content=request.file_content,
            file_type="application/pdf",
            query=request.query,
        ),
        search_link,
    )
    return response


@router.post("/mp3_search")
async def mp3_search(request: DocumentRequest):
    response = ml_search(
        DocumentRequest(
            file_name=request.file_name,
            file_content=request.file_content,
            file_type="audio/mp3",
            query=request.query,
        ),
        search_link,
    )
    return response


@router.post("/mp4_search")
async def mp4_search(request: DocumentRequest):
    response = ml_search(
        DocumentRequest(
            file_name=request.file_name,
            file_content=request.file_content,
            file_type="video/mp4",
            query=request.query,
        ),
        search_link,
    )
    return response
