from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

tables = [
    "users",
    "companies",
    "projects",
    "assets",
    "vulnerability_submissions",
    "reports",
    "notifications",
    "audit_logs",
]

try:
    for table in tables:
        print("\n" + "=" * 70)
        print(f"{table.upper()}")

        rows = db.execute(
            text(f"SELECT * FROM {table}")
        ).fetchall()

        print(f"TOTAL ROWS: {len(rows)}")

        if rows:
            for row in rows:
                print(row)
        else:
            print("No data stored.")

finally:
    db.close()