import fastapi

from app.routes.root import router as root_router
from app.routes.api.v1.search import router as search_router
from app.routes.api.v1.feedbacks import router as feedbacks_router

app = fastapi.FastAPI()

app.include_router(root_router)
app.include_router(search_router)
app.include_router(feedbacks_router)
