# Findi ML microservice

A microservice for semantic search and document processing (PDF, video, audio) using FastAPI.

## Quick Start

### 1. Local Run

1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/) if you haven't already:
    ```bash
    pip install uv
    ```

2. Sync dependencies from `uv.lock`:
    ```bash
    uv sync
    ```

3. Start the service:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

### 2. Run with Docker

1. Build the image:
    ```bash
    docker build -t findi-ml .
    ```

2. Run the container:
    ```bash
    docker run -p 8000:8000 findi-ml
    ```

### 3. Example Request

#### Using Python Script

Run:
```bash
python app/demo_example.py
```

#### Using curl

```bash
curl -F "file=@datasets/video_2025-06-28_19-38-32.mp4" \
     -F "query=Will my friend be drafted into the army?" \
     -F "types=mp4" \
     http://localhost:8000/semantic-search/
```

## Project Structure

- `main.py` — main FastAPI application file
- `app_state.py` - initialized models
- `document_preprocessing.py` — document and media processing
- `search.py` — search logic
- `demo_example.py` — example client request
- `datasets/` — test data (PDF, video, etc.)

## Dependencies

- All dependencies and their versions are locked in `uv.lock` (and described in `pyproject.toml`).
- For video and PDF processing, `ffmpeg` and `poppler-utils` must be installed inside the container (handled in the Dockerfile).

