"""
Availability Service (port 5002)

Owner: Allen (Member 1)

Responsibilities
  * report which seats of a showtime are AVAILABLE / HELD / BOOKED
  * place a temporary HOLD on seats for a booking (all-or-nothing)
  * CONFIRM held seats once the Booking Service has stored the booking
  * RELEASE seats when a booking is cancelled or rolled back
  * expire holds that were never confirmed (e.g. Booking Service crashed)

Read endpoints are public (the client draws the seat map from them).
Write endpoints need the internal X-Service-Key header, so only the
Booking Service can change seat state.
"""

from __future__ import annotations

import asyncio
import hmac
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from . import db

SERVICE_NAME = "availability"
SERVICE_API_KEY = os.getenv("SERVICE_API_KEY", "dev-only-change-me")
SWEEP_INTERVAL_SECONDS = int(os.getenv("SWEEP_INTERVAL_SECONDS", "30"))
MAX_SEATS_PER_REQUEST = 6
SEAT_PATTERN = r"^[A-Z](?:[1-9]|[1-4][0-9]|50)$"

# ---------------------------------------------------------------- logging
LOG_DIR = Path(os.getenv("LOG_DIR", Path(__file__).resolve().parent.parent / "logs"))
LOG_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s.%(msecs)03d [%(name)s] %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    handlers=[logging.StreamHandler(), logging.FileHandler(LOG_DIR / "availability.log", encoding="utf-8")],
)
log = logging.getLogger(SERVICE_NAME)


# ---------------------------------------------------------------- errors
class ApiError(Exception):
    """Raised inside handlers; rendered as RFC 9457 problem+json."""

    def __init__(self, status: int, title: str, detail: str, **extra):
        self.status, self.title, self.detail, self.extra = status, title, detail, extra


def problem(status: int, title: str, detail: str, **extra) -> JSONResponse:
    body = {"type": f"/problems/{title.lower().replace(' ', '-')}", "title": title,
            "status": status, "detail": detail, **extra}
    return JSONResponse(body, status_code=status, media_type="application/problem+json")


# ---------------------------------------------------------------- request models
class SeatRequest(BaseModel):
    showtime_id: int = Field(gt=0)
    seats: list[Annotated[str, Field(pattern=SEAT_PATTERN)]] = Field(min_length=1, max_length=MAX_SEATS_PER_REQUEST)
    booking_id: uuid.UUID

    @field_validator("seats")
    @classmethod
    def no_duplicate_seats(cls, v: list[str]) -> list[str]:
        if len(set(v)) != len(v):
            raise ValueError("the same seat appears more than once")
        return sorted(v)


class ReleaseRequest(BaseModel):
    showtime_id: int = Field(gt=0)
    booking_id: uuid.UUID


# ---------------------------------------------------------------- app setup
async def hold_sweeper() -> None:
    """Background loop: free seats whose hold timed out."""
    while True:
        await asyncio.sleep(SWEEP_INTERVAL_SECONDS)
        try:
            with db.write_txn() as conn:
                n = db.expire_stale_holds(conn)
            if n:
                log.info("sweeper released %d expired hold(s)", n)
        except Exception as exc:  # keep the loop alive
            log.warning("sweeper error: %s", exc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.init_db()
    task = asyncio.create_task(hold_sweeper())
    log.info("Availability Service ready (db=%s, hold_ttl=%ss)", db.DB_PATH.name, db.HOLD_TTL_SECONDS)
    yield
    task.cancel()


app = FastAPI(title="Availability Service", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_methods=["GET"],
    allow_headers=["X-Request-ID"],
)


@app.middleware("http")
async def request_logger(request: Request, call_next):
    """Attach a request id (or reuse the caller's) and log every call."""
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]
    request.state.rid = rid
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    caller = request.client.host if request.client else "?"
    log.info("rid=%s %s %s from %s -> %d (%.1f ms)", rid, request.method,
             request.url.path, caller, response.status_code, ms)
    response.headers["X-Request-ID"] = rid
    return response


@app.exception_handler(ApiError)
async def api_error_handler(_: Request, exc: ApiError):
    return problem(exc.status, exc.title, exc.detail, **exc.extra)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return problem(422, "Invalid request", "The request body failed validation.", errors=errors)


def require_service_key(x_service_key: Annotated[str | None, Header()] = None) -> None:
    if not x_service_key or not hmac.compare_digest(x_service_key, SERVICE_API_KEY):
        raise ApiError(401, "Unauthorized", "A valid X-Service-Key header is required for seat changes.")


# ---------------------------------------------------------------- read endpoints
@app.get("/health")
def health():
    with db.read_conn() as conn:
        conn.execute("SELECT 1").fetchone()
    return {"service": SERVICE_NAME, "status": "ok"}


@app.get("/showtimes")
def list_showtimes():
    with db.read_conn() as conn:
        rows = conn.execute(
            "SELECT s.id, s.movie_title, s.hall_name, s.start_time, "
            "SUM(CASE WHEN st.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available, COUNT(st.id) AS total "
            "FROM showtimes s JOIN seats st ON st.showtime_id = s.id GROUP BY s.id ORDER BY s.id"
        ).fetchall()
    return [dict(r) for r in rows]


@app.get("/showtimes/{showtime_id}/seats")
def get_seats(showtime_id: int):
    with db.read_conn() as conn:
        show = conn.execute("SELECT * FROM showtimes WHERE id = ?", (showtime_id,)).fetchone()
        if show is None:
            raise ApiError(404, "Showtime not found", f"Showtime {showtime_id} does not exist.")
        seats = conn.execute(
            "SELECT row_label || seat_number AS seat, row_label AS row, seat_number AS number, status "
            "FROM seats WHERE showtime_id = ? ORDER BY row_label, seat_number",
            (showtime_id,),
        ).fetchall()
    # booking_id is deliberately NOT returned: the public seat map must not leak who booked what.
    return {"showtime": dict(show), "seats": [dict(s) for s in seats]}


