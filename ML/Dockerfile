FROM python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg poppler-utils && \
    rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY uv.lock pyproject.toml /app/

RUN uv sync --frozen --no-cache

COPY . /app

RUN .venv/bin/python -m nltk.downloader --dir /app/nltk_data punkt
ENV NLTK_DATA=/app/nltk_data

RUN .venv/bin/python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('Snowflake/snowflake-arctic-embed-l-v2.0')"
RUN .venv/bin/python -c "import whisper; whisper.load_model('base')"

EXPOSE 8000

CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
