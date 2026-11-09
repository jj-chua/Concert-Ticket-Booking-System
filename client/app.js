/* ECHO LIVE — framework-free concert ticket booking client. */
const API_BASE = (window.EVENT_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_MODE = !API_BASE;
const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];
const DEFAULT_BOOKED = new Set(["A1", "A2", "A8", "B3", "B4", "C7", "D2", "D8", "E5", "F1", "F8"]);
const EVENTS = [
  { id: "afterglow", title: "AFTERGLOW", artist: "Luna Vale", tour: "AFTERGLOW WORLD TOUR", genre: "Indie pop · Live", date: "2026-11-28", dateLabel: "NOV 28, 2026", city: "Kuala Lumpur", venue: "Axiata Arena", time: "8:00 PM", doors: "Doors open 6:30 PM", accent: "afterglow", tagline: "One night. A thousand feelings.", code: "LV" },
  { id: "aurora", title: "AURORA NIGHTS", artist: "The Midnight", tour: "NIGHT DRIVES TOUR", genre: "Synthwave · Live", date: "2026-12-12", dateLabel: "DEC 12, 2026", city: "Kuala Lumpur", venue: "KL Live", time: "8:30 PM", doors: "Doors open 7:00 PM", accent: "aurora", tagline: "Take the long way home.", code: "TM" },
  { id: "echoes", title: "ECHOES IN BLUE", artist: "Kairo", tour: "ECHOES WORLD TOUR", genre: "Alternative · Live", date: "2027-01-16", dateLabel: "JAN 16, 2027", city: "Kuala Lumpur", venue: "Zepp Kuala Lumpur", time: "8:00 PM", doors: "Doors open 6:30 PM", accent: "echoes", tagline: "Some sounds stay with you.", code: "KA" },
];
const TIERS = [
  { id: "floor", name: "Floor Standing", detail: "General admission · closest to the stage", price: 318 },
  { id: "lower", name: "Lower Bowl", detail: "Reserved seat · clear stage view", price: 268 },
  { id: "vip", name: "VIP Experience", detail: "Priority entry · exclusive merch", price: 528 },
];
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const money = value => `RM ${Number(value || 0).toFixed(2)}`;
const uuid = () => window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const n = Math.random() * 16 | 0; return (c === "x" ? n : (n & 3 | 8)).toString(16); });
const seatId = seat => typeof seat === "string" ? seat : seat?.id || seat?.seatId || seat?.label || "";
const dateIso = value => { const date = new Date(`${value}T12:00:00`); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
const dateParts = value => { const date = new Date(`${value}T12:00:00`); return { weekday: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date), day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date), month: new Intl.DateTimeFormat("en", { month: "short" }).format(date) }; };
const dateLong = value => new Date(`${value}T12:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
const initialSeats = () => Object.fromEntries(ROWS.flatMap(row => COLS.map(col => { const id = `${row}${col}`; return [id, DEFAULT_BOOKED.has(id) ? "booked" : "available"]; })));
const state = { step: 1, events: EVENTS, eventId: EVENTS[0].id, date: EVENTS[0].date, venue: EVENTS[0].venue, time: EVENTS[0].time, times: [], tierId: "lower", seats: initialSeats(), selected: [], toast: "", loading: false, key: "", name: "", email: "", receipt: null, bookingId: "", booking: null, lookupBusy: false, cancelBusy: false };
const root = $("#root");
const eventNow = () => state.events.find(item => item.id === state.eventId) || EVENTS[0];
const tierNow = () => TIERS.find(item => item.id === state.tierId) || TIERS[1];
const subtotal = () => state.selected.length * tierNow().price;
const demoBookings = () => { try { return JSON.parse(localStorage.getItem("echo-live-bookings") || "[]"); } catch { return []; } };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) { const error = new Error(data.message || data.error || `Request failed (${response.status})`); error.status = response.status; error.data = data; throw error; }
  return data;
}

function echoMark(size = 38, extra = "") {
  return `<svg class="brand-symbol ${extra}" width="${size}" height="${size}" viewBox="0 0 44 44" role="img" aria-label="ECHO LIVE mark"><defs><linearGradient id="echo-gradient" x1="5" y1="6" x2="39" y2="38" gradientUnits="userSpaceOnUse"><stop stop-color="#e6ff80"/><stop offset="1" stop-color="#b7ef32"/></linearGradient></defs><rect x="1" y="1" width="42" height="42" rx="13" fill="#d5ff45"/><path d="M10 17.2c2.2-3.2 5.2-4.8 9-4.8 3.1 0 5.6 1.1 7.6 3.4M10 26.8c2.2 3.2 5.2 4.8 9 4.8 3.1 0 5.6-1.1 7.6-3.4M27.2 16.8l6.8 5.2-6.8 5.2" fill="none" stroke="#14160c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="22" r="2.3" fill="#14160c"/></svg>`;
}

