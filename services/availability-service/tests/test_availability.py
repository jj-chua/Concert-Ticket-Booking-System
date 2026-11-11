"""
Automated tests for the Availability Service (Allen, Member 1).

Run from services/availability-service/:
    python -m pytest tests/test_availability.py -v

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
EVENT = "priscilla-abby-genting-2026"          # Arena of Stars: 6 sections x 26 rows x 30 seats
STADIUM_EVENT = "bts-tm-stadium-2026-12-12"    # TM Stadium Nasional: FLOOR A-C standing + CAT 1-9


@pytest.fixture()
def client():
    db.init_db(reset=True)
    with TestClient(app_module.app) as c:
        yield c


def hold(c, seats, booking=None, event=EVENT, **extra):
    booking = booking or str(uuid.uuid4())
    body = {"event_id": event, "seats": seats, "booking_id": booking, **extra}
    return c.post("/seats/hold", json=body, headers=KEY), booking


def status_of(c, seat, event=EVENT):
    section, row, _ = seat.rsplit("-", 2)
    seats = c.get(f"/events/{event}/seats", params={"section": section, "row": row}).json()["seats"]
    return next(s["status"] for s in seats if s["seat"] == seat)


# ------------------------------------------------------------------ FR1 view availability
def test_event_list_matches_client_events(client):
    events = client.get("/events").json()
    assert len(events) == 11
    abby = next(e for e in events if e["id"] == EVENT)
    assert abby["venue"] == "Arena of Stars"
    assert abby["available"] == abby["total"] == 6 * 26 * 30


def test_seat_map_can_be_filtered_by_section_and_row(client):
    r = client.get(f"/events/{EVENT}/seats", params={"section": "vip", "row": "c"})
    assert r.status_code == 200
    seats = r.json()["seats"]
    assert len(seats) == 30
    assert seats[0]["seat"] == "VIP-C-1"
    assert all(s["status"] == "AVAILABLE" for s in seats)
    assert "booking_id" not in seats[0]  # data protection: owner never exposed


def test_unknown_event_returns_404(client):
    assert client.get("/events/no-such-show/seats").status_code == 404
    r, _ = hold(client, ["VIP-C-1"], event="no-such-show")
    assert r.status_code == 404


def test_unknown_seat_returns_404(client):
    r, _ = hold(client, ["VIP-C-31"])  # rows have 30 seats
    assert r.status_code == 404
    assert r.json()["seats"] == ["VIP-C-31"]


# ------------------------------------------------------------------ FR2 / FR3 hold + conflict
def test_hold_then_conflict(client):
    r1, _ = hold(client, ["VIP-C-11"])
    assert r1.status_code == 200 and r1.json()["status"] == "HELD"
    r2, _ = hold(client, ["VIP-C-11"])
    assert r2.status_code == 409
    assert r2.headers["content-type"].startswith("application/problem+json")
    assert r2.json()["unavailable_seats"] == ["VIP-C-11"]


def test_multi_seat_hold_is_all_or_nothing(client):
    hold(client, ["VIP-C-11"])
    r, _ = hold(client, ["VIP-C-10", "VIP-C-11", "VIP-C-12"])
    assert r.status_code == 409
    # VIP-C-10 and VIP-C-12 must NOT stay held after the rollback
    assert status_of(client, "VIP-C-10") == "AVAILABLE"
    assert status_of(client, "VIP-C-12") == "AVAILABLE"


def test_same_booking_retry_is_idempotent(client):
    r1, b = hold(client, ["PS1-F-17", "PS1-F-18"])
    r2, _ = hold(client, ["PS1-F-17", "PS1-F-18"], booking=b)
    assert r1.status_code == r2.status_code == 200
    assert r2.json()["replayed"] is True


def test_standing_and_category_labels(client):
    r, _ = hold(client, ["FLOOR A-GA-1", "CAT 3-B-7"], event=STADIUM_EVENT)
    assert r.status_code == 200
    assert r.json()["seats"] == ["CAT 3-B-7", "FLOOR A-GA-1"]


# ------------------------------------------------------------------ FR4 confirm, FR6 release
def test_confirm_and_release_cycle(client):
    _, b = hold(client, ["VVIP-A-5"])
    body = {"event_id": EVENT, "seats": ["VVIP-A-5"], "booking_id": b}
    assert client.post("/seats/confirm", json=body, headers=KEY).json()["status"] == "BOOKED"
    assert status_of(client, "VVIP-A-5") == "BOOKED"
    r = client.post("/seats/release", json={"event_id": EVENT, "booking_id": b}, headers=KEY)
    assert r.json()["released"] == ["VVIP-A-5"]
    assert status_of(client, "VVIP-A-5") == "AVAILABLE"
    # releasing twice is harmless
    assert client.post("/seats/release", json={"event_id": EVENT, "booking_id": b}, headers=KEY).status_code == 200


def test_confirm_without_hold_is_rejected(client):
    body = {"event_id": EVENT, "seats": ["PS4-Z-30"], "booking_id": str(uuid.uuid4())}
    assert client.post("/seats/confirm", json=body, headers=KEY).status_code == 409


def test_expired_hold_is_released(client):
    _, b = hold(client, ["VIP-A-1"])
    old = db.iso(db.utc_now().replace(year=2020))
    with db.write_txn() as conn:  # pretend the hold is ancient
        conn.execute("UPDATE seats SET held_at = ? WHERE booking_id = ?", (old, b))
    r, _ = hold(client, ["VIP-A-1"])  # lazy expiry runs inside this request
    assert r.status_code == 200


def test_hold_with_confirm_books_in_one_step_and_never_expires(client):
    r, b = hold(client, ["VIP-B-5", "VIP-B-6"], confirm=True)
    assert r.status_code == 200 and r.json()["status"] == "BOOKED"
    old = db.iso(db.utc_now().replace(year=2020))
    with db.write_txn() as conn:
        conn.execute("UPDATE seats SET held_at = ? WHERE booking_id = ?", (old, b))
    r2, _ = hold(client, ["VIP-B-5"])  # expiry only frees HELD seats, never BOOKED ones
    assert r2.status_code == 409


# ------------------------------------------------------------------ Booking Service contract
def test_accepts_booking_service_payload(client):
    """Exact request shapes sent by services/booking-service/app.py (Member 2)."""
    jj_hold = {
        "showtime_id": EVENT, "eventId": EVENT, "listing_id": "abby-vip-01",
        "section": "VIP", "row": "C", "quantity": 2,
        "seat_ids": ["VIP-C-1", "VIP-C-2"], "booking_id": "ECHO-1A2B3C4D",
    }
    r = client.post("/seats/hold", json=jj_hold, headers=KEY)
    assert r.status_code == 200, r.json()
    assert r.json()["seats"] == ["VIP-C-1", "VIP-C-2"]

    rival = {**jj_hold, "booking_id": "ECHO-9F8E7D6C"}
    assert client.post("/seats/hold", json=rival, headers=KEY).status_code == 409

    jj_release = {"booking_id": "ECHO-1A2B3C4D", "showtime_id": EVENT, "seat_ids": ["VIP-C-1", "VIP-C-2"]}
    r = client.post("/seats/release", json=jj_release, headers=KEY)
    assert r.json()["released"] == ["VIP-C-1", "VIP-C-2"]


# ------------------------------------------------------------------ NFR4 security
@pytest.mark.parametrize("body", [
    {"event_id": EVENT, "seats": ["C4"], "booking_id": str(uuid.uuid4())},                            # bad label
    {"event_id": EVENT, "seats": ["VIP-C-1", "vip-c-1"], "booking_id": str(uuid.uuid4())},            # duplicate seat
    {"event_id": EVENT, "seats": [f"VIP-C-{i}" for i in range(1, 12)], "booking_id": str(uuid.uuid4())},  # > 10 seats
    {"event_id": EVENT, "seats": ["VIP-C-1"], "booking_id": "x"},                                     # bad booking id
    {"event_id": "Bad Event!", "seats": ["VIP-C-1"], "booking_id": str(uuid.uuid4())},                # bad event id
    {"event_id": EVENT, "seats": ["VIP-C-1'; DROP TABLE seats;--"], "booking_id": str(uuid.uuid4())},
])
def test_invalid_input_rejected_with_422(client, body):
    assert client.post("/seats/hold", json=body, headers=KEY).status_code == 422


def test_write_needs_service_key(client):
    body = {"event_id": EVENT, "seats": ["VIP-D-2"], "booking_id": str(uuid.uuid4())}
    assert client.post("/seats/hold", json=body).status_code == 401
    assert client.post("/seats/hold", json=body, headers={"X-Service-Key": "wrong"}).status_code == 401


def test_key_check_off_when_no_key_configured(client, monkeypatch):
    monkeypatch.setattr(app_module, "SERVICE_API_KEY", "")
    body = {"event_id": EVENT, "seats": ["VIP-D-3"], "booking_id": str(uuid.uuid4())}
    assert client.post("/seats/hold", json=body).status_code == 200


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
        body = {"event_id": EVENT, "seats": ["VIP-C-11"], "booking_id": str(uuid.uuid4())}
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
        holders = conn.execute("SELECT COUNT(DISTINCT booking_id) FROM seats WHERE event_id = ? AND label = ? "
                               "AND status = 'HELD'", (EVENT, "VIP-C-11")).fetchone()[0]
    assert holders == 1
