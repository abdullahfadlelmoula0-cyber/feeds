"""
Add missing columns to existing SQLite DB (no Alembic).
Safe to run on every startup; only adds columns that don't exist.
"""
from sqlalchemy import text

from .database import engine


def _get_columns(conn, table: str) -> set:
    result = conn.execute(text(f"PRAGMA table_info({table})"))
    return {row[1] for row in result}


def migrate():
    with engine.connect() as conn:
        # reservations: unit_price, total_price
        try:
            cols = _get_columns(conn, "reservations")
            if "unit_price" not in cols:
                conn.execute(text("ALTER TABLE reservations ADD COLUMN unit_price REAL DEFAULT 0"))
            if "total_price" not in cols:
                conn.execute(text("ALTER TABLE reservations ADD COLUMN total_price REAL DEFAULT 0"))
            conn.commit()
        except Exception:
            conn.rollback()

        # feed_types: price
        try:
            cols = _get_columns(conn, "feed_types")
            if "price" not in cols:
                conn.execute(text("ALTER TABLE feed_types ADD COLUMN price REAL DEFAULT 0"))
                conn.commit()
        except Exception:
            conn.rollback()
