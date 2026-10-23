from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    tables = db.execute(
        text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
    ).fetchall()

    print("DATABASE TABLES:")
    for table in tables:
        print("-", table[0])

finally:
    db.close()
