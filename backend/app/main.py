import fastapi
from app.routes.root import router as root_router

app = fastapi.FastAPI()

app.include_router(root_router)
