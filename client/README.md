# ECHO LIVE concert ticket marketplace

A responsive, framework-free ticket marketplace prototype built with HTML, CSS, and vanilla JavaScript. The page includes official Genting event artwork, static plum wave accents, a clickable Arena of Stars zone diagram, ticket cards, filters, checkout, booking lookup, and cancellation.

## Run

Open `index.html` in a browser. No build step is required. Demo bookings are stored in browser `localStorage`.

Upcoming Arena of Stars event dates and artwork link to Resorts World Genting. The seating zones are an illustrative diagram based on the venue's ticket categories; they are not a live seat map or to scale. Ticket prices and inventory in the listings are sample UI data, not live offers.

## Connect a backend

Set `window.EVENT_API_BASE_URL` in `config.js` to your API origin. The client supports `GET /events`, `GET /ticket-listings`, `POST /bookings` with an `Idempotency-Key` UUID header, `GET /bookings/{id}`, and `DELETE /bookings/{id}`. The Admin page also calls `GET /admin/orders/{bookingId}/audit`. Protect that admin route with administrator authentication. The API must allow cross-origin browser requests. HTTP 409 responses display the conflict message, refresh listings, and return the customer to ticket selection.

This repository does not include a backend, payment processing, shared inventory, or automatic timeout release. The demo confirms bookings immediately in the current browser. A live backend must create atomic seat holds with an expiry and run a server-side expiry worker to return unpaid seats, even after a buyer closes the page. Return remaining quantity and explicit section/row/seat labels in ticket listings so later buyers can see exactly what is still available.

In demo mode, Admin searches local browser bookings and marks the seat pool as unverified. The audit API should return `booking` and `seatReleaseAudit` fields, including audit status (`verified`, `mismatch`, or `pending`), expected and released seat counts, current available count, and verification time. The UI never treats a cancelled status alone as proof that seats were released.

