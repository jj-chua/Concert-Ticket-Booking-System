# ECHO LIVE concert ticket client

A framework-free concert booking experience built with HTML, CSS and vanilla JavaScript.

## Run

Open `index.html` in a browser. Demo bookings are stored in the browser's `localStorage`; no package installation or build step is needed.

## Connect a backend

Set `window.EVENT_API_BASE_URL` in `config.js` to your API origin. The client supports:

- `GET /events` (optional; sample shows are used when unavailable)
- `GET /shows?eventId=...&venue=...&date=...` (optional)
- `GET /shows/{eventId}-{date}-{time}/seats?...`
- `POST /bookings` with an `Idempotency-Key` UUID header
- `GET /bookings/{bookingId}`
- `DELETE /bookings/{bookingId}`

The API must allow cross-origin browser requests. HTTP 409 responses show the unavailable seat, refresh the seat map, and return the customer to seat selection.