function announce(message) {
  state.toast = message;
  render();
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => { state.toast = ""; render(); }, 5200);
}

async function refreshSeats() {
  if (DEMO_MODE) return;
  state.loading = true; render();
  const params = new URLSearchParams({ eventId: state.eventId, venue: state.venue, date: state.date, time: state.time, tier: state.tierId });
  try {
    const data = await request(`/shows/${encodeURIComponent(`${state.eventId}-${state.date}-${state.time}`)}/seats?${params}`);
    const list = Array.isArray(data) ? data : data.seats;
    if (Array.isArray(list)) {
      const next = Object.fromEntries(ROWS.flatMap(row => COLS.map(col => [`${row}${col}`, "available"])));
      list.forEach(seat => { const id = seatId(seat); if (id in next) next[id] = ["booked", "locked", "reserved", "unavailable"].includes(String(seat.status || "").toLowerCase()) ? "booked" : "available"; });
      state.seats = next;
      state.selected = state.selected.filter(id => next[id] === "available");
    }
  } catch { state.toast = "Could not refresh the seat map. Showing the latest available demo layout."; }
  state.loading = false; render();
}

async function loadEvents() {
  if (DEMO_MODE) return;
  try {
    const data = await request("/events");
    const list = Array.isArray(data) ? data : data.events;
    if (Array.isArray(list) && list.length) {
      state.events = list.map((item, i) => ({ ...EVENTS[i % EVENTS.length], ...item, id: item.id || item.eventId, title: item.title || item.name, artist: item.artist || item.headliner || "Live artist", date: item.date || item.startDate || EVENTS[i % EVENTS.length].date, venue: item.venue || item.venueName || EVENTS[i % EVENTS.length].venue, accent: item.accent || EVENTS[i % EVENTS.length].accent }));
      if (!state.events.some(item => item.id === state.eventId)) { state.eventId = state.events[0].id; state.date = state.events[0].date; state.venue = state.events[0].venue; state.time = state.events[0].time; }
    }
  } catch { /* keep the sample line-up */ }
  render();
}

