/* ECHO LIVE: concert ticket marketplace prototype, built with vanilla JavaScript. */
const API_BASE = (window.EVENT_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_MODE = !API_BASE;
const EVENTS = [
  { id: "mcr-kl-2026", name: "My Chemical Romance", tour: "SOUTHEAST ASIA 2026", date: "NOV 19–20, 2026", isoDate: "2026-11-19", venue: "TM Stadium Nasional", area: "Bukit Jalil, Kuala Lumpur", city: "Kuala Lumpur", time: "8:30 PM", state: "ON SALE", tag: "JUST ANNOUNCED", accent: "mcr", image: "https://dynamicmedia.livenationinternational.com/q/e/s/7e601e78-8c12-4424-9584-ab219054ea65.png?format=webp&quality=75&width=1920", imageAlt: "My Chemical Romance performing live", source: "https://www.livenation.my/event/my-chemical-romance-southeast-asia-2026-kuala-lumpur-tickets-edp1711397", sourceLabel: "Live Nation Malaysia", listings: [
    { id: "mcr-01", section: "Floor B", row: "GA", seats: "General admission", qty: 2, price: 588, badges: ["Standing", "Instant download"], score: 8.8 },
    { id: "mcr-02", section: "Lower 102", row: "H", seats: "Seats 7–8", qty: 2, price: 668, badges: ["Side view", "Instant download"], score: 9.1 },
    { id: "mcr-03", section: "Lower 116", row: "C", seats: "Seats 11–12", qty: 2, price: 748, badges: ["Aisle seats", "Great view"], score: 9.5 },
    { id: "mcr-04", section: "Upper 303", row: "A", seats: "Seats 3–4", qty: 4, price: 398, badges: ["Front row", "Instant download"], score: 8.4 },
  ] },
  { id: "wave-kl-2026", name: "wave to earth", tour: "THE PIECES TOUR", date: "NOV 22, 2026", isoDate: "2026-11-22", venue: "Idea Live Arena", area: "Petaling Jaya, Selangor", city: "Kuala Lumpur", time: "8:00 PM", state: "ON SALE", tag: "SELLING FAST", accent: "wave", image: "https://dynamicmedia.livenationinternational.com/y/b/e/f2d49dce-7266-4487-a111-6323bb0dbfa4.jpg?format=webp&quality=75&width=1920", imageAlt: "wave to earth — the pieces tour artwork", source: "https://www.livenation.my/event/wave-to-earth-the-pieces-tour-kuala-lumpur-tickets-edp1674881", sourceLabel: "Live Nation Malaysia", listings: [
    { id: "wave-01", section: "Floor A", row: "GA", seats: "General admission", qty: 2, price: 328, badges: ["Standing", "Instant download"], score: 9.3 },
    { id: "wave-02", section: "Lower 102", row: "D", seats: "Seats 4–5", qty: 2, price: 428, badges: ["Great view", "Instant download"], score: 9.6 },
    { id: "wave-03", section: "Lower 105", row: "K", seats: "Seats 9–10", qty: 4, price: 358, badges: ["Aisle seats"], score: 8.9 },
    { id: "wave-04", section: "Upper 202", row: "B", seats: "Seats 1–2", qty: 2, price: 288, badges: ["Best value"], score: 8.0 },
  ] },
  { id: "fkj-kl-2026", name: "FKJ", tour: "TYBER TOUR", date: "DEC 01, 2026", isoDate: "2026-12-01", venue: "Zepp Kuala Lumpur", area: "BBCC, Kuala Lumpur", city: "Kuala Lumpur", time: "Time TBC", state: "ON SALE", tag: "INTIMATE SHOW", accent: "fkj", image: "https://networksites.livenationinternational.com/networksites/vnlntkqv/fkj_press-photo-mc.jpg?format=webp&quality=75&width=1920", imageAlt: "FKJ artist image from Live Nation", source: "https://www.livenation.my/event/fkj-tyber-tour-kuala-lumpur-tickets-edp1685096", sourceLabel: "Live Nation Malaysia", listings: [
    { id: "fkj-01", section: "Floor A", row: "GA", seats: "General admission", qty: 2, price: 348, badges: ["Standing", "Instant download"], score: 9.1 },
    { id: "fkj-02", section: "Lower 102", row: "F", seats: "Seats 2–3", qty: 2, price: 388, badges: ["Great view"], score: 9.4 },
    { id: "fkj-03", section: "Lower 103", row: "M", seats: "Seats 9–10", qty: 4, price: 328, badges: ["Aisle seats"], score: 8.6 },
  ] },
  { id: "khalid-kl-2026", name: "Khalid", tour: "IT'S ALWAYS SUMMER SOMEWHERE", date: "DEC 09, 2026", isoDate: "2026-12-09", venue: "Idea Live Arena", area: "Petaling Jaya, Selangor", city: "Kuala Lumpur", time: "Time TBC", state: "ON SALE", tag: "NEW SHOW", accent: "khalid", image: "https://networksites.livenationinternational.com/networksites/0lrfzxsq/use-this-image-for-ticketing-page.jpg?format=webp&quality=75&width=1920", imageAlt: "Khalid — It's Always Summer Somewhere tour", source: "https://www.livenation.my/event/khalid-it-s-always-summer-somewhere-tour-kuala-lumpur-tickets-edp1685525", sourceLabel: "Live Nation Malaysia", listings: [
    { id: "khalid-01", section: "Floor A", row: "GA", seats: "General admission", qty: 2, price: 388, badges: ["Standing", "Instant download"], score: 9.2 },
    { id: "khalid-02", section: "Lower 104", row: "G", seats: "Seats 6–7", qty: 2, price: 468, badges: ["Great view"], score: 9.5 },
    { id: "khalid-03", section: "Upper 202", row: "C", seats: "Seats 13–14", qty: 4, price: 318, badges: ["Best value", "Aisle seats"], score: 8.5 },
  ] },
  { id: "babymonster-kl-2026", name: "BABYMONSTER", tour: "2026–27 WORLD TOUR [CHOOM]", date: "NOV 14, 2026", isoDate: "2026-11-14", venue: "Unifi Arena", area: "Bukit Jalil, Kuala Lumpur", city: "Kuala Lumpur", time: "5:00 PM", state: "SOLD OUT", tag: "SOLD OUT", accent: "baby", image: "https://pbs.twimg.com/media/HLYtX8lbgAAAipr.jpg?name=orig", imageAlt: "BABYMONSTER CHOOM World Tour poster", source: "https://www.livenation.my/event/2026-27-babymonster-world-tour-%EC%B6%A4-choom-in-kuala-lumpur-kuala-lumpur-tickets-edp1682916", sourceLabel: "Live Nation Malaysia", listings: [] },
];
const TIERS = [
  { id: "all", name: "All tickets" }, { id: "standing", name: "Standing" },
  { id: "seated", name: "Seated" }, { id: "instant", name: "Instant download" },
];
const SECTIONS = ["All sections", "Floor A", "Floor B", "Lower 102", "Lower 103", "Lower 104", "Lower 105", "Lower 116", "Upper 202", "Upper 303"];
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const money = value => `RM ${Number(value || 0).toFixed(2)}`;
const uuid = () => window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const n = Math.random() * 16 | 0; return (c === "x" ? n : (n & 3 | 8)).toString(16); });
const state = { step: 1, events: EVENTS, eventId: "mcr-kl-2026", section: "All sections", classFilter: "all", quantity: 2, sort: "recommended", minPrice: 0, maxPrice: 2000, listing: null, key: "", name: "", email: "", receipt: null, bookingId: "", booking: null, lookupBusy: false, cancelBusy: false, refreshing: false, toast: "", searchTerm: "", searchOpen: false };
const root = $("#root");
const currentEvent = () => state.events.find(item => item.id === state.eventId) || EVENTS[0];
const selectedCount = () => Number(state.quantity || 2);
const getBookings = () => { try { return JSON.parse(localStorage.getItem("echo-ticket-orders") || "[]"); } catch { return []; } };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { message: raw }; }
  if (!response.ok) { const error = new Error(data.message || data.error || `Request failed (${response.status})`); error.status = response.status; error.data = data; throw error; }
  return data;
}

