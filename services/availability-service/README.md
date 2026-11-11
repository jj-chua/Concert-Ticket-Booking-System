# Availability Service (Member 1: Allen)

Owns the seat inventory for every ECHO LIVE concert. It is the only component allowed to decide whether a seat can still be sold. Other services change seats only through this HTTP API, and no other service opens its database.

- Port: **5002**
- Stack: Python 3.10+, FastAPI, SQLite (WAL mode)
- Database: `availability_service/availability.db`, created with seat inventory on first start

## Seat inventory

There are 11 events. They use the same event IDs as the client (`client/app.js`), such as `priscilla-abby-genting-2026`.

| Venue | Sections | Seats |
|---|---|---|
| Arena of Stars | VVIP, VIP, PS1–PS4 | rows A–Z × seats 1–30 per section |
| Unifi Arena | VVIP, VIP, PS1–PS4, GA | seated as above; GA = standing, numbers 1–200 |
| TM Stadium Nasional | FLOOR A–C, CAT 1–9 | FLOOR = standing 1–200; CAT seated as above |

A seat is identified by the label `section-row-number`, for example `VIP-C-11`, `CAT 3-B-7` or `FLOOR A-GA-120`. This is the same format the Booking Service builds in `seat_ids`.

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
| `GET /events` | none | none | 200: events with `available` / `total` seat counts |
| `GET /events/{event_id}/seats?section=VIP&row=C` | none | none | 200: seat map (`seat`, `section`, `row`, `number`, `status`), 404 |
| `POST /seats/hold` | `X-Service-Key`* | `{event_id, seats[], booking_id, confirm?}` | 200 HELD (or BOOKED with `confirm: true`), **409 seat already reserved**, 404, 422, 401 |
| `POST /seats/confirm` | `X-Service-Key`* | `{event_id, seats[], booking_id}` | 200 BOOKED, 409 hold missing or expired |
| `POST /seats/release` | `X-Service-Key`* | `{event_id, booking_id}` | 200 `{released: [...]}` (safe to repeat) |

\* Required only when `SERVICE_API_KEY` is set. See [Configuration](#configuration).

Rules:

- **Field names.** Request bodies also accept the names the Booking Service uses: `showtime_id` or `eventId` for `event_id`, and `seat_ids` for `seats`. Extra fields such as `listing_id`, `section`, `row` and `quantity` are ignored.
- **Size and format.** Each request covers 1–10 seats with no repeats. Seat labels are upper-cased before checking. `booking_id` is 3–64 letters, digits, `-` or `_`, so both a UUID and `ECHO-1A2B3C4D` are accepted.
- **Errors.** Errors use `application/problem+json` (RFC 9457). A 409 response lists the taken seats in `unavailable_seats`.
- **Expiry.** A `HELD` seat that is never confirmed is released after `HOLD_TTL_SECONDS` (default 300 s). `BOOKED` seats never expire.

### Contract for the Booking Service

1. Create one `booking_id` per booking. Reuse it on every retry of that booking.
2. Call `POST /seats/hold` with `seat_ids` and `booking_id`.
   - A 409 means another customer got the seat first. Pass the 409 to the client.
   - Any other non-200 answer, or no answer at all, means the seats are **not** reserved. Do not confirm the booking.
3. Make the seats permanent. Either:
   - send `"confirm": true` in the hold request (one call, seats go straight to `BOOKED`), or
   - call `POST /seats/confirm` with the same body after the hold succeeds.

   Without this step the hold expires after 5 minutes and the seat can be sold again.
4. On cancel, call `POST /seats/release` with `booking_id` and the event ID.
5. Send `X-Service-Key` (when configured) and `X-Request-ID` on every call. The request ID appears in this service's log, so one booking can be traced across services.

All write calls are idempotent per `booking_id`. If a timeout leaves the result unknown, the Booking Service can retry them safely.

## How double booking is prevented

1. **Serialised writes.** Every write runs inside `BEGIN IMMEDIATE`. SQLite gives one writer the write lock at the start of the transaction, so two check-then-write sequences cannot interleave.
2. **Conditional update.** `UPDATE seats SET status='HELD' ... WHERE id IN (...) AND status='AVAILABLE'`. If the row count is lower than the number of seats requested, the transaction rolls back. A multi-seat hold is therefore all-or-nothing.
3. **Database constraints.** `UNIQUE(event_id, section, row_label, seat_number)`, `UNIQUE(event_id, label)` and a `CHECK` on `status` reject bad data even if application code has a bug.

Expired holds are cleared by a background sweeper every 30 s. Each new hold also clears expired holds inside its own transaction.

## Tests

Run from `services/availability-service/`:

```bash
python -m pytest tests/test_availability.py -v          # 22 tests, includes 20 parallel HTTP requests
python -m availability_service                           # in a second terminal
python tests/concurrency_test.py --n 10                  # 10 holds for VIP-C-11: expect 1 x 200, 9 x 409
python tests/concurrency_test.py --via booking --n 8 --seat PS2-J-21   # same race through POST /bookings
```

The test suite includes the exact request bodies the Booking Service sends (`test_accepts_booking_service_payload`).

Saved output is in [`docs/evidence/availability-service/`](../../docs/evidence/availability-service/). It includes a live run with the Booking Service and Notification Service from `main`: booking, idempotent replay, 409 conflict, cancel and release, and an 8-way race.
The architecture, sequence and state diagrams are in [`docs/diagrams/`](../../docs/diagrams/).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `127.0.0.1` | Set to `0.0.0.0` to accept calls from other machines (the Dockerfile does this) |
| `PORT` / `AVAILABILITY_PORT` | `5002` | Listening port |
| `AVAILABILITY_DB` | `availability_service/availability.db` | SQLite file |
| `SERVICE_API_KEY` | *(empty)* | When set, every write must send the same value in `X-Service-Key`. Leave empty only for local development, where a warning is logged at start-up |
| `HOLD_TTL_SECONDS` | `300` | Lifetime of an unconfirmed hold |
| `SWEEP_INTERVAL_SECONDS` | `30` | How often expired holds are cleared |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Browser origins allowed to call the GET endpoints |
| `LOG_DIR` | `services/availability-service/logs` | Log file location |

## Known limitations

- SQLite allows one writer per database file, so seat writes are serialised. This is fine for the demo but would be a bottleneck at real ticketing scale.
- The shared `X-Service-Key` stands in for proper service-to-service authentication, such as mTLS or signed tokens.
- Seat inventory is seeded from the client's event list. A real system would load it from the organiser's venue plans.
