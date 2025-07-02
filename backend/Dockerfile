FROM python:3.13-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the application into the container.
COPY . /app

WORKDIR /app

RUN uv sync --frozen --no-cache

# Run the application.
CMD ["uv", "run", "fastapi", "dev", "app/main.py", "--port", "80", "--host", "0.0.0.0"]