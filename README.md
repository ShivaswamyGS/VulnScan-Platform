# VulnTriage — AI-Based Vulnerability Triage Platform

A private, internal bug-bounty platform where security testers submit vulnerability
reports and an AI model (TF-IDF + Multinomial Naive Bayes, trained on NVD data)
automatically estimates severity to help administrators triage faster.

This README documents how the four pieces — **frontend**, **backend**, **AI module**,
and **database** — connect, and how to run the whole stack locally.

---

## How the pieces connect

```
┌─────────────┐  HTTPS/JSON+multipart   ┌──────────────┐   SQLAlchemy    ┌────────────┐
│   frontend    │ ──────────────────────▶ │   backend    │ ───────────────▶ │ PostgreSQL │
│ React+Vite+TS │ ◀────────────────────── │  FastAPI     │ ◀─────────────── │            │
└─────────────┘      JWT-authenticated    └──────┬───────┘                 └────────────┘
                                                    │ imports
                                                    ▼
                                            ┌──────────────┐
                                            │   ai module   │
                                            │ preprocessing │
                                            │ model.pkl     │
                                            │ tfidf.pkl     │
                                            └──────────────┘
```

- **frontend ↔ backend**: the frontend calls the REST API at `VITE_API_BASE_URL`
  (see `frontend/.env.example`), attaching the JWT from login on every request
  (`frontend/src/api/client.ts`). The backend's `CORS_ORIGINS` setting
  (`backend/.env.example`) must include the frontend's dev URL — by default
  both are pre-configured for `http://localhost:5173` ↔ `http://localhost:8000`.
- **backend ↔ database**: SQLAlchemy models (`backend/app/models/`) map to 5
  tables (users, statuses, reports, predictions, audit_logs), managed via Alembic
  migrations (`backend/alembic/`). Connection string lives in `DATABASE_URL`.
- **backend ↔ ai module**: `backend/app/services/ml_service.py` imports
  `ai/src/preprocessing.py` directly (same code used at training time, so
  training and inference never drift apart) and loads `ai/artifacts/model.pkl`
  + `tfidf.pkl` once at process startup. `ML_MODEL_PATH`/`ML_VECTORIZER_PATH`
  in the backend's `.env` point at these files.

Because the `ai/` package sits as a **sibling** of `backend/` (not inside it),
`ml_service.py` adds the project root to `sys.path` at import time so this works
regardless of which directory you launch uvicorn from.

---

## Running everything locally with Docker (recommended)

The whole stack — database, backend, AI model, frontend — runs with **one command**:

```bash
cp .env.example .env
# Edit .env: set a real SECRET_KEY (e.g. python3 -c "import secrets; print(secrets.token_urlsafe(32))")
# and a real POSTGRES_PASSWORD.

docker compose up --build
```

Then visit:
- Frontend: **http://localhost:5173**
- Backend API docs: **http://localhost:8000/docs**

First run takes a few minutes — it builds the backend image (installing Python
deps, pre-downloading NLTK corpora), the frontend image (npm install + Vite
build), and on first container start, since no trained model exists yet, it
automatically trains one on the synthetic sample dataset so the app is usable
immediately. Point the backend at a real NVD feed and retrain (see the AI
module section below) before using this for anything beyond a demo.

Data persists across `docker compose down` / `up` cycles in three named
volumes: `postgres_data`, `uploads_data`, `ai_artifacts`. Use
`docker compose down -v` to wipe everything and start fresh.

**A note on how this was verified:** the sandbox this project was built in
blocks outbound access to Docker Hub's registry, so `docker compose up` itself
couldn't be run end-to-end here. What WAS verified directly: `docker compose
config` validates the full compose schema and variable interpolation without
error, and the custom entrypoint logic (wait-for-database, run migrations,
seed defaults, train-if-missing) was tested line-by-line against a real local
PostgreSQL instance outside of Docker. The Dockerfiles themselves follow
standard, widely-used patterns (multi-stage Node→Nginx build for the
frontend, slim Python base + pinned deps for the backend) — but you should
still run `docker compose up --build` yourself as the final confirmation on
your own machine.

## Running everything locally without Docker

If you'd rather run each piece directly (e.g. for active development):

### 1. Database (PostgreSQL)

```bash
# Install and start Postgres (skip if you already have one running)
sudo apt-get install postgresql
sudo service postgresql start

sudo -u postgres psql -c "CREATE USER vulntriage_user WITH PASSWORD 'localdevpass';"
sudo -u postgres psql -c "CREATE DATABASE vulntriage OWNER vulntriage_user;"
```

### 2. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set a real SECRET_KEY, confirm DATABASE_URL matches step 1

alembic upgrade head          # creates all 5 tables
python -m app.db.seed          # seeds default statuses (Open, In Review, ...)
python -m app.db.create_admin --email admin@company.com --name "Admin" --password "ChangeMe123!"

uvicorn app.main:app --reload --port 8000
```
Visit `http://localhost:8000/docs` for interactive Swagger docs.

### 3. AI model

The backend won't produce predictions until trained artifacts exist. Run this
from the **project root** (not from inside `ai/`) — `train.py` imports itself
as `ai.src.train`, which requires the project root on the Python path:

```bash
cd vulnscan-platform          # project root
pip install -r ai/requirements.txt
python -m ai.src.train              # dev/demo mode: trains on a synthetic sample dataset
# OR, for the real deployment:
python -m ai.src.train --feed dataset/raw/nvdcve-2.0-2024.json   # a real downloaded NVD feed
```
This writes `ai/artifacts/model.pkl`, `tfidf.pkl`, and `metadata.json`.

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # defaults already point at http://localhost:8000/api/v1
npm run dev
```
Visit `http://localhost:5173`.

---

## Verified integration points

The following were tested end-to-end against a **real PostgreSQL 16 instance**
(not just SQLite) during development, using FastAPI's TestClient to drive the
actual application code:

- Alembic migrations apply cleanly to Postgres, creating all 5 tables + enum types.
- Full flow: register → login → submit report → real ML inference → prediction
  stored → retrievable via the API.
- CORS: preflight and actual requests from `http://localhost:5173` are allowed;
  requests from an arbitrary, non-whitelisted origin are correctly rejected.
- Attachment upload/download: files are stored under randomized names and can
  only be downloaded by the report's owner or an admin (403 for anyone else).

## Project structure

```
vulnscan-platform/
├── frontend/       React + Vite + TypeScript SPA
├── backend/        FastAPI REST API
├── ai/             NLP preprocessing, training pipeline, trained model artifacts
├── dataset/        Raw/processed NVD data (gitignored; regenerated by ai/src/train.py)
├── documentation/  Architecture notes
└── uploads/        Report attachments (gitignored)
```

See each module's own code comments for detailed design rationale — the codebase
was built incrementally, module by module, with design decisions documented
inline rather than only in this README.