function logo(size = 38) {
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 44 44" role="img" aria-label="ECHO LIVE logo"><rect x="1" y="1" width="42" height="42" rx="13" fill="#f2503b"/><path d="M10 17c2.5-3 5.2-4.5 8.4-4.5 3.2 0 5.4 1.3 7.8 4.1M10 27c2.5 3 5.2 4.5 8.4 4.5 3.2 0 5.4-1.3 7.8-4.1M27 17l7 5-7 5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="22" r="2.3" fill="#fff"/></svg>`;
}

function toast(message) {
  state.toast = message; render(); clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { state.toast = ""; render(); }, 4800);
}

function posterImage(event, className = "") {
  return `<div class="poster-frame ${esc(event.accent)} ${className}"><img src="${esc(event.image)}" alt="${esc(event.imageAlt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.parentElement.classList.add('poster-fallback')"><div class="poster-fallback-copy"><span>${esc(event.tour)}</span><strong>${esc(event.name)}</strong></div></div>`;
}

function getListings() {
  const event = currentEvent();
  let list = (event.listings || []).filter(item => item.qty >= selectedCount() && item.price >= Number(state.minPrice) && item.price <= Number(state.maxPrice));
  if (state.section !== "All sections") list = list.filter(item => item.section === state.section);
  if (state.classFilter === "standing") list = list.filter(item => item.badges.some(badge => badge.toLowerCase().includes("standing")));
  if (state.classFilter === "seated") list = list.filter(item => !item.badges.some(badge => badge.toLowerCase().includes("standing")));
  if (state.classFilter === "instant") list = list.filter(item => item.badges.some(badge => badge.toLowerCase().includes("instant")));
  if (state.sort === "price") list = list.sort((a, b) => a.price - b.price);
  else if (state.sort === "best") list = list.sort((a, b) => b.score - a.score);
  return list;
}

