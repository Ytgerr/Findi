import requests
import base64
from pydantic import BaseModel


class MLSearchResponse(BaseModel):
    sentences: list[str]
    time_intervals: list[tuple[int, int]]


class DocumentRequest(BaseModel):
    file_name: str
    file_content: bytes
    file_type: str
    query: str


def ml_search(document_request: DocumentRequest, url: str) -> MLSearchResponse:
    response = requests.post(
        url,
        files={
            "file": (
                document_request.file_name,
                document_request.file_content,
                document_request.file_type,
            )
        },
        data={"query": document_request.query},
    )
    return MLSearchResponse(**response.json())

