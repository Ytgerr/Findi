from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .app_state import init_models
from .search import similarity_search
from .document_preprocessing import preprocessing

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_models(app)
    yield

app.router.lifespan_context = lifespan

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/semantic-search/")
async def semantic_search(
        file: UploadFile = File(...),
        query: str = Form(...),
        type: str = Form(...)):
    
    content = await file.read()
    audio_model = app.state.audio_model
    data = preprocessing(content, type, audio_model)
    text_data = "\n".join(data["sentences"].tolist())
    embed_model = app.state.embed_model
    
    result = similarity_search(text_data, query, embed_model)
        
    return result
