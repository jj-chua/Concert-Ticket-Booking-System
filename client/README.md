# ECHO LIVE concert ticket marketplace

A responsive, framework-free ticket marketplace prototype built with HTML, CSS, and vanilla JavaScript. The page includes official event artwork, a clickable venue map, ticket cards, filters, checkout, booking lookup, and cancellation.

## Run

Open `index.html` in a browser. No build step is required. Demo bookings are stored in browser `localStorage`.

Upcoming Kuala Lumpur event dates, status labels, and artwork link to Live Nation Malaysia. Ticket prices and inventory in the listings are sample UI data, not live offers.

## Connect a backend

Set `window.EVENT_API_BASE_URL` in `config.js` to your API origin. The client supports `GET /events`, `GET /ticket-listings`, `POST /bookings` with an `Idempotency-Key` UUID header, `GET /bookings/{id}`, and `DELETE /bookings/{id}`. The API must allow cross-origin browser requests. HTTP 409 responses display the conflict message, refresh listings, and return the customer to ticket selection.