function eventCards() {
  const q = state.searchTerm.trim().toLowerCase();
  const events = state.events.filter(item => !q || `${item.name} ${item.tour} ${item.venue} ${item.city}`.toLowerCase().includes(q));
  if (!events.length) return `<div class="no-events">No shows found. Try another artist or venue.</div>`;
  return events.map(event => `<button class="event-card ${event.id === state.eventId ? "event-card-active" : ""}" data-action="event" data-id="${esc(event.id)}">${posterImage(event, "event-card-poster")}<div class="event-card-info"><div class="event-date">${esc(event.date)}</div><h3>${esc(event.name)}</h3><p>${esc(event.venue)} · ${esc(event.city)}</p><span class="event-sale ${event.state === "SOLD OUT" ? "is-sold-out" : ""}">${esc(event.state)}</span></div></button>`).join("");
}

function sectionMap() {
  const sections = [
    ["Upper 201", "Upper 202", "Upper 203"],
    ["Lower 116", "Lower 102", "Lower 103", "Lower 104", "Lower 105"],
    ["Floor A", "Floor B", "General Admission"],
  ];
  return `<div class="venue-map"><div class="stage-label">STAGE</div><div class="map-orbit map-upper">${sections[0].map(name => mapSection(name)).join("")}</div><div class="map-orbit map-lower">${sections[1].map(name => mapSection(name)).join("")}</div><div class="map-floor">${sections[2].map(name => mapSection(name)).join("")}</div><div class="map-footnote">Select a section to filter available tickets</div></div>`;
}

function mapSection(name) {
  const active = state.section === name;
  const available = currentEvent().listings?.some(item => item.section === name);
  return `<button class="map-zone ${active ? "zone-active" : ""} ${available ? "zone-available" : "zone-empty"}" data-action="section" data-section="${esc(name)}" title="${esc(name)}">${esc(name.replace("Lower ", "L").replace("Upper ", "U"))}</button>`;
}

function listingCard(item, index) {
  const estimated = item.price * selectedCount();
  return `<article class="ticket-listing"><div class="deal-stamp ${index === 0 ? "best-deal" : ""}">${index === 0 ? "GREAT VALUE" : esc(item.badges[0] || "AVAILABLE")}</div><div class="ticket-main"><div class="ticket-section-line"><h3>${esc(item.section)}</h3><span class="ticket-type-pill">${item.badges.some(b => b.includes("Standing")) ? "Standing" : "Seated"}</span></div><p class="ticket-row">${item.row === "GA" ? "General admission" : `Row ${esc(item.row)} · ${esc(item.seats)}`}</p><div class="ticket-perks">${item.badges.map(badge => `<span>✓ ${esc(badge)}</span>`).join("")}</div></div><div class="ticket-stock"><strong>${item.qty} tickets</strong><span>together</span></div><div class="ticket-price"><strong>${money(item.price)}</strong><span>per ticket</span><small>${money(estimated)} total</small></div><button class="primary-btn ticket-cta" data-action="choose-listing" data-id="${esc(item.id)}">See tickets <span>→</span></button></article>`;
}