async function loadShowtimes() {
  if (DEMO_MODE) { state.times = [eventNow().time]; return; }
  try {
    const params = new URLSearchParams({ eventId: state.eventId, venue: state.venue, date: state.date });
    const data = await request(`/shows?${params}`);
    const list = Array.isArray(data) ? data : data.shows;
    const matching = Array.isArray(list) ? list.filter(item => (!item.venue && !item.venueName) || item.venue === state.venue || item.venueName === state.venue) : [];
    const showOptions = matching.map(item => ({ id: item.id || item.showId, time: item.time || item.showtime || item.startsAt || item.startTime })).filter(item => item.time);
    if (showOptions.length) {
      state.times = showOptions.map(item => typeof item.time === "string" && item.time.includes("T") ? { ...item, time: new Date(item.time).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" }) } : item);
      if (!state.times.some(item => (typeof item === "string" ? item : item.time) === state.time)) state.time = typeof state.times[0] === "string" ? state.times[0] : state.times[0].time;
    } else state.times = [eventNow().time];
  } catch { state.times = [eventNow().time]; }
  render();
}

function render() {
  const event = eventNow();
  const tier = tierNow();
  const steps = ["Choose a show", "Pick your seats", "Checkout", "Manage booking"].map((label, index) => `<button class="step-item ${state.step === index + 1 ? "is-current" : ""} ${state.step > index + 1 ? "is-done" : ""}" data-action="step" data-step="${index + 1}"><span class="step-number">${state.step > index + 1 ? "✓" : `0${index + 1}`}</span><span>${label}</span>${index < 3 ? '<i class="step-line"></i>' : ""}</button>`).join("");
  const cards = state.events.map((item, index) => `<button class="event-card ${item.id === state.eventId ? "event-selected" : ""}" data-action="event" data-id="${esc(item.id)}"><div class="event-poster ${esc(item.accent || "afterglow")}"><span class="event-index">0${index + 1}</span><span class="event-type">LIVE TOUR</span><div class="event-art"><strong>${esc(item.code || item.artist?.split(" ").map(part => part[0]).join("") || "LIVE")}</strong></div><div class="event-poster-bottom"><span>${esc(item.tour || "LIVE IN KUALA LUMPUR")}</span><strong>${esc(item.title)}</strong></div>${item.id === state.eventId ? '<span class="event-check">✓</span>' : ""}</div><div class="event-info"><span class="event-date-tag">${esc(item.dateLabel || item.date || "ON SALE")}</span><span>${esc(item.artist)}</span><span class="event-city">${esc(item.city || "Kuala Lumpur")}</span></div></button>`).join("");
  const dateChips = state.events.flatMap(item => (item.dates || [item.date]).map((date, index) => ({ date, eventId: item.id, label: dateParts(date), index }))).filter(item => item.eventId === event.id).map(item => `<button class="date-chip ${item.date === state.date ? "date-active" : ""}" data-action="date" data-date="${esc(item.date)}"><span>${item.index === 0 ? "SAT" : item.label.weekday.toUpperCase()}</span><strong>${item.label.day}</strong><small>${item.label.month.toUpperCase()}</small></button>`).join("");
  const times = (state.times.length ? state.times : [event.time]).map(item => { const time = typeof item === "string" ? item : item.time; return `<button class="time-chip ${time === state.time ? "time-active" : ""}" data-action="time" data-time="${esc(time)}"><strong>${esc(time)}</strong><span>From RM ${tier.price}</span></button>`; }).join("");
  const tierCards = TIERS.map(item => `<button class="tier-card ${item.id === state.tierId ? "tier-active" : ""}" data-action="tier" data-tier="${item.id}"><span><strong>${item.name}</strong><small>${item.detail}</small></span><b>${money(item.price)}</b></button>`).join("");
  const sorted = state.selected.slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  root.innerHTML = `<div class="app-shell">
    <header class="topbar"><a class="brand" href="#top" aria-label="ECHO LIVE home">${echoMark()}<span class="brand-name">ECHO LIVE<small>FEEL IT TOGETHER</small></span></a><nav class="main-nav"><a class="nav-active" href="#events">Discover</a><a href="#booking">Venues</a><a href="#booking-search" data-action="manage">My tickets</a></nav><div class="topbar-right"><button class="location-pill" data-action="cycle-venue"><span class="pin">⌖</span>${esc(event.city || "Kuala Lumpur")}⌄</button><button class="language-btn">EN&nbsp;⌄</button><button class="avatar">E</button></div></header>
    <main id="top"><section class="hero hero-${esc(event.accent || "afterglow")}"><div class="hero-glow"></div><div class="hero-grain"></div><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-line"></span>THE LIVE MUSIC EXPERIENCE</div><p class="hero-kicker">FEATURED SHOW · ${esc(event.dateLabel || event.date)}</p><h1>${esc(event.title)}</h1><p class="hero-artist">${esc(event.tour || event.artist.toUpperCase())}</p><p class="hero-tagline">${esc(event.tagline || "Your next unforgettable night starts here.")}</p><div class="hero-meta"><span class="tag">LIVE</span>${esc(event.genre || "Live music")}<i></i>${esc(event.venue)}<i></i>${esc(event.city || "Kuala Lumpur")}</div><button class="primary-btn hero-cta" data-action="scroll-booking">Find tickets <span>↗</span></button></div><div class="hero-art" aria-hidden="true"><div class="stage-halo"></div><div class="stage-beam"></div><div class="stage-disc"></div><div class="stage-person"></div><div class="stage-mic"></div><span class="art-label">ONE NIGHT<br>ONLY</span></div><div class="hero-counter"><span>0${Math.max(1, state.events.findIndex(item => item.id === event.id) + 1)}</span><div class="counter-track"><i></i></div>${String(state.events.length).padStart(2, "0")}</div><div class="hero-bottom"><span><i class="live-dot"></i>ON SALE NOW</span><span>Good nights make great stories.</span></div></section>
    <section class="booking-section" id="booking"><div class="section-heading"><div><span class="section-kicker">YOUR NEXT ENCORE IS HERE</span><h2>Find your live moment</h2></div><button class="text-link" data-action="manage">Find / manage a booking <span>↗</span></button></div><div class="stepper">${steps}</div>
      ${state.step === 1 ? `<div class="flow-panel" id="events"><div class="panel-top"><div><span class="section-kicker">CURATED FOR THE CROWD</span><h3>Upcoming shows <span class="count-pill">${state.events.length} live experiences</span></h3></div><button class="filter-button">All events&nbsp;⌄</button></div><div class="event-grid">${cards}</div><div class="selection-divider"></div><div class="selection-head"><div><span class="section-kicker">MAKE A NIGHT OF IT</span><h3>Choose your date & venue</h3></div><span class="selection-event"><span>✦</span>${esc(event.artist)} · ${esc(event.title)}</span></div><div class="selection-controls"><label class="select-field"><span>VENUE</span><select data-change="venue"><option>${esc(event.venue)}</option></select><span>⌄</span></label><div class="date-picker">${dateChips}</div></div><div class="showtime-row"><div class="showtime-label"><span class="format-tag">LIVE</span><span><strong>${esc(event.time)} · ${esc(event.venue)}</strong><small>${esc(event.doors || "Doors open 1 hour before showtime")} · ${esc(event.city || "Kuala Lumpur")}</small></span></div><div class="time-options">${times}</div></div><div class="section-kicker tier-heading">CHOOSE YOUR TICKET TYPE</div><div class="ticket-tiers">${tierCards}</div><div class="flow-footer"><span class="footer-note"><strong>✦</strong> Secure checkout · Mobile tickets</span><button class="primary-btn" data-action="step" data-step="2">Choose seats&nbsp; →</button></div></div>` : ""}
      ${state.step === 2 ? `<div class="flow-panel seat-panel"><div class="panel-top"><div><span class="section-kicker">YOUR VIEW, YOUR MOMENT</span><h3>Choose your seats</h3></div><button class="back-button" data-action="step" data-step="1">← Back to show</button></div><div class="seat-context"><span>${esc(event.title)} · ${esc(event.venue)} · ${esc(state.time)}</span><b>${esc(tier.name)}</b></div><div class="screen-area"><div class="screen-glow"></div><div class="screen-curve">STAGE / SCREEN</div><div class="screen-caption">FRONT OF HOUSE</div></div><div class="seat-legend"><span><i class="legend-seat available"></i>Available</span><span><i class="legend-seat selected"></i>Selected</span><span><i class="legend-seat occupied"></i>Sold / held</span></div><div class="seat-map-wrap"><div class="seat-map">${ROWS.map(row => `<div class="seat-row"><span class="row-label">${row}</span>${COLS.map(col => { const id = `${row}${col}`; const status = state.selected.includes(id) ? "selected" : state.seats[id]; return `<button class="seat ${status}" data-action="seat" data-seat="${id}" ${status === "booked" ? "disabled" : ""} aria-label="Seat ${id}, ${status}">${col}</button>`; }).join("")}<span class="row-label">${row}</span></div>`).join("")}</div><div class="seat-numbers">${COLS.map(col => `<span>${col}</span>`).join("")}</div></div><div class="seat-detail"><div><span class="section-kicker">YOUR SEATS</span><strong>${sorted.length ? sorted.map(esc).join(" · ") : "Choose at least one seat"}</strong></div><div class="seat-total"><small>${state.selected.length} tickets · ${money(tier.price)} each</small><strong>${money(subtotal())}</strong></div></div>${state.loading ? '<p class="loading-note">Refreshing availability…</p>' : ""}<div class="flow-footer"><button class="back-button" data-action="step" data-step="1">← Previous</button><button class="primary-btn" data-action="checkout" ${sorted.length ? "" : "disabled"}>Continue to checkout&nbsp; →</button></div></div>` : ""}
      ${state.step === 3 ? checkoutView(event, tier, sorted) : ""}
      ${state.step === 4 ? bookingView() : ""}
    </section></main><footer class="site-footer"><a class="brand footer-brand" href="#top">${echoMark(32)}<span class="brand-name">ECHO LIVE<small>FEEL IT TOGETHER</small></span></a><span>© ${new Date().getFullYear()} ECHO LIVE · All rights reserved</span><div><a href="#booking">Help</a><a href="#booking">Terms</a><a href="#booking">Privacy</a></div></footer>${DEMO_MODE ? '<div class="demo-badge"><i></i>DEMO MODE</div>' : ""}${state.toast ? `<div class="toast" role="status"><span>✦</span>${esc(state.toast)}<button data-action="dismiss" aria-label="Dismiss">×</button></div>` : ""}</div>`;
}

function checkoutView(event, tier, sorted) {
  if (state.receipt) return `<div class="flow-panel checkout-panel"><div class="receipt-view"><div class="receipt-success"><span>✓</span><div class="section-kicker">BOOKING CONFIRMED</div><h3>You’re on the list.</h3><p>Your next live moment is waiting.</p></div><div class="receipt-ticket"><div class="receipt-ticket-head">${echoMark(28, "brand-symbol-small")}<span>E-TICKET · ${esc(String(state.receipt.status || "confirmed").toUpperCase())}</span></div><div class="receipt-ticket-body"><div><span class="section-kicker">BOOKING REFERENCE</span><strong class="booking-id">${esc(state.receipt.id || "Reference unavailable")}</strong></div><div class="receipt-grid"><div><small>SHOW</small><strong>${esc(state.receipt.eventTitle || state.receipt.event || event.title)}</strong></div><div><small>VENUE</small><strong>${esc(state.receipt.venue || state.venue)}</strong></div><div><small>DATE / TIME</small><strong>${esc(state.receipt.date || state.date)} · ${esc(state.receipt.time || state.time)}</strong></div><div><small>SEATS</small><strong>${(state.receipt.seats || state.selected).map(seatId).map(esc).join(" · ")}</strong></div></div><div class="receipt-total"><span>Total</span><strong>${money(state.receipt.total ?? subtotal())}</strong></div></div><div class="receipt-ticket-foot"><span>Show this e-ticket at the door</span><span class="barcode">▥ ▥ ▥ ▥ ▥ ▥ ▥ ▥</span></div></div><div class="receipt-actions"><button class="secondary-btn" data-action="show-booking">Manage booking</button><button class="primary-btn" data-action="new-booking">Explore more shows&nbsp; →</button></div></div></div>`;
  return `<div class="flow-panel checkout-panel"><div class="panel-top"><div><span class="section-kicker">ONE LAST THING</span><h3>Make it a night to remember</h3></div><span class="secure-pill">✦ Secure checkout</span></div><div class="checkout-layout"><div class="checkout-main"><div class="order-card"><div class="order-event"><div class="mini-event ${esc(event.accent)}"><span>${esc(event.code)}</span></div><div><span class="section-kicker">YOUR LIVE EXPERIENCE</span><h4>${esc(event.title)} · ${esc(event.artist)}</h4><p>${esc(state.venue)}</p><p>${esc(dateLong(state.date))} · ${esc(state.time)} · ${esc(tier.name)}</p></div></div><div class="order-seat-line"><span>▦ Selected seats</span><strong>${sorted.map(esc).join(" · ")}</strong></div></div><form class="customer-form" id="checkout-form"><div class="form-title"><span class="section-kicker">TICKET DELIVERY</span><h4>Where should we send your tickets?</h4></div><label>Full name<input required name="customerName" value="${esc(state.name)}" placeholder="Your name"></label><label>Email address<input required type="email" name="customerEmail" value="${esc(state.email)}" placeholder="you@example.com"></label><div class="idempotency-note">✦ <span>Secure request key <code>${esc(state.key)}</code></span><span class="key-ready">READY</span></div><button class="primary-btn pay-btn" type="submit">Confirm booking · ${money(subtotal())}</button><p class="terms-note">No payment is collected in this prototype.</p></form></div><aside class="price-card"><span class="section-kicker">ORDER SUMMARY</span><h4>Your tickets</h4><div class="price-line"><span>${esc(tier.name)} × ${state.selected.length}</span><strong>${money(subtotal())}</strong></div><div class="price-line"><span>Booking fee</span><strong>RM 0.00</strong></div><div class="price-rule"></div><div class="price-line total-line"><span>Total</span><strong>${money(subtotal())}</strong></div><div class="price-perk"><b>✦</b><span>Mobile tickets arrive by email</span></div></aside></div><div class="flow-footer"><button class="back-button" data-action="step" data-step="2">← Edit seats</button></div></div>`;
}

function bookingView() {
  const booking = state.booking;
  const cancelled = ["cancelled", "canceled"].includes(String(booking?.status || "").toLowerCase());
  return `<div class="flow-panel lookup-panel" id="booking-search"><div class="panel-top"><div><span class="section-kicker">YOUR ECHO LIVE ACCOUNT</span><h3>Find or manage a booking</h3><p class="panel-subtitle">Enter the booking reference from your confirmation to view ticket status or cancel.</p></div><span class="lookup-icon">⌕</span></div><form class="lookup-form" id="lookup-form"><label for="booking-id">Booking reference</label><div class="lookup-input-row"><div class="search-input">⌕<input id="booking-id" name="bookingId" value="${esc(state.bookingId)}" placeholder="For example, 8f42c..." autocomplete="off"></div><button class="primary-btn" type="submit" ${state.lookupBusy ? "disabled" : ""}>${state.lookupBusy ? "Searching…" : "Find booking&nbsp; →"}</button></div></form>${booking ? `<div class="lookup-result"><div class="result-heading"><div><span class="section-kicker">BOOKING DETAILS</span><h4>${esc(booking.eventTitle || booking.event || "Live event booking")}</h4></div><span class="status-pill ${cancelled ? "cancelled" : ""}">${cancelled ? "CANCELLED" : esc(String(booking.status || "CONFIRMED").toUpperCase())}</span></div><div class="result-id">Reference <strong>${esc(booking.id || booking.bookingId || state.bookingId)}</strong></div><div class="receipt-grid"><div><small>VENUE</small><strong>${esc(booking.venue || "—")}</strong></div><div><small>DATE / TIME</small><strong>${esc(booking.date || "—")} · ${esc(booking.time || "—")}</strong></div><div><small>SEATS</small><strong>${(booking.seats || []).map(seatId).map(esc).join(" · ") || "—"}</strong></div><div><small>ORDER TOTAL</small><strong>${money(booking.total)}</strong></div></div><div class="result-actions"><span>Cancelled seats are returned to availability.</span><button class="cancel-button" data-action="cancel" ${state.cancelBusy || cancelled ? "disabled" : ""}>${state.cancelBusy ? "Cancelling…" : "Cancel booking"}</button></div></div>` : '<div class="lookup-empty"><div class="ticket-outline">▦</div><strong>Your bookings will show up here</strong><span>Book a show to view, manage or cancel tickets.</span></div>'}<div class="flow-footer"><button class="back-button" data-action="step" data-step="1">← Back to shows</button></div></div>`;
}

function setStep(step) {
  if (step === 3 && !state.selected.length) return;
  if (step === 3 && state.step !== 3) { state.key = uuid(); state.receipt = null; }
  state.step = step; render();
  if (step === 2) refreshSeats();
}

root.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "step") setStep(Number(button.dataset.step));
  else if (action === "event") {
    const selected = state.events.find(item => item.id === button.dataset.id);
    if (!selected) return;
    state.eventId = selected.id; state.date = selected.date; state.venue = selected.venue; state.time = selected.time; state.times = [];
    state.selected = []; state.seats = initialSeats(); render(); loadShowtimes();
  } else if (action === "date") { state.date = button.dataset.date; state.selected = []; render(); loadShowtimes(); }
  else if (action === "time") { state.time = button.dataset.time; render(); }
  else if (action === "tier") { state.tierId = button.dataset.tier; render(); }
  else if (action === "seat") {
    const id = button.dataset.seat;
    if (state.seats[id] === "booked") return;
    if (state.selected.includes(id)) state.selected = state.selected.filter(seat => seat !== id);
    else if (state.selected.length >= 6) { announce("A maximum of 6 tickets can be booked at once."); return; }
    else state.selected.push(id);
    render();
  } else if (action === "checkout") setStep(3);
  else if (action === "manage") { event.preventDefault(); state.booking = null; setStep(4); }
  else if (action === "cycle-venue") { announce("Choose a venue from the show details below."); }
  else if (action === "scroll-booking") $("#booking")?.scrollIntoView({ behavior: "smooth" });
  else if (action === "dismiss") { state.toast = ""; render(); }
  else if (action === "show-booking") { state.bookingId = state.receipt.id || ""; state.booking = state.receipt; setStep(4); }
  else if (action === "new-booking") { state.selected = []; state.receipt = null; setStep(1); }
  else if (action === "cancel") await cancelBooking();
});

