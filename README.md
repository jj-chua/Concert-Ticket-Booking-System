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

## Holds, timeout release, and admin audit

The current client is a prototype. Demo orders are saved in one browser and are confirmed immediately; there is no payment flow, shared seat pool, or automatic timeout release in this repository. Closing a browser tab cannot safely release a live hold by itself.

For a live system, the backend should atomically hold the selected seats when checkout starts, assign a configurable expiry (for example, 10 minutes), and release unpaid holds with a server-side expiry worker. The worker must continue even if the buyer closes the page. Ticket listings should include the remaining quantity and explicit section, row, and seat labels so later buyers can select from the inventory still available. On HTTP 409, the client already refreshes the listing data.

The Admin link opens an order lookup. In demo mode, it can search only orders saved in the current browser and deliberately marks seat-pool status as unverified. With an API configured, it requests:

- `GET /admin/orders/{bookingId}/audit`

The endpoint should be protected by administrator authentication and return an order plus its authoritative release audit, for example:

```json
{
  "booking": {
    "id": "booking-id",
    "status": "expired",
    "paymentStatus": "unpaid",
    "holdExpiresAt": "2026-11-11T12:10:00Z",
    "cancelReason": "payment_timeout",
    "eventName": "Concert name",
    "section": "CAT 1",
    "row": "A",
    "seats": ["A4", "A5"],
    "quantity": 2,
    "total": 500
  },
  "seatReleaseAudit": {
    "status": "verified",
    "expectedSeatCount": 2,
    "releasedSeatCount": 2,
    "availableSeatCount": 2,
    "verifiedAt": "2026-11-11T12:10:02Z",
    "message": "All held seats were returned to inventory."
  }
}
```

The Admin page displays the audit result returned by the backend; it does not infer a successful release from a cancelled order status alone.