function listingPanel(event) {
  const listings = getListings();
  const sectionOptions = SECTIONS.map(section => `<option value="${esc(section)}" ${state.section === section ? "selected" : ""}>${esc(section)}</option>`).join("");
  const filters = TIERS.map(item => `<button class="filter-chip ${state.classFilter === item.id ? "filter-active" : ""}" data-action="class-filter" data-filter="${item.id}">${item.name}</button>`).join("");
  return `<div class="market-grid"><section class="map-card"><div class="card-heading"><div><span class="section-kicker">VENUE MAP</span><h2>Find your view</h2></div><button class="map-help" data-action="map-help" aria-label="Map information">?</button></div>${sectionMap()}<div class="map-legend"><span><i class="legend-dot dot-available"></i>Tickets available</span><span><i class="legend-dot dot-selected"></i>Selected section</span><span><i class="legend-dot dot-none"></i>No listings</span></div><button class="clear-section" data-action="clear-section">Show all sections</button></section><section class="listings-column"><div class="listings-toolbar"><div><span class="section-kicker">${esc(event.name.toUpperCase())} · ${esc(event.venue.toUpperCase())}</span><h2>Tickets for this show</h2><p>${listings.length} demo listings · Prices shown per ticket</p></div><a class="official-link" href="${esc(event.source)}" target="_blank" rel="noopener">Official event info ↗</a></div><div class="filter-panel"><div class="filter-row"><label class="quantity-filter"><span>Tickets</span><select data-change="quantity">${[1,2,3,4,5,6].map(n => `<option ${n === selectedCount() ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="section-filter"><span>Section</span><select data-change="section">${sectionOptions}</select></label><label class="sort-filter"><span>Sort by</span><select data-change="sort"><option value="recommended" ${state.sort === "recommended" ? "selected" : ""}>Recommended</option><option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option><option value="best" ${state.sort === "best" ? "selected" : ""}>Best view</option></select></label></div><div class="filter-chips">${filters}</div><div class="price-filter"><label>Price per ticket <strong>${money(state.minPrice)} – ${money(state.maxPrice)}</strong></label><div><input aria-label="Minimum price" type="range" min="0" max="2000" step="25" value="${state.minPrice}" data-change="min-price"><input aria-label="Maximum price" type="range" min="100" max="2000" step="25" value="${state.maxPrice}" data-change="max-price"></div></div></div><div class="demo-notice"><span>i</span><p><strong>Sample marketplace listings</strong> — prices and availability here are demo data. Connect your ticket inventory API to show live offers.</p></div><div class="listing-header"><strong>${listings.length} listings</strong><span>Price includes estimated fees</span></div><div class="listing-results">${listings.length ? listings.map(listingCard).join("") : `<div class="empty-listings"><strong>No tickets match these filters.</strong><span>Try another section or ticket type.</span><button data-action="clear-filters">Clear filters</button></div>`}</div></section></div>`;
}

function stepper() {
  return `<nav class="purchase-steps" aria-label="Purchase steps"><button class="purchase-step ${state.step === 1 ? "active" : ""}" data-action="step" data-step="1"><span>1</span>Find tickets</button><i></i><button class="purchase-step ${state.step === 2 ? "active" : ""}" data-action="step" data-step="2" ${!state.listing ? "disabled" : ""}><span>2</span>Review</button><i></i><button class="purchase-step ${state.step === 3 ? "active" : ""}" data-action="step" data-step="3" ${!state.listing ? "disabled" : ""}><span>3</span>Checkout</button><i></i><button class="purchase-step ${state.step === 4 ? "active" : ""}" data-action="manage"><span>4</span>My bookings</button></nav>`;
}

function reviewView(event) {
  const item = state.listing;
  if (!item) return `<section class="review-card"><h2>Choose a ticket first</h2><button class="primary-btn" data-action="step" data-step="1">Browse tickets →</button></section>`;
  const quantity = Math.min(selectedCount(), item.qty);
  return `<section class="review-card"><div class="review-heading"><div><span class="section-kicker">YOUR TICKET SELECTION</span><h2>Make sure it's your moment</h2></div><span class="secure-pill">✓ Secure booking</span></div><div class="review-event"><div class="review-poster">${posterImage(event)}</div><div><span class="section-kicker">${esc(event.tour)}</span><h3>${esc(event.name)}</h3><p>${esc(event.date)} · ${esc(event.time)}</p><p>${esc(event.venue)} · ${esc(event.area)}</p></div></div><div class="review-ticket-row"><div><span class="section-kicker">SECTION / ROW</span><strong>${esc(item.section)} · ${item.row === "GA" ? "General Admission" : `Row ${esc(item.row)}`}</strong><small>${esc(item.seats)}</small></div><div><span class="section-kicker">QUANTITY</span><strong>${quantity} tickets</strong></div><div><span class="section-kicker">PRICE EACH</span><strong>${money(item.price)}</strong></div></div><div class="review-total"><div><span>Estimated total <small>Includes estimated fees</small></span><strong>${money(item.price * quantity)}</strong></div><p>Tickets are demo inventory until a live marketplace API is connected.</p></div><div class="review-actions"><button class="secondary-btn" data-action="step" data-step="1">← Back to tickets</button><button class="primary-btn" data-action="begin-checkout">Continue to checkout&nbsp; →</button></div></section>`;
}

function checkoutView(event) {
  if (state.receipt) return `<section class="receipt-card"><div class="receipt-success"><span>✓</span><div class="section-kicker">BOOKING CONFIRMED</div><h2>Your night is booked.</h2><p>Your e-ticket details are below.</p></div><div class="receipt-paper"><div class="receipt-paper-top">${logo(30)}<span>ECHO LIVE · E-TICKET</span></div><div class="receipt-ref"><span>BOOKING REFERENCE</span><strong>${esc(state.receipt.id || "Reference unavailable")}</strong></div><div class="receipt-grid"><div><small>EVENT</small><strong>${esc(state.receipt.eventName || event.name)}</strong></div><div><small>VENUE</small><strong>${esc(state.receipt.venue || event.venue)}</strong></div><div><small>DATE / TIME</small><strong>${esc(state.receipt.date || event.date)} · ${esc(state.receipt.time || event.time)}</strong></div><div><small>SECTION / ROW</small><strong>${esc(state.receipt.section || state.listing?.section)} · ${esc(state.receipt.row || state.listing?.row)}</strong></div><div><small>QUANTITY</small><strong>${Number(state.receipt.quantity || state.quantity)} tickets</strong></div><div><small>TOTAL</small><strong>${money(state.receipt.total ?? state.listing?.price * state.quantity)}</strong></div></div></div><div class="receipt-actions"><button class="secondary-btn" data-action="show-booking">Manage booking</button><button class="primary-btn" data-action="new-search">Explore more shows&nbsp; →</button></div></section>`;
  const item = state.listing;
  if (!item) return `<section class="review-card"><h2>Choose a ticket first</h2><button class="primary-btn" data-action="step" data-step="1">Browse tickets →</button></section>`;
  return `<section class="checkout-card"><div class="checkout-heading"><div><span class="section-kicker">FINAL STEP</span><h2>Checkout</h2><p>You're one step away from a live night out.</p></div><span class="secure-pill">✓ Secure checkout</span></div><div class="checkout-layout"><form class="checkout-form" id="checkout-form"><h3>Ticket delivery</h3><label>Full name<input required name="customerName" value="${esc(state.name)}" placeholder="Name on the booking"></label><label>Email address<input required name="customerEmail" type="email" value="${esc(state.email)}" placeholder="you@example.com"></label><div class="idempotency-note"><span>Request protection</span><code>${esc(state.key)}</code><b>READY</b></div><button class="primary-btn checkout-submit" type="submit">Confirm booking · ${money(item.price * selectedCount())}</button><p class="demo-terms">Prototype checkout only — no payment is collected.</p></form><aside class="checkout-summary"><span class="section-kicker">ORDER SUMMARY</span><h3>${esc(event.name)}</h3><p>${esc(event.date)} · ${esc(event.venue)}</p><div class="summary-line"><span>${esc(item.section)} · Row ${esc(item.row)} × ${selectedCount()}</span><strong>${money(item.price * selectedCount())}</strong></div><div class="summary-line"><span>Estimated fees</span><strong>Included</strong></div><div class="summary-total"><span>Total</span><strong>${money(item.price * selectedCount())}</strong></div><div class="summary-note">Tickets sent to your email after booking.</div></aside></div><button class="secondary-btn checkout-back" data-action="step" data-step="2">← Back to review</button></section>`;
}

function bookingView() {
  const booking = state.booking;
  const cancelled = ["cancelled", "canceled"].includes(String(booking?.status || "").toLowerCase());
  return `<section class="manage-card" id="booking-search"><div class="manage-heading"><span class="section-kicker">YOUR ECHO LIVE ORDERS</span><h2>Manage a booking</h2><p>Enter the booking reference from your confirmation email.</p></div><form id="lookup-form"><label for="booking-reference">Booking reference</label><div class="lookup-row"><input id="booking-reference" name="bookingId" value="${esc(state.bookingId)}" placeholder="e.g. 3c2b1a…" autocomplete="off"><button class="primary-btn" type="submit" ${state.lookupBusy ? "disabled" : ""}>${state.lookupBusy ? "Searching…" : "Find booking →"}</button></div></form>${booking ? `<article class="booking-result"><div class="booking-result-head"><div><span class="section-kicker">BOOKING DETAILS</span><h3>${esc(booking.eventName || booking.event || "Live event")}</h3></div><span class="booking-status ${cancelled ? "cancelled" : ""}">${cancelled ? "CANCELLED" : esc(String(booking.status || "CONFIRMED").toUpperCase())}</span></div><div class="result-ref">Reference <strong>${esc(booking.id || booking.bookingId || state.bookingId)}</strong></div><div class="receipt-grid"><div><small>VENUE</small><strong>${esc(booking.venue || "—")}</strong></div><div><small>DATE / TIME</small><strong>${esc(booking.date || "—")} · ${esc(booking.time || "—")}</strong></div><div><small>SECTION / ROW</small><strong>${esc(booking.section || "—")} · ${esc(booking.row || "—")}</strong></div><div><small>QUANTITY / TOTAL</small><strong>${Number(booking.quantity || 0)} · ${money(booking.total)}</strong></div></div><div class="result-actions"><span>Cancelled tickets return to availability.</span><button class="cancel-button" data-action="cancel-booking" ${state.cancelBusy || cancelled ? "disabled" : ""}>${state.cancelBusy ? "Cancelling…" : "Cancel booking"}</button></div></article>` : `<div class="empty-bookings"><span>▤</span><strong>No booking selected</strong><small>Your ticket details will appear here.</small></div>`}<button class="secondary-btn" data-action="step" data-step="1">← Browse shows</button></section>`;
}

function render() {
  const event = currentEvent();
  root.innerHTML = `<div class="app-shell"><header class="topbar ${state.searchOpen ? "search-open" : ""}"><a class="brand" href="#top">${logo()}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><nav class="main-nav"><a href="#shows">Concerts</a><a class="active" href="#market">Tickets</a><a href="#footer">Help</a></nav><div class="top-actions"><label class="search-box"><span>⌕</span><input name="eventSearch" value="${esc(state.searchTerm)}" placeholder="Artist, event or venue" aria-label="Search shows"></label><button class="location-button" data-action="scroll-market">⌖ <span>Kuala Lumpur</span>⌄</button><button class="account-button" data-action="manage">My tickets</button></div><button class="mobile-search" data-action="toggle-search" aria-label="Search">⌕</button></header><main id="top"><section class="event-hero"><img class="hero-photo" src="${esc(event.image)}" alt="${esc(event.imageAlt)}" onerror="this.hidden=true"><div class="hero-shade"></div><div class="hero-inner"><div class="hero-event-copy"><div class="hero-tags"><span>${esc(event.tag)}</span><span class="live-tag">LIVE MUSIC</span></div><p class="hero-kicker">${esc(event.tour)}</p><h1>${esc(event.name)}</h1><p class="hero-meta">${esc(event.date)} <i></i> ${esc(event.venue)} <i></i> ${esc(event.area)}</p><p class="hero-time">${esc(event.time)} · ${esc(event.state === "SOLD OUT" ? "Official tickets sold out" : "Tickets available")}</p><a class="primary-btn hero-button" href="#market">Find tickets&nbsp; ↓</a></div><div class="hero-poster-wrap">${posterImage(event, "hero-poster")}<span>OFFICIAL EVENT ARTWORK</span></div></div><div class="hero-bottom"><span><i class="live-dot"></i> ECHO LIVE PICKS</span><a href="${esc(event.source)}" target="_blank" rel="noopener">Official event details ↗</a></div></section>
      <section class="discovery" id="shows"><div class="discovery-head"><div><span class="section-kicker">UP NEXT IN KUALA LUMPUR</span><h2>Find your next live moment</h2><p>Fresh tour dates. Big nights. All in one place.</p></div><button class="all-shows" data-action="scroll-market">View all shows&nbsp; →</button></div><div class="event-strip">${eventCards()}</div></section>
      <section class="market-section" id="market"><div class="market-heading"><div><span class="section-kicker">TICKETS FOR ${esc(event.name.toUpperCase())}</span><h2>Pick a spot. Feel every song.</h2><p>${esc(event.date)} · ${esc(event.venue)} · ${esc(event.area)}</p></div><div class="event-status ${event.state === "SOLD OUT" ? "sold-out" : ""}"><i></i>${esc(event.state)}</div></div>${stepper()}${state.step === 1 ? listingPanel(event) : ""}${state.step === 2 ? reviewView(event) : ""}${state.step === 3 ? checkoutView(event) : ""}${state.step === 4 ? bookingView() : ""}</section>
    </main><footer class="site-footer" id="footer"><a class="brand footer-brand" href="#top">${logo(32)}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><span>© ${new Date().getFullYear()} ECHO LIVE. All rights reserved.</span><div><a href="#footer">Help center</a><a href="#footer">Terms</a><a href="#footer">Privacy</a></div></footer>${DEMO_MODE ? '<div class="demo-badge"><i></i>DEMO MARKETPLACE</div>' : ""}${state.toast ? `<div class="toast" role="status"><span>!</span>${esc(state.toast)}<button data-action="dismiss" aria-label="Dismiss">×</button></div>` : ""}</div>`;
}

function setStep(step) {
  if (step === 2 && !state.listing) return;
  if (step === 3 && !state.listing) return;
  if (step === 3 && state.step !== 3) { state.key = uuid(); state.receipt = null; }
  state.step = step; render();
}

async function refreshListings() {
  if (DEMO_MODE) { state.refreshing = false; render(); return; }
  state.refreshing = true; render();
  try {
    const params = new URLSearchParams({ eventId: state.eventId, quantity: String(state.quantity), section: state.section });
    const data = await request(`/ticket-listings?${params}`);
    const list = Array.isArray(data) ? data : data.listings;
    if (Array.isArray(list)) currentEvent().listings = list;
  } catch { state.toast = "Ticket availability could not refresh. Try again in a moment."; }
  state.refreshing = false; render();
}

async function loadEvents() {
  if (DEMO_MODE) return;
  try {
    const data = await request("/events");
    const list = Array.isArray(data) ? data : data.events;
    if (Array.isArray(list) && list.length) {
      state.events = list.map((item, i) => ({ ...EVENTS[i % EVENTS.length], ...item, id: item.id || item.eventId, name: item.name || item.title || "Live event", venue: item.venue || item.venueName || "Venue TBC", date: item.dateLabel || item.date || EVENTS[i % EVENTS.length].date, source: item.source || item.url || EVENTS[i % EVENTS.length].source, listings: item.listings || [] }));
      if (!state.events.some(item => item.id === state.eventId)) state.eventId = state.events[0].id;
    }
  } catch { /* Keep current event cards. */ }
  render();
}

root.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "event") {
    state.eventId = button.dataset.id; state.section = "All sections"; state.listing = null; state.step = 1; render(); refreshListings();
  } else if (action === "section") { state.section = button.dataset.section; render(); }
  else if (action === "clear-section") { state.section = "All sections"; render(); }
  else if (action === "class-filter") { state.classFilter = button.dataset.filter; render(); }
  else if (action === "clear-filters") { state.section = "All sections"; state.classFilter = "all"; state.minPrice = 0; state.maxPrice = 2000; state.quantity = 2; render(); }
  else if (action === "choose-listing") { state.listing = currentEvent().listings.find(item => item.id === button.dataset.id) || null; setStep(2); }
  else if (action === "step") setStep(Number(button.dataset.step));
  else if (action === "begin-checkout") setStep(3);
  else if (action === "manage") { event.preventDefault(); state.booking = null; setStep(4); }
  else if (action === "show-booking") { state.bookingId = state.receipt?.id || ""; state.booking = state.receipt; setStep(4); }
  else if (action === "new-search") { state.listing = null; state.receipt = null; state.section = "All sections"; setStep(1); }
  else if (action === "cancel-booking") await cancelBooking();
  else if (action === "dismiss") { state.toast = ""; render(); }
  else if (action === "map-help") toast("Choose a highlighted zone to filter available ticket listings. Demo section positions are illustrative.");
  else if (action === "toggle-search") { state.searchOpen = !state.searchOpen; render(); if (state.searchOpen) $('[name="eventSearch"]')?.focus(); }
  else if (action === "scroll-market") { event.preventDefault(); $("#market")?.scrollIntoView({ behavior: "smooth" }); }
});

