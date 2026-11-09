# ECHO LIVE — Concert Ticket Marketplace

ECHO LIVE is a responsive, framework-free concert ticket marketplace prototype built with HTML, CSS, and vanilla JavaScript. It uses a large-format event hero, concert artwork, a clickable venue map, ticket listings, and filters inspired by live-event resale marketplaces.

## Run the client

Open [`client/index.html`](client/index.html) in a browser. No package installation or build step is required. Demo bookings are stored in browser local storage.

The demo includes upcoming Kuala Lumpur events sourced from Live Nation Malaysia. Event dates, ticket status, and artwork link back to the official event pages. Ticket listing prices and inventory are sample data for UI demonstration and are not live offers.

## Connect an API

Set `window.EVENT_API_BASE_URL` in [`client/config.js`](client/config.js) to the backend origin. The client supports:

- `GET /events`
- `GET /ticket-listings?eventId=...&quantity=...&section=...`
- `POST /bookings` with a UUID `Idempotency-Key` header
- `GET /bookings/{id}`
- `DELETE /bookings/{id}`

HTTP 409 booking conflicts show the server message, return the customer to ticket selection, and refresh available listings.
