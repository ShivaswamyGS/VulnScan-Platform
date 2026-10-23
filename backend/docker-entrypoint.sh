#!/bin/sh
# Container entrypoint: wait for the database, run migrations, seed
# defaults, train a fallback model if none exists yet, then start the server.
set -e

echo "Waiting for database to accept connections..."
python - <<'PYEOF'
import sys
import time

from sqlalchemy import create_engine, text

from app.core.config import settings

for attempt in range(30):
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready.")
        sys.exit(0)
    except Exception as exc:  # noqa: BLE001 - intentionally broad: any failure means "not ready yet"
        print(f"Database not ready yet ({exc.__class__.__name__}), retrying... ({attempt + 1}/30)")
        time.sleep(2)

print("Database did not become ready in time.")
sys.exit(1)
PYEOF

echo "Running database migrations..."
alembic upgrade head

echo "Seeding default statuses (idempotent)..."
python -m app.db.seed

if [ ! -f "../ai/artifacts/model.pkl" ]; then
  echo "No trained model found at ai/artifacts/model.pkl."
  echo "Training on the synthetic sample dataset (dev/demo mode) so the app is usable out of the box."
  echo "For a real deployment, mount a real NVD feed and run: python -m ai.src.train --feed <path>"
  (cd .. && python -m ai.src.train)
fi

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