root.addEventListener("change", event => {
  const target = event.target;
  if (target.dataset.change === "quantity") state.quantity = Number(target.value);
  else if (target.dataset.change === "section") state.section = target.value;
  else if (target.dataset.change === "sort") state.sort = target.value;
  else if (target.dataset.change === "min-price") { state.minPrice = Number(target.value); if (state.minPrice > state.maxPrice) state.maxPrice = state.minPrice; }
  else if (target.dataset.change === "max-price") { state.maxPrice = Number(target.value); if (state.maxPrice < state.minPrice) state.minPrice = state.maxPrice; }
  else return;
  render();
});
root.addEventListener("input", event => {
  const target = event.target;
  if (target.name === "eventSearch") { state.searchTerm = target.value; const position = target.selectionStart; render(); const next = $('[name="eventSearch"]'); next?.focus(); next?.setSelectionRange(position, position); }
  else if (target.name === "customerName") state.name = target.value;
  else if (target.name === "customerEmail") state.email = target.value;
  else if (target.name === "bookingId") state.bookingId = target.value;
});
root.addEventListener("submit", async event => {
  if (event.target.id === "checkout-form") { event.preventDefault(); await submitBooking(); }
  else if (event.target.id === "lookup-form") { event.preventDefault(); await findBooking(); }
});