root.addEventListener("change", event => {
  if (event.target.dataset.change === "venue") { state.venue = event.target.value; loadShowtimes(); }
});
root.addEventListener("input", event => {
  if (event.target.name === "customerName") state.name = event.target.value;
  if (event.target.name === "customerEmail") state.email = event.target.value;
  if (event.target.name === "bookingId") state.bookingId = event.target.value;
});
root.addEventListener("submit", async event => {
  if (event.target.id === "checkout-form") { event.preventDefault(); await submitBooking(); }
  if (event.target.id === "lookup-form") { event.preventDefault(); await lookupBooking(); }
});

async function submitBooking() {
  if (!state.key || !state.selected.length) return;
  const event = eventNow();
  const payload = { eventId: state.eventId, eventTitle: event.title, artist: event.artist, venue: state.venue, date: state.date, time: state.time, ticketType: tierNow().name, tierId: state.tierId, seats: state.selected.slice(), customerName: state.name.trim(), email: state.email.trim(), total: subtotal() };
  try {
    let booking;
    if (DEMO_MODE) {
      booking = { id: uuid(), status: "confirmed", ...payload, createdAt: new Date().toISOString() };
      localStorage.setItem("echo-live-bookings", JSON.stringify([booking, ...demoBookings()]));
      state.seats = { ...state.seats, ...Object.fromEntries(state.selected.map(id => [id, "booked"])) };
    } else booking = await request("/bookings", { method: "POST", headers: { "Idempotency-Key": state.key }, body: JSON.stringify(payload) });
    state.receipt = { ...booking, id: booking.id || booking.bookingId || booking.booking_id, status: booking.status || "confirmed", seats: booking.seats || state.selected.slice() };
    state.bookingId = state.receipt.id || "";
    announce("You’re booked! Get ready for a night to remember.");
  } catch (error) {
    if (error.status === 409) {
      const details = error.data || {};
      const conflict = seatId(details.seatId || details.seat || details.conflict?.seat || details.conflictingSeat);
      if (conflict) { state.seats[conflict] = "booked"; state.selected = state.selected.filter(id => id !== conflict); }
      state.step = 2;
      state.toast = conflict ? `Seat ${conflict} is no longer available. Please choose another seat.` : details.message || "Those seats are no longer available. Please choose again.";
      render();
      await refreshSeats();
    } else announce(error.message || "Your booking could not be completed. Please try again.");
  }
}

async function lookupBooking() {
  const id = state.bookingId.trim();
  if (!id) return;
  state.lookupBusy = true; state.booking = null; render();
  try {
    let booking;
    if (DEMO_MODE) booking = demoBookings().find(item => String(item.id).toLowerCase() === id.toLowerCase());
    else booking = await request(`/bookings/${encodeURIComponent(id)}`);
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
      const list = demoBookings().map(item => item.id === id ? { ...item, status: "cancelled" } : item);
      localStorage.setItem("echo-live-bookings", JSON.stringify(list)); result = list.find(item => item.id === id);
      (result?.seats || []).forEach(seat => { state.seats[seatId(seat)] = "available"; });
    } else result = await request(`/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.booking = { ...state.booking, ...result, status: result?.status || "cancelled" };
    state.toast = "Your booking has been cancelled.";
  } catch (error) { state.toast = error.message || "Cancellation failed. Please try again."; }
  state.cancelBusy = false; render();
}

render();
loadEvents();
loadShowtimes();

