from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/feedbacks", tags=["feedbacks"])


class Feedback(BaseModel):
    comment: str
    rating: int


@router.post("/send_feedback")
async def send_feedback(request: Feedback):
    return {"message": "Feedback received"}
