FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./

# An empty value makes the browser call the API on its current domain.
ENV VITE_API_URL=""
RUN npm run build

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ffmpeg libgomp1 libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
# Some legacy audio dependencies still import ``pkg_resources`` while building.
# Keep a compatible setuptools release available and disable isolated builds so
# that those packages use it instead of the newest build environment.
RUN pip install --no-cache-dir --upgrade "setuptools<81" wheel \
    && pip install --no-cache-dir --no-build-isolation -r requirements.txt

COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./static

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "1", "--threads", "4", "--timeout", "180", "app:app"]
