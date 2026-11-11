"""
Automated tests for the Availability Service (Allen, Member 1).

Run:  python -m pytest tests/test_availability.py -v

Most tests use FastAPI's in-process TestClient. The concurrency test starts
a real uvicorn server on a free port and fires parallel HTTP requests at it,
so it exercises the same network path as the live system.
"""

import os
import socket
import tempfile
import threading
import time
import uuid
from pathlib import Path

import httpx
import pytest

TMP = Path(tempfile.mkdtemp(prefix="avail-test-"))
os.environ["AVAILABILITY_DB"] = str(TMP / "test_availability.db")
os.environ["LOG_DIR"] = str(TMP)
os.environ["SERVICE_API_KEY"] = "test-key"

import uvicorn  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from availability_service import app as app_module  # noqa: E402
from availability_service import db  # noqa: E402

KEY = {"X-Service-Key": "test-key"}


@pytest.fixture()
def client():
    db.init_db(reset=True)
    with TestClient(app_module.app) as c:
        yield c


def hold(c, seats, booking=None, showtime=1):
    booking = booking or str(uuid.uuid4())
    return c.post("/seats/hold", json={"showtime_id": showtime, "seats": seats, "booking_id": booking}, headers=KEY), booking


def status_of(c, seat, showtime=1):
    seats = c.get(f"/showtimes/{showtime}/seats").json()["seats"]
    return next(s["status"] for s in seats if s["seat"] == seat)


# ------------------------------------------------------------------ FR1 view availability
def test_seat_map_lists_48_available_seats(client):
    r = client.get("/showtimes/1/seats")
    assert r.status_code == 200
    seats = r.json()["seats"]
    assert len(seats) == 48
    assert all(s["status"] == "AVAILABLE" for s in seats)
    assert "booking_id" not in seats[0]  # data protection: owner never exposed


def test_unknown_showtime_returns_404(client):
    assert client.get("/showtimes/999/seats").status_code == 404


# ------------------------------------------------------------------ FR2 / FR3 hold + conflict
def test_hold_then_conflict(client):
    r1, _ = hold(client, ["C4"])
    assert r1.status_code == 200 and r1.json()["status"] == "HELD"
    r2, _ = hold(client, ["C4"])
    assert r2.status_code == 409
    assert r2.headers["content-type"].startswith("application/problem+json")
    assert r2.json()["unavailable_seats"] == ["C4"]


def test_multi_seat_hold_is_all_or_nothing(client):
    hold(client, ["C4"])
    r, _ = hold(client, ["C3", "C4", "C5"])
    assert r.status_code == 409
    # C3 and C5 must NOT stay held after the rollback
    assert status_of(client, "C3") == "AVAILABLE"
    assert status_of(client, "C5") == "AVAILABLE"


def test_same_booking_retry_is_idempotent(client):
    r1, b = hold(client, ["D1", "D2"])
    r2, _ = hold(client, ["D1", "D2"], booking=b)
    assert r1.status_code == r2.status_code == 200
    assert r2.json()["replayed"] is True


# ------------------------------------------------------------------ FR4 confirm, FR6 release
def test_confirm_and_release_cycle(client):
    _, b = hold(client, ["E5"])
    body = {"showtime_id": 1, "seats": ["E5"], "booking_id": b}
    assert client.post("/seats/confirm", json=body, headers=KEY).json()["status"] == "BOOKED"
    assert status_of(client, "E5") == "BOOKED"
    r = client.post("/seats/release", json={"showtime_id": 1, "booking_id": b}, headers=KEY)
    assert r.json()["released"] == ["E5"]
    assert status_of(client, "E5") == "AVAILABLE"
    # releasing twice is harmless
    assert client.post("/seats/release", json={"showtime_id": 1, "booking_id": b}, headers=KEY).status_code == 200


def test_confirm_without_hold_is_rejected(client):
    body = {"showtime_id": 1, "seats": ["F8"], "booking_id": str(uuid.uuid4())}
    assert client.post("/seats/confirm", json=body, headers=KEY).status_code == 409


def test_expired_hold_is_released(client):
    _, b = hold(client, ["A1"])
    old = db.iso(db.utc_now().replace(year=2020))
    with db.write_txn() as conn:  # pretend the hold is ancient
        conn.execute("UPDATE seats SET held_at = ? WHERE booking_id = ?", (old, b))
    r, _ = hold(client, ["A1"])  # lazy expiry runs inside this request
    assert r.status_code == 200


# ------------------------------------------------------------------ NFR4 security
@pytest.mark.parametrize("body", [
    {"showtime_id": 1, "seats": ["Z99"], "booking_id": str(uuid.uuid4())},                       # bad label
    {"showtime_id": 1, "seats": ["A1", "A1"], "booking_id": str(uuid.uuid4())},                  # duplicate seat
    {"showtime_id": 1, "seats": [f"A{i}" for i in range(1, 8)], "booking_id": str(uuid.uuid4())},  # > 6 seats
    {"showtime_id": 1, "seats": ["A1"], "booking_id": "not-a-uuid"},
    {"showtime_id": -1, "seats": ["A1"], "booking_id": str(uuid.uuid4())},
    {"showtime_id": 1, "seats": ["A1'; DROP TABLE seats;--"], "booking_id": str(uuid.uuid4())},
])
def test_invalid_input_rejected_with_422(client, body):
    assert client.post("/seats/hold", json=body, headers=KEY).status_code == 422


def test_write_needs_service_key(client):
    body = {"showtime_id": 1, "seats": ["B2"], "booking_id": str(uuid.uuid4())}
    assert client.post("/seats/hold", json=body).status_code == 401
    assert client.post("/seats/hold", json=body, headers={"X-Service-Key": "wrong"}).status_code == 401


# ------------------------------------------------------------------ concurrency over real HTTP
def _free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


@pytest.fixture()
def live_server():
    db.init_db(reset=True)
    port = _free_port()
    server = uvicorn.Server(uvicorn.Config(app_module.app, host="127.0.0.1", port=port, log_level="warning"))
    t = threading.Thread(target=server.run, daemon=True)
    t.start()
    for _ in range(50):
        try:
            httpx.get(f"http://127.0.0.1:{port}/health", timeout=0.5)
            break
        except httpx.HTTPError:
            time.sleep(0.1)
    yield f"http://127.0.0.1:{port}"
    server.should_exit = True
    t.join(timeout=5)


@pytest.mark.parametrize("n", [20])
def test_parallel_requests_same_seat_only_one_wins(live_server, n):
    barrier = threading.Barrier(n)
    results = []

    def worker():
        body = {"showtime_id": 1, "seats": ["C4"], "booking_id": str(uuid.uuid4())}
        barrier.wait()  # release all threads at the same moment
        r = httpx.post(f"{live_server}/seats/hold", json=body, headers=KEY, timeout=15)
        results.append(r.status_code)

    threads = [threading.Thread(target=worker) for _ in range(n)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert results.count(200) == 1
    assert results.count(409) == n - 1
    with db.read_conn() as conn:
        holders = conn.execute("SELECT COUNT(DISTINCT booking_id) FROM seats WHERE row_label='C' AND seat_number=4 "
                               "AND showtime_id=1 AND status='HELD'").fetchone()[0]
    assert holders == 1
