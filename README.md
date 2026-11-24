# ECHO LIVE — Distributed Concert Ticket Booking System (XBCS3024N)

ECHO LIVE is a distributed concert ticket marketplace built with four independently running network components communicating over HTTP/REST:
1. **Client Application (`client/`, Port `3000`)** — Interactive HTML/CSS/Vanilla JS concert marketplace with SVG venue maps (*Arena of Stars*, *Axiata Arena*, *TM Stadium Nasional*), checkout hold countdown, booking lookup, cancellation/resale flow, and admin seat-release audit.
2. **Booking & Orchestration Service (`services/booking-service/`, Port `5001`)** — FastAPI orchestrator managing the booking transaction lifecycle (`PENDING` → `CONFIRMED` → `CANCELLED`), SHA-256 `Idempotency-Key` duplicate-request caching (`X-Cache: HIT` / `MISS`), availability hold/release coordination, and bounded-timeout notification dispatch.
3. **Availability Service (`services/availability-service/`, Port `5002`)** — FastAPI inventory service owning concert seat states (`AVAILABLE`, `HELD`, `BOOKED`) in SQLite WAL mode with `BEGIN IMMEDIATE` atomic check-and-set locking and a 30-second background hold-expiry sweeper.
4. **Notification Service (`services/notification-service/`, Port `5003`)** — FastAPI worker receiving booking confirmation and cancellation events (`CONFIRMED`, `CANCELLED`) to simulate email/SMS dispatch.

---

## Port Allocation & Architecture Overview

| Component | Owner | Port | Local URL | Data Store |
| :--- | :--- | :---: | :--- | :--- |
| **Client Web UI** | Member 4 (Leong Jey Hsin) | `3000` | `http://localhost:3000` | Browser + Backend API (`:5001`) |
| **Booking Service** | Member 2 (JJ Chua) | `5001` | `http://localhost:5001` (`/docs`) | `services/booking-service/bookings.db` (SQLite WAL) |
| **Availability Service** | Member 1 (Allen) | `5002` | `http://localhost:5002` (`/docs`) | `services/availability-service/availability_service/availability.db` (SQLite WAL) |
| **Notification Service** | Member 3 (Moi Zjen Yong) | `5003` | `http://localhost:5003` (`/docs`) | Console / Log output |

Architecture, sequence, and state diagrams: [`docs/diagrams/`](docs/diagrams/)  
Integration & test evidence logs/screenshots: [`docs/evidence/availability-service/`](docs/evidence/availability-service/)

---

## Quick Start (Run All 4 Services)

### Prerequisites
- Python 3.10+
- Install Python dependencies:
  ```bash
  pip install fastapi uvicorn pydantic httpx requests pytest
  ```

### Option A: One-Command Startup on Windows (PowerShell)
From the repository root:
```powershell
.\start-services.ps1
```
To stop all running services cleanly:
```powershell
.\stop-services.ps1
```

### Option B: Run Each Service in Its Own Terminal
```bash
# Terminal 1 — Notification Service (Port 5003)
python services/notification-service/app.py

# Terminal 2 — Availability Service (Port 5002)
cd services/availability-service
python -m availability_service

# Terminal 3 — Booking Service (Port 5001)
cd services/booking-service
python app.py

# Terminal 4 — Client Application (Port 3000)
python -m http.server 3000 --directory client
```

### Option C: Docker Compose
```bash
docker compose up --build
```

---

## Automated Distributed Systems Verification

With the services running, execute the three core distributed behaviour tests:

1. **Concurrency & Race Condition Prevention (HTTP 409 Conflict):**
   ```bash
   python services/availability-service/tests/concurrency_test.py --n 10
   python services/availability-service/tests/concurrency_test.py --via booking --n 8 --seat PS2-J-21
   ```
2. **Duplicate-Request Handling (Idempotency Key & SHA-256 Cache):**
   ```bash
   python services/booking-service/test_idempotency.py
   ```
3. **Availability Unit & Concurrency Pytest Suite (22 Tests):**
   ```bash
   cd services/availability-service
   python -m pytest tests/test_availability.py -v
   ```

---

## Client Application (Member 4)

### Run the client
Open [`client/index.html`](client/index.html) in a browser or serve `client/` on `http://localhost:3000`. No package installation or build step is required. When `window.EVENT_API_BASE_URL` in [`client/config.js`](client/config.js) is empty, demo bookings are stored in browser local storage; when set to `"http://localhost:5001"`, all actions run live against the Booking Service.

The UI features upcoming concerts across **Arena of Stars (Resorts World Genting)**, **Axiata Arena**, and **TM Stadium Nasional Bukit Jalil**.

