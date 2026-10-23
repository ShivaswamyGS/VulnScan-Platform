# Build context is the PROJECT ROOT (not backend/), because the backend
# imports the sibling `ai/` package directly (see app/services/ml_service.py)
# to guarantee training and inference use identical preprocessing code.
#
# Build with:  docker build -f backend/Dockerfile -t vulntriage-backend .
# (docker-compose.yml sets this up automatically)

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# libpq5 is needed at runtime for psycopg2 even though psycopg2-binary
# bundles its own libpq at install time on most platforms.
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend-requirements.txt
COPY ai/requirements.txt ./ai-requirements.txt
RUN pip install --no-cache-dir -r backend-requirements.txt -r ai-requirements.txt

# ai/ and backend/ preserved as siblings, matching the project's real layout.
COPY ai/ ./ai/
COPY backend/ ./backend/

# Pre-download NLTK corpora at BUILD time (not first request) so the
# container doesn't need outbound network access at runtime, and so
# container startup is fast and deterministic.
RUN python -c "from ai.src.preprocessing import ensure_nltk_resources; ensure_nltk_resources()"

WORKDIR /app/backend
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