# ---------------------------------------------------------------- write endpoints
def _load(conn, showtime_id: int, labels: list[str]):
    """Fetch the requested seats; 404 if the showtime or any seat label is unknown."""
    if conn.execute("SELECT 1 FROM showtimes WHERE id = ?", (showtime_id,)).fetchone() is None:
        raise ApiError(404, "Showtime not found", f"Showtime {showtime_id} does not exist.")
    marks = ",".join("?" * len(labels))
    rows = conn.execute(
        f"SELECT id, row_label || seat_number AS seat, status, booking_id FROM seats "
        f"WHERE showtime_id = ? AND row_label || seat_number IN ({marks})",
        (showtime_id, *labels),
    ).fetchall()
    found = {r["seat"] for r in rows}
    missing = sorted(set(labels) - found)
    if missing:
        raise ApiError(404, "Seat not found", f"Unknown seat(s) for showtime {showtime_id}.", seats=missing)
    return rows


@app.post("/seats/hold", dependencies=[Depends(require_service_key)])
def hold_seats(req: SeatRequest, request: Request):
    booking_id = str(req.booking_id)
    with db.write_txn() as conn:                       # BEGIN IMMEDIATE
        db.expire_stale_holds(conn)                     # lazy expiry, same txn
        rows = _load(conn, req.showtime_id, req.seats)

        # Same booking asking again (e.g. a network retry) -> same answer, no change.
        if all(r["booking_id"] == booking_id and r["status"] in ("HELD", "BOOKED") for r in rows):
            log.info("rid=%s hold replay for booking %s seats=%s", request.state.rid, booking_id[:8], req.seats)
            return {"booking_id": booking_id, "showtime_id": req.showtime_id, "seats": req.seats,
                    "status": rows[0]["status"], "replayed": True}

        ids = [r["id"] for r in rows]
        marks = ",".join("?" * len(ids))
        now = db.iso(db.utc_now())
        cur = conn.execute(
            f"UPDATE seats SET status = 'HELD', booking_id = ?, held_at = ?, version = version + 1 "
            f"WHERE id IN ({marks}) AND status = 'AVAILABLE'",     # <- atomic check-and-set
            (booking_id, now, *ids),
        )
        if cur.rowcount != len(ids):
            taken = sorted(r["seat"] for r in rows if r["status"] != "AVAILABLE")
            if not taken:  # cannot normally happen under BEGIN IMMEDIATE, kept as a guard
                taken = req.seats
            # Raising inside write_txn() rolls back any seat we just changed.
            log.info("rid=%s CONFLICT booking %s wanted %s, unavailable=%s",
                     request.state.rid, booking_id[:8], req.seats, taken)
            raise ApiError(409, "Seat already reserved",
                           "One or more requested seats are no longer available.", unavailable_seats=taken)
        db.log_events(conn, req.showtime_id, req.seats, booking_id, "HOLD")

    log.info("rid=%s HELD %s for booking %s (ttl %ss)", request.state.rid, req.seats, booking_id[:8], db.HOLD_TTL_SECONDS)
    return {"booking_id": booking_id, "showtime_id": req.showtime_id, "seats": req.seats,
            "status": "HELD", "hold_expires_in_s": db.HOLD_TTL_SECONDS, "replayed": False}


@app.post("/seats/confirm", dependencies=[Depends(require_service_key)])
def confirm_seats(req: SeatRequest, request: Request):
    booking_id = str(req.booking_id)
    with db.write_txn() as conn:
        rows = _load(conn, req.showtime_id, req.seats)
        if all(r["booking_id"] == booking_id and r["status"] == "BOOKED" for r in rows):
            return {"booking_id": booking_id, "seats": req.seats, "status": "BOOKED", "replayed": True}

        ids = [r["id"] for r in rows]
        marks = ",".join("?" * len(ids))
        cur = conn.execute(
            f"UPDATE seats SET status = 'BOOKED', version = version + 1 "
            f"WHERE id IN ({marks}) AND status = 'HELD' AND booking_id = ?",
            (*ids, booking_id),
        )
        if cur.rowcount != len(ids):
            raise ApiError(409, "Hold expired",
                           "The seats are not held by this booking any more (hold expired or released).",
                           seats=req.seats)
        db.log_events(conn, req.showtime_id, req.seats, booking_id, "CONFIRM")

    log.info("rid=%s BOOKED %s for booking %s", request.state.rid, req.seats, booking_id[:8])
    return {"booking_id": booking_id, "seats": req.seats, "status": "BOOKED", "replayed": False}


@app.post("/seats/release", dependencies=[Depends(require_service_key)])
def release_seats(req: ReleaseRequest, request: Request):
    """Free every seat owned by a booking. Safe to call twice."""
    booking_id = str(req.booking_id)
    with db.write_txn() as conn:
        rows = conn.execute(
            "SELECT row_label || seat_number AS seat FROM seats WHERE showtime_id = ? AND booking_id = ?",
            (req.showtime_id, booking_id),
        ).fetchall()
        released = sorted(r["seat"] for r in rows)
        conn.execute(
            "UPDATE seats SET status = 'AVAILABLE', booking_id = NULL, held_at = NULL, version = version + 1 "
            "WHERE showtime_id = ? AND booking_id = ?",
            (req.showtime_id, booking_id),
        )
        if released:
            db.log_events(conn, req.showtime_id, released, booking_id, "RELEASE")

    log.info("rid=%s RELEASED %s for booking %s", request.state.rid, released or "nothing", booking_id[:8])
    return {"booking_id": booking_id, "released": released}