async function submitBooking() {
  if (!state.key || !state.listing) return;
  const event = currentEvent();
  const payload = { eventId: event.id, eventName: event.name, venue: event.venue, date: event.date, time: event.time, section: state.listing.section, row: state.listing.row, ticketType: state.listing.badges.join(", "), listingId: state.listing.id, quantity: selectedCount(), customerName: state.name.trim(), email: state.email.trim(), total: state.listing.price * selectedCount() };
  try {
    let booking;
    if (DEMO_MODE) {
      booking = { id: uuid(), status: "confirmed", ...payload, listingSnapshot: state.listing, createdAt: new Date().toISOString() };
      localStorage.setItem("echo-ticket-orders", JSON.stringify([booking, ...getBookings()]));
      event.listings = event.listings.filter(item => item.id !== state.listing.id);
    } else booking = await request("/bookings", { method: "POST", headers: { "Idempotency-Key": state.key }, body: JSON.stringify(payload) });
    state.receipt = { ...booking, id: booking.id || booking.bookingId || booking.booking_id, status: booking.status || "confirmed" };
    state.bookingId = state.receipt.id || "";
    toast("You're booked. Your e-ticket is ready.");
  } catch (error) {
    if (error.status === 409) {
      const details = error.data || {};
      state.toast = details.message || "Those tickets are no longer available. Please choose another listing.";
      state.step = 1; state.listing = null; render();
      await refreshListings();
    } else toast(error.message || "Booking could not be completed. Please try again.");
  }
}

