# ECHO LIVE — Concert Ticket Marketplace

ECHO LIVE is a responsive, framework-free concert ticket marketplace prototype built with HTML, CSS, and vanilla JavaScript. It features official Genting concert artwork, static plum wave accents, a clickable Arena of Stars zone map, ticket listings, and filters.

## Run the client

Open [`client/index.html`](client/index.html) in a browser. No package installation or build step is required. Demo bookings are stored in browser local storage.

The demo features upcoming Arena of Stars concerts sourced from Resorts World Genting, including Priscilla Abby's 19+ Malaysia Concert on 5 December 2026. Event dates and posters link back to official event pages. Ticket listing prices and inventory are sample data for UI demonstration and are not live offers. The interactive zone map is an illustrative diagram, not a live seat map or a scale drawing.

## Connect an API

Set `window.EVENT_API_BASE_URL` in [`client/config.js`](client/config.js) to the backend origin. The client supports:

- `GET /events`
- `GET /ticket-listings?eventId=...&quantity=...&section=...`
- `POST /bookings` with a UUID `Idempotency-Key` header
- `GET /bookings/{id}`
- `DELETE /bookings/{id}`

HTTP 409 booking conflicts show the server message, return the customer to ticket selection, and refresh available listings.


---

## Notification Service (Member 3)

### 1. Requirements & Setup
- Python 3.10+
- Dependencies:
  ```bash
  pip install fastapi uvicorn pydantic httpx

## 2. How to Run Independently

To start the Notification Service on port `5003`:

```bash
python services/notification-service/app.py
```

Expected terminal output:

```text
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:5003 (Press CTRL+C to quit)
```

## 3. API Contract

* **Endpoint:** `POST /notifications`
* **Port:** `5003`
* **Request Body:**

```json
{
  "booking_id": "B104",
  "user_email": "user@example.com",
  "seat_ids": ["C4"],
  "event_type": "CONFIRMED"
}
```

* **Response:** `200 OK` with `{"status": "SUCCESS", "message": "Notification dispatched"}`

---

## 4. Partial Failure & Fault Tolerance Testing

1. **Normal Flow:** Ensure all services are active. Complete a booking from the Client UI; the Notification Service logs:

   ```text
   [NOTIF WORKER] Successfully processed CONFIRMED for user@example.com | Booking ID: B104 | Seats: ['C4']
   ```

2. **Simulate Partial Failure:** Kill/stop the Notification Service terminal (`Ctrl + C` or `docker stop <notification_container_id>`).

3. **Resilience Verification:** Submit a new booking from the Client UI while Notification Service is down.
   * The Booking Service catches the connection timeout/failure and logs a `[WARN]` fallback message.
   * The user still receives `201 Created` with a confirmed booking (demonstrating decoupled fault tolerance).

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
