# Findi: Semantic Search Platform for Audio, Video, and PDF

Платформа семантического поиска для аудио, видео и PDF файлов с использованием машинного обучения.

## Архитектура

- **Frontend**: React + Vite приложение
- **Backend**: FastAPI сервер  
- **ML**: Сервис машинного обучения для семантического поиска
- **Docker**: Контейнеризация всех компонентов

## Запуск приложения

### Вариант 1 (Временный): Ручной запуск

1. **ML сервис**:
```bash
cd ML
docker build -t findi-ml .
docker run -p 8000:8000 findi-ml
```

2. **Backend сервис**:
```bash
cd backend
uv run fastapi dev --port 8001
```

3. **Frontend (dev режим)**:
```bash
cd frontend
npm install
npm run dev
```

## Доступ к сервисам

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8001
- **ML API**: http://localhost:8000

## Требования

- Docker и Docker Compose
- Node.js 16+ (для разработки frontend)
- Python 3.8+ и uv (для разработки backend)
- Git