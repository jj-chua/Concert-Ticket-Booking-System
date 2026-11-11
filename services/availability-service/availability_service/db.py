"""
Data access layer for the Availability Service.

Owner: Allen (Member 1)

All seat state lives in one SQLite file (availability.db). Only this service
opens that file. Other services ask for seat changes over HTTP, so there is
exactly one place where the "can this seat still be taken?" decision is made.

Concurrency control (see report Section 6.1):
  1. Every write runs inside BEGIN IMMEDIATE. SQLite grants the single
     RESERVED (write) lock at the start of the transaction, so two writers
     can never interleave their read-check-write steps.
  2. The UPDATE itself is conditional: "... WHERE status = 'AVAILABLE'".
     The number of rows changed tells us whether every requested seat was
     still free. If not, we roll back, so a multi-seat hold is all-or-nothing.
  3. UNIQUE(showtime_id, row_label, seat_number) stops duplicate seat rows
     from being created, so a seat can only exist (and be sold) once.
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterator

DB_PATH = Path(os.getenv("AVAILABILITY_DB", Path(__file__).with_name("availability.db")))
HOLD_TTL_SECONDS = int(os.getenv("HOLD_TTL_SECONDS", "300"))  # 5 minutes

SCHEMA = """
CREATE TABLE IF NOT EXISTS showtimes (
    id          INTEGER PRIMARY KEY,
    movie_title TEXT    NOT NULL,
    hall_name   TEXT    NOT NULL,
    start_time  TEXT    NOT NULL          -- ISO 8601, UTC+8 local time
);

CREATE TABLE IF NOT EXISTS seats (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    showtime_id  INTEGER NOT NULL REFERENCES showtimes(id),
    row_label    TEXT    NOT NULL,
    seat_number  INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 50),
    status       TEXT    NOT NULL DEFAULT 'AVAILABLE'
                         CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED')),
    booking_id   TEXT,                     -- which booking holds / owns it
    held_at      TEXT,                     -- UTC timestamp of the hold
    version      INTEGER NOT NULL DEFAULT 0,
    UNIQUE (showtime_id, row_label, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_booking ON seats (booking_id);
CREATE INDEX IF NOT EXISTS idx_seats_status  ON seats (status, held_at);

-- Append-only audit trail. Handy as evidence and for debugging.
CREATE TABLE IF NOT EXISTS seat_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    showtime_id INTEGER NOT NULL,
    seat_label  TEXT    NOT NULL,
    booking_id  TEXT,
    action      TEXT    NOT NULL,          -- HOLD / CONFIRM / RELEASE / EXPIRE
    at          TEXT    NOT NULL
);
"""

SAMPLE_SHOWTIMES = [
    (1, "The Last Orbit", "Hall 1", "2026-11-20T19:30:00+08:00"),
    (2, "Monsoon Letters", "Hall 2", "2026-11-20T21:00:00+08:00"),
]
ROWS = "ABCDEF"
SEATS_PER_ROW = 8


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat(timespec="milliseconds")


def connect() -> sqlite3.Connection:
    """Open a new connection. One connection per request keeps threads apart."""
    conn = sqlite3.connect(DB_PATH, timeout=10, isolation_level=None)  # manual txns
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")    # readers never block the writer
    conn.execute("PRAGMA busy_timeout = 10000")  # wait for the write lock, don't fail
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def write_txn() -> Iterator[sqlite3.Connection]:
    """BEGIN IMMEDIATE ... COMMIT, with rollback on any exception."""
    conn = connect()
    try:
        conn.execute("BEGIN IMMEDIATE")
        yield conn
        conn.execute("COMMIT")
    except BaseException:
        if conn.in_transaction:
            conn.execute("ROLLBACK")
        raise
    finally:
        conn.close()


@contextmanager
def read_conn() -> Iterator[sqlite3.Connection]:
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


def init_db(reset: bool = False) -> None:
    """Create tables and load sample data (idempotent)."""
    if reset and DB_PATH.exists():
        for suffix in ("", "-wal", "-shm"):
            p = Path(str(DB_PATH) + suffix)
            if p.exists():
                p.unlink()
    conn = connect()
    try:
        conn.executescript(SCHEMA)
        conn.execute("BEGIN IMMEDIATE")
        conn.executemany(
            "INSERT OR IGNORE INTO showtimes (id, movie_title, hall_name, start_time) VALUES (?, ?, ?, ?)",
            SAMPLE_SHOWTIMES,
        )
        for showtime_id, *_ in SAMPLE_SHOWTIMES:
            conn.executemany(
                "INSERT OR IGNORE INTO seats (showtime_id, row_label, seat_number) VALUES (?, ?, ?)",
                [(showtime_id, r, n) for r in ROWS for n in range(1, SEATS_PER_ROW + 1)],
            )
        conn.execute("COMMIT")
    finally:
        conn.close()


def split_label(label: str) -> tuple[str, int]:
    """'C4' -> ('C', 4)"""
    return label[0], int(label[1:])


def log_events(conn: sqlite3.Connection, showtime_id: int, labels: list[str],
               booking_id: str | None, action: str) -> None:
    now = iso(utc_now())
    conn.executemany(
        "INSERT INTO seat_events (showtime_id, seat_label, booking_id, action, at) VALUES (?, ?, ?, ?, ?)",
        [(showtime_id, lbl, booking_id, action, now) for lbl in labels],
    )


def expire_stale_holds(conn: sqlite3.Connection) -> int:
    """Release HELD seats older than HOLD_TTL_SECONDS. Caller owns the txn."""
    cutoff = iso(utc_now() - timedelta(seconds=HOLD_TTL_SECONDS))
    stale = conn.execute(
        "SELECT showtime_id, row_label || seat_number AS label, booking_id "
        "FROM seats WHERE status = 'HELD' AND held_at < ?",
        (cutoff,),
    ).fetchall()
    if not stale:
        return 0
    conn.execute(
        "UPDATE seats SET status = 'AVAILABLE', booking_id = NULL, held_at = NULL, "
        "version = version + 1 WHERE status = 'HELD' AND held_at < ?",
        (cutoff,),
    )
    for row in stale:
        log_events(conn, row["showtime_id"], [row["label"]], row["booking_id"], "EXPIRE")
    return len(stale)
