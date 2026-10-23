from app.db.session import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending'"))
    conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS approval_reason VARCHAR(500)"))
    conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE"))

print("COMPANY APPROVAL COLUMNS ADDED")
