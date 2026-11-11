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
  3. UNIQUE(event_id, section, row_label, seat_number) stops duplicate seat
     rows from being created, so a seat can only exist (and be sold) once.
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
CREATE TABLE IF NOT EXISTS events (
    id         TEXT PRIMARY KEY,          -- same id the ECHO LIVE client and Booking Service use
    name       TEXT NOT NULL,
    venue      TEXT NOT NULL,
    starts_at  TEXT NOT NULL              -- ISO 8601, Malaysia time (UTC+8)
);

CREATE TABLE IF NOT EXISTS seats (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id     TEXT    NOT NULL REFERENCES events(id),
    section      TEXT    NOT NULL,         -- VVIP, VIP, PS1, CAT 3, FLOOR A, GA ...
    row_label    TEXT    NOT NULL,         -- A-Z, or GA for standing sections
    seat_number  INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 999),
    label        TEXT    NOT NULL,         -- "VIP-C-11": section-row-number
    status       TEXT    NOT NULL DEFAULT 'AVAILABLE'
                         CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED')),
    booking_id   TEXT,                     -- which booking holds / owns it
    held_at      TEXT,                     -- UTC timestamp of the hold
    version      INTEGER NOT NULL DEFAULT 0,
    UNIQUE (event_id, section, row_label, seat_number),
    UNIQUE (event_id, label)
);

CREATE INDEX IF NOT EXISTS idx_seats_booking ON seats (booking_id);
CREATE INDEX IF NOT EXISTS idx_seats_status  ON seats (status, held_at);

-- Append-only audit trail. Handy as evidence and for debugging.
CREATE TABLE IF NOT EXISTS seat_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id    TEXT    NOT NULL,
    seat_label  TEXT    NOT NULL,
    booking_id  TEXT,
    action      TEXT    NOT NULL,          -- HOLD / BOOK / CONFIRM / RELEASE / EXPIRE
    at          TEXT    NOT NULL
);
"""

# Seat inventory per venue. Section names match the ECHO LIVE client (client/app.js).
# True = standing section: one "GA" row with numbered admission.
VENUE_SECTIONS = {
    "Arena of Stars": [("VVIP", False), ("VIP", False), ("PS1", False), ("PS2", False),
                       ("PS3", False), ("PS4", False)],
    "Unifi Arena": [("VVIP", False), ("VIP", False), ("PS1", False), ("PS2", False),
                    ("PS3", False), ("PS4", False), ("GA", True)],
    "TM Stadium Nasional": [("FLOOR A", True), ("FLOOR B", True), ("FLOOR C", True)]
                           + [(f"CAT {n}", False) for n in range(1, 10)],
}
SEATED_ROWS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"   # the client lets sellers pick rows A-Z
SEATS_PER_ROW = 30
STANDING_CAPACITY = 200

# Event ids are the ones the client sends as eventId.
# Shows listed as "Time TBC" by the organiser use 20:00 as a placeholder.
SAMPLE_EVENTS = [
    ("priscilla-abby-genting-2026", "Priscilla Abby: 19+ Malaysia Concert 2026", "Arena of Stars", "2026-12-05T18:00:00+08:00"),
    ("yy-wong-genting-2026", "YY Wong & Equator: Live Concert 2026", "Arena of Stars", "2026-12-08T18:00:00+08:00"),
    ("yao-xiaotang-genting-2026", "Yao Xiaotang: Breaking Dawn Tour", "Arena of Stars", "2026-12-12T18:00:00+08:00"),
    ("jimmy-nicky-genting-2026", "Jimmy Lin x Nicky Lee: Concert 2.0", "Arena of Stars", "2026-12-19T18:00:00+08:00"),
    ("babymonster-unifi-2026-11-14", "BABYMONSTER: 2026-27 World Tour", "Unifi Arena", "2026-11-14T17:00:00+08:00"),
    ("mcr-tm-stadium-2026-11-19", "My Chemical Romance: Southeast Asia Tour 2026", "TM Stadium Nasional", "2026-11-19T20:00:00+08:00"),
    ("mcr-tm-stadium-2026-11-20", "My Chemical Romance: Southeast Asia Tour 2026", "TM Stadium Nasional", "2026-11-20T20:00:00+08:00"),
    ("bts-tm-stadium-2026-12-12", "BTS: World Tour Arirang", "TM Stadium Nasional", "2026-12-12T19:30:00+08:00"),
    ("bts-tm-stadium-2026-12-13", "BTS: World Tour Arirang", "TM Stadium Nasional", "2026-12-13T19:30:00+08:00"),
    ("westlife-unifi-2027-01-13", "Westlife: 25 The Anniversary World Tour", "Unifi Arena", "2027-01-13T20:00:00+08:00"),
    ("westlife-unifi-2027-01-14", "Westlife: 25 The Anniversary World Tour", "Unifi Arena", "2027-01-14T20:00:00+08:00"),
]


def make_label(section: str, row: str, number: int) -> str:
    """('VIP', 'C', 11) -> 'VIP-C-11', the format the Booking Service sends."""
    return f"{section}-{row}-{number}"


def venue_seats(venue: str):
    """Yield (section, row, number) for every seat in a venue."""
    for section, standing in VENUE_SECTIONS[venue]:
        if standing:
            for n in range(1, STANDING_CAPACITY + 1):
                yield section, "GA", n
        else:
            for row in SEATED_ROWS:
                for n in range(1, SEATS_PER_ROW + 1):
                    yield section, row, n


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
            "INSERT OR IGNORE INTO events (id, name, venue, starts_at) VALUES (?, ?, ?, ?)",
            SAMPLE_EVENTS,
        )
        for event_id, _, venue, _ in SAMPLE_EVENTS:
            conn.executemany(
                "INSERT OR IGNORE INTO seats (event_id, section, row_label, seat_number, label) "
                "VALUES (?, ?, ?, ?, ?)",
                [(event_id, sec, row, n, make_label(sec, row, n)) for sec, row, n in venue_seats(venue)],
            )
        conn.execute("COMMIT")
    finally:
        conn.close()


def log_events(conn: sqlite3.Connection, event_id: str, labels: list[str],
               booking_id: str | None, action: str) -> None:
    now = iso(utc_now())
    conn.executemany(
        "INSERT INTO seat_events (event_id, seat_label, booking_id, action, at) VALUES (?, ?, ?, ?, ?)",
        [(event_id, lbl, booking_id, action, now) for lbl in labels],
    )


def expire_stale_holds(conn: sqlite3.Connection) -> int:
    """Release HELD seats older than HOLD_TTL_SECONDS. Caller owns the txn.

    Only HELD seats expire. BOOKED seats (confirmed) are never touched.
    """
    cutoff = iso(utc_now() - timedelta(seconds=HOLD_TTL_SECONDS))
    stale = conn.execute(
        "SELECT event_id, label, booking_id FROM seats WHERE status = 'HELD' AND held_at < ?",
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
        log_events(conn, row["event_id"], [row["label"]], row["booking_id"], "EXPIRE")
    return len(stale)
