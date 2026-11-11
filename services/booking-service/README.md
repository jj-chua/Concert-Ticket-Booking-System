# ECHO LIVE Booking Service (Member 2 — JJ)

The **Booking Service** is the central orchestration component of the ECHO LIVE distributed concert ticket booking system. It manages the full lifecycle of ticket bookings (`PENDING` -> `CONFIRMED` -> `CANCELLED`), coordinates two-phase seat allocation with the Availability Service, enforces header-based idempotency caching to suppress duplicate submissions, and dispatches asynchronous notifications with graceful degradation.

---

## 1. Responsibilities & Features

- **Port:** `5001` (HTTP / REST JSON)
- **Data Store:** SQLite Write-Ahead Logging (`bookings.db`) with `bookings` and `idempotency_records` tables.
- **Transaction Lifecycle:** Manages states `PENDING`, `CONFIRMED`, `CANCELLED`, and `FAILED`.
- **Header-Based Idempotency:** Inspects incoming `Idempotency-Key` HTTP header. Replays cached responses with `X-Cache: HIT` for duplicate requests without invoking downstream services or creating redundant database records.
- **Two-Phase Availability Coordination:**
  - Calls Availability Service (`POST /seats/hold`) to reserve inventory. If a `409 Conflict` is returned, propagates the conflict rejection to the client.
  - On cancellation (`DELETE /bookings/:id`), calls Availability Service (`POST /seats/release`) to return seats to the pool.
- **Resilient Notification Dispatch:**
  - Asynchronously dispatches confirmations and cancellations via `notification_client.py` with a 2.0-second timeout.
  - Graceful degradation: downstream notification outages do not abort or fail confirmed bookings.

---

## 2. API Contract & Endpoints

| Method | Endpoint | Description | Request Headers | Success Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status | — | `200 OK` |
| `POST` | `/bookings` | Create a new booking | `Idempotency-Key: <UUID>` | `201 Created` / `409 Conflict` |
| `GET` | `/bookings/{id}` | Query booking details | — | `200 OK` / `404 Not Found` |
| `DELETE`| `/bookings/{id}` | Cancel booking and release seats | — | `200 OK` / `404 Not Found` |
| `GET` | `/bookings` | List all bookings (audit/debug) | — | `200 OK` |
| `POST` | `/bookings/reset` | Clear database for test harness | — | `200 OK` |
| `GET` | `/events` | Event catalog for client UI | — | `200 OK` |
| `GET` | `/ticket-listings` | Filtered ticket inventory | — | `200 OK` |

### Sample `POST /bookings` Request

```json
{
  "eventId": "priscilla-abby-genting-2026",
  "eventName": "Priscilla Abby 19+ Concert",
  "venue": "Arena of Stars",
  "date": "DEC 05, 2026",
  "time": "6:00 PM",
  "section": "VVIP",
  "row": "A",
  "ticketType": "Front stage, Instant download",
  "listingId": "abby-vvip-01",
  "quantity": 2,
  "customerName": "JJ Chua",
  "email": "jj.chua@example.com",
  "total": 1136.0,
  "seat_ids": ["VVIP-A-5", "VVIP-A-6"]
}
```

### Sample Response (`201 Created`)

```json
{
  "id": "ECHO-A8C34F90",
  "status": "confirmed",
  "eventId": "priscilla-abby-genting-2026",
  "eventName": "Priscilla Abby 19+ Concert",
  "section": "VVIP",
  "quantity": 2,
  "customerName": "JJ Chua",
  "email": "jj.chua@example.com",
  "total": 1136.0,
  "seat_ids": ["VVIP-A-5", "VVIP-A-6"],
  "createdAt": "2026-11-10T10:45:00Z"
}
```

---

## 3. How to Run Independently

### Prerequisites
- Python 3.10+
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### Start the Service
```bash
python app.py
```
*The service will start on port `5001`: `http://localhost:5001`.*

---

## 4. Automated Idempotency Test Execution

To verify duplicate request handling and rubric compliance:

```bash
python test_idempotency.py
```

Expected output:
```text
===========================================================================
 ECHO LIVE: Idempotency & Duplicate Request Suppression Test
 Member 2 Deliverable [JJ] - Orchestration & Booking Service
===========================================================================
[OK] Booking Service is UP on port 5001 (booking-service)
[SETUP] Resetting booking database to clean state...

Target Event       : Priscilla Abby 19+ Concert (Arena of Stars)
Target Section     : VVIP (Row A) | Seats: ['VVIP-A-5', 'VVIP-A-6']
Fixed Idempotency-Key: TEST-IDEMPOTENCY-8A3F12CD4E67
Scenario           : Firing 3 sequential HTTP POST requests with identical payload & key

[ATTEMPT #1] Submitting POST /bookings...
  -> HTTP 201 | X-Cache: MISS | Latency: 45.2 ms | Booking ID: ECHO-9B4D12F0 (INITIAL CREATION)
[ATTEMPT #2] Submitting POST /bookings...
  -> HTTP 201 | X-Cache: HIT  | Latency: 8.1 ms  | Booking ID: ECHO-9B4D12F0 (CACHED REPLAY)
[ATTEMPT #3] Submitting POST /bookings...
  -> HTTP 201 | X-Cache: HIT  | Latency: 7.9 ms  | Booking ID: ECHO-9B4D12F0 (CACHED REPLAY)

---------------------------------------------------------------------------
Attempt   HTTP Status    X-Cache Header    Booking ID                    
---------------------------------------------------------------------------
#1        201            MISS              ECHO-9B4D12F0                 
#2        201            HIT               ECHO-9B4D12F0                 
#3        201            HIT               ECHO-9B4D12F0                 
---------------------------------------------------------------------------

[DATABASE AUDIT]
Total bookings created in database : 1 (Expected: exactly 1)

[TEST PASSED] Idempotency Strictly Guaranteed!
Duplicate network retries were suppressed. Zero redundant database rows created.
```
