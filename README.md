# ECHO LIVE — Concert Ticket Marketplace

ECHO LIVE is a responsive, framework-free concert ticket marketplace prototype built with HTML, CSS, and vanilla JavaScript. It features official Genting concert artwork, animated plum wave accents, a clickable Arena of Stars zone map, ticket listings, and filters.

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