async function findBooking() {
  const id = state.bookingId.trim();
  if (!id) return;
  state.lookupBusy = true; state.booking = null; render();
  try {
    const booking = DEMO_MODE ? getBookings().find(item => String(item.id).toLowerCase() === id.toLowerCase()) : await request(`/bookings/${encodeURIComponent(id)}`);
    if (!booking) throw new Error("We couldn't find that booking. Check the reference and try again.");
    state.booking = booking;
  } catch (error) { state.toast = error.message || "We couldn't find that booking."; }
  state.lookupBusy = false; render();
}

async function cancelBooking() {
  const id = state.booking?.id || state.booking?.bookingId || state.bookingId.trim();
  if (!id || !state.booking) return;
  state.cancelBusy = true; render();
  try {
    let result;
    if (DEMO_MODE) {
      const saved = getBookings().map(item => item.id === id ? { ...item, status: "cancelled" } : item);
      localStorage.setItem("echo-ticket-orders", JSON.stringify(saved)); result = saved.find(item => item.id === id);
      const ownerEvent = state.events.find(item => item.id === result?.eventId);
      if (ownerEvent && result?.listingSnapshot && !ownerEvent.listings.some(item => item.id === result.listingSnapshot.id)) ownerEvent.listings.push(result.listingSnapshot);
    } else result = await request(`/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.booking = { ...state.booking, ...result, status: result?.status || "cancelled" };
    state.toast = "Your booking has been cancelled.";
  } catch (error) { state.toast = error.message || "Cancellation failed. Please try again."; }
  state.cancelBusy = false; render();
}

render();
loadEvents();
