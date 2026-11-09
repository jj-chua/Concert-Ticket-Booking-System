# ECHO LIVE — Concert Ticket Booking System

ECHO LIVE is a responsive, framework-free concert ticket booking client built with HTML, CSS, and vanilla JavaScript.

## Run the client

Open [`client/index.html`](client/index.html) in a browser. The demo experience includes sample Kuala Lumpur shows, ticket tiers, interactive seat selection, checkout, booking lookup, and cancellation. Demo bookings are kept in browser local storage.

## Connect an API

Set `window.EVENT_API_BASE_URL` in [`client/config.js`](client/config.js) to the backend origin. The client supports `GET /events`, `GET /shows`, seat availability, `POST /bookings`, `GET /bookings/{id}`, and `DELETE /bookings/{id}`. Booking creation sends a UUID in the `Idempotency-Key` header. HTTP 409 responses display the unavailable seat and trigger a seat-map refresh.