### Connect an API
Set `window.EVENT_API_BASE_URL` in [`client/config.js`](client/config.js) to the backend origin (`http://localhost:5001`). The client supports:
- `GET /events`
- `GET /ticket-listings?eventId=...&quantity=...&section=...`
- `POST /bookings` with a UUID `Idempotency-Key` header
- `GET /bookings/{id}`
- `DELETE /bookings/{id}`
- `GET /admin/orders/{bookingId}/audit`

HTTP 409 booking conflicts show the server message, return the customer to ticket selection, and refresh available listings.

### Booking cancellation and resale window
Customers can cancel a booking through the UI up to and including 14 days before its concert date. Inside that 14-day window, the booking page disables cancellation and offers a prefilled resale form instead. A successful demo resale marks the booking as listed so it cannot be submitted for resale again.

### Holds, timeout release, and admin audit
The Admin link in the footer opens an order lookup (`GET /admin/orders/{bookingId}/audit`) returning the order plus its authoritative seat-pool release audit:

```json
{
  "booking": {
    "id": "ECHO-1A2B3C4D",
    "status": "CANCELLED",
    "paymentStatus": "REFUNDED",
    "holdExpiresAt": "Released",
    "cancelReason": "Customer requested cancellation",
    "eventName": "Priscilla Abby",
    "section": "VIP",
    "row": "C",
    "seats": ["VIP-C-1", "VIP-C-2"],
    "quantity": 2,
    "total": 896
  },
  "seatReleaseAudit": {
    "status": "verified",
    "expectedSeatCount": 2,
    "releasedSeatCount": 2,
    "availableSeatCount": 30,
    "verifiedAt": "2026-11-21T06:00:00Z",
    "message": "The backend verified that all cancelled seats were released back to the available seat pool."
  }
}
```

---

## Availability Service (Member 1)

Owns seat state and prevents double booking. It uses `BEGIN IMMEDIATE` transactions, a conditional `UPDATE ... WHERE status='AVAILABLE'` and a `UNIQUE` constraint on each seat.

```bash
cd services/availability-service
pip install -r requirements.txt
python -m availability_service          # http://127.0.0.1:5002
python -m pytest tests/test_availability.py -v
```

API contract, Booking Service integration steps and configuration: [`services/availability-service/README.md`](services/availability-service/README.md).  
Architecture, sequence and state diagrams: [`docs/diagrams/`](docs/diagrams/).

---

## Booking & Orchestration Service (Member 2)

Coordinates the booking transaction lifecycle on Port `5001`, enforces `Idempotency-Key` duplicate suppression with SHA-256 request payload hashing, calls the Availability Service (`POST /seats/hold` and `POST /seats/release`), and dispatches notifications with a 2.0-second bounded timeout.

```bash
cd services/booking-service
pip install -r requirements.txt
python app.py                           # http://127.0.0.1:5001
python test_idempotency.py
```

Full API documentation and schema design: [`services/booking-service/README.md`](services/booking-service/README.md).

---

## Notification Service (Member 3)

### 1. Requirements & Setup
- Python 3.10+
- Dependencies:
  ```bash
  pip install fastapi uvicorn pydantic httpx
  ```

### 2. How to Run Independently
To start the Notification Service on port `5003`:
```bash
python services/notification-service/app.py
```
Expected terminal output:
```text
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:5003 (Press CTRL+C to quit)
```

### 3. API Contract
- **Endpoint:** `POST /notifications`
- **Port:** `5003`
- **Request Body:**
  ```json
  {
    "booking_id": "B104",
    "user_email": "user@example.com",
    "seat_ids": ["C4"],
    "event_type": "CONFIRMED"
  }
  ```
- **Response:** `200 OK` with `{"status": "SUCCESS", "message": "Notification dispatched"}`

### 4. Partial Failure & Fault Tolerance Testing
1. **Normal Flow:** Ensure all services are active. Complete a booking from the Client UI; the Notification Service logs:
   ```text
   [NOTIF WORKER] Successfully processed CONFIRMED for user@example.com | Booking ID: B104 | Seats: ['C4']
   ```
2. **Simulate Partial Failure:** Kill/stop the Notification Service terminal (`Ctrl + C` or `docker stop <notification_container_id>`).
3. **Resilience Verification:** Submit a new booking from the Client UI while Notification Service is down.
   - The Booking Service catches the connection timeout/failure and logs a `[WARN]` fallback message.
   - The user still receives `201 Created` with a confirmed booking (demonstrating decoupled fault tolerance).
