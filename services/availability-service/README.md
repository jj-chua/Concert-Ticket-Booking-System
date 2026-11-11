# Availability Service (Member 1: Allen)

Owns seat state for every performance and is the only component allowed to decide
whether a seat can still be taken. Other services change seats only through this
HTTP API, and no other service opens its database.

- Port: **5002**
- Stack: Python 3.10+, FastAPI, SQLite (WAL mode)
- Database: `availability_service/availability.db` (created with sample data on first start)

## Run

### Local

```bash
cd services/availability-service
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m availability_service        # http://127.0.0.1:5002  (docs: /docs)
```

### Docker

```bash
docker compose up --build availability-service
```

The Dockerfile listens on `0.0.0.0:5002`, matching `docker-compose.yml`.

## API

| Method & path | Auth | Body | Responses |
|---|---|---|---|
| `GET /health` | none | none | 200 |
| `GET /showtimes` | none | none | 200: list with free-seat counts |
| `GET /showtimes/{id}/seats` | none | none | 200: seat map (`seat`, `row`, `number`, `status`), 404 |
| `POST /seats/hold` | `X-Service-Key` | `{showtime_id, seats[], booking_id}` | 200 HELD, **409 seat already reserved**, 404, 422, 401 |
| `POST /seats/confirm` | `X-Service-Key` | `{showtime_id, seats[], booking_id}` | 200 BOOKED, 409 hold missing or expired |
| `POST /seats/release` | `X-Service-Key` | `{showtime_id, booking_id}` | 200 `{released: [...]}` (safe to repeat) |

Rules:

- Seat labels look like `C4` (row A–Z, seat 1–50).
- Each request covers 1–6 seats, with no repeats.
- `booking_id` must be a UUID.
- Errors use `application/problem+json` (RFC 9457). A 409 response lists the taken seats in `unavailable_seats`.
- A hold expires after `HOLD_TTL_SECONDS` (default 300 s) if it is never confirmed.
- Seat states move `AVAILABLE`, then `HELD`, then `BOOKED`. A release or expiry returns the seat to `AVAILABLE`.

### Contract for the Booking Service

1. Generate a `booking_id` (UUID) once per booking. Reuse it on every retry.
2. `POST /seats/hold` with header `X-Service-Key`.
   - A 409 means another customer got the seat first. Pass the 409 to the client.
3. After a 200 from the hold, call `POST /seats/confirm` with the same `booking_id`.
4. On cancel, or if a later step fails, call `POST /seats/release`.
5. Send `X-Request-ID` on every call. The same ID then appears in this service's log, so one booking can be traced across services.

All three write calls are idempotent per `booking_id`. If a timeout leaves the result unknown, the Booking Service can retry them safely.

## How double booking is prevented

1. **Serialised writes.** Every write runs inside `BEGIN IMMEDIATE`. SQLite gives one writer the write lock at the start of the transaction, so two check-then-write sequences cannot interleave.
2. **Conditional update.** `UPDATE seats SET status='HELD' ... WHERE id IN (...) AND status='AVAILABLE'`. If the row count is lower than the number of seats requested, the transaction rolls back. A multi-seat hold is therefore all-or-nothing.
3. **Database constraints.** `UNIQUE(showtime_id, row_label, seat_number)` and a `CHECK` on `status` reject bad data even if application code has a bug.

Expired holds are cleared by a background sweeper every 30 s. Each new hold also clears expired holds inside its own transaction.

## Tests

Run from `services/availability-service/`:

```bash
python -m pytest tests/test_availability.py -v                   # 16 tests, includes 20 parallel HTTP requests
python -m availability_service                                    # in a second terminal
python tests/concurrency_test.py --n 10 --seat C4                 # expect 1 x 200, 9 x 409
```

`concurrency_test.py --via booking` sends the same race through `POST /bookings` on port 5001.
That option expects the Booking Service to accept `{showtime_id, seats[], email}` with an `Idempotency-Key` header.

Saved output from our run is in [`docs/evidence/availability-service/`](../../docs/evidence/availability-service/).
The architecture, sequence and state diagrams are in [`docs/diagrams/`](../../docs/diagrams/).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `127.0.0.1` | Set to `0.0.0.0` to accept calls from other machines (the Dockerfile does this) |
| `PORT` / `AVAILABILITY_PORT` | `5002` | Listening port |
| `AVAILABILITY_DB` | `availability_service/availability.db` | SQLite file |
| `SERVICE_API_KEY` | `dev-only-change-me` | Must match the Booking Service. Change it outside the demo |
| `HOLD_TTL_SECONDS` | `300` | Hold lifetime |
| `SWEEP_INTERVAL_SECONDS` | `30` | How often expired holds are cleared |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Browser origins allowed to call the GET endpoints |
| `LOG_DIR` | `services/availability-service/logs` | Log file location |

## Known limitations

- The sample data still uses the original cinema seeds: two showtimes, rows A–F with seats 1–8. One `showtime` maps to one concert session. Renaming `showtime` to `event` and seeding real concerts are planned so the service matches the ECHO LIVE client.
- SQLite allows one writer per database file, so seat writes are serialised. This is fine for the demo but would be a bottleneck at real ticketing scale.
- The shared `X-Service-Key` stands in for proper service-to-service authentication, such as mTLS or signed tokens.
