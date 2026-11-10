import os
import sqlite3
import logging

logger = logging.getLogger("booking-db")
DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "bookings.db"))

def get_connection():
    """
    Returns an SQLite connection configured with WAL (Write-Ahead Logging) mode
    for safe concurrent reading and writing.
    """
    conn = sqlite3.connect(DB_PATH, timeout=10.0, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db(reset: bool = False):
    """
    Initializes the bookings and idempotency tables.
    """
    conn = get_connection()
    cursor = conn.cursor()

    if reset:
        cursor.execute("DROP TABLE IF EXISTS idempotency_records;")
        cursor.execute("DROP TABLE IF EXISTS bookings;")

    # 1. Bookings Table (Stores the full transaction lifecycle)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        event_id TEXT NOT NULL,
        event_name TEXT,
        venue TEXT,
        date TEXT,
        time TEXT,
        section TEXT,
        row TEXT,
        ticket_type TEXT,
        listing_id TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        customer_name TEXT,
        customer_email TEXT,
        seat_ids TEXT,
        total REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, FAILED
        idempotency_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Idempotency Records Table (Stores SHA-256 hash and response cache)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS idempotency_records (
        idempotency_key TEXT PRIMARY KEY,
        request_hash TEXT NOT NULL,
        response_code INTEGER NOT NULL,
        response_body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.close()
    logger.info("Bookings database schema initialized.")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
