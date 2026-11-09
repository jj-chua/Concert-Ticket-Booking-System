/* ECHO LIVE: concert ticket marketplace prototype, built with vanilla JavaScript. */
const API_BASE = (window.EVENT_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_MODE = !API_BASE;
const EVENTS = [
  { id: "priscilla-abby-genting-2026", name: "Priscilla Abby", tour: "19+ MALAYSIA CONCERT 2026", date: "DEC 05, 2026", isoDate: "2026-12-05", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "GENTING EXCLUSIVE", accent: "priscilla", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/19-priscilla-abby-malaysia-concert-2026/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy.coreimg.jpeg/1793253873176/arena-of-stars-priscilla-abby-con-2026.jpeg", imageAlt: "Official poster for Priscilla Abby 19+ Malaysia Concert 2026", source: "https://www.rwgenting.com/zh_cn/entertainment/19-priscilla-abby-malaysia-concert-2026.html", sourceLabel: "Resorts World Genting", sections: ["VVIP", "VIP", "PS1", "PS2"], listings: [
    { id: "abby-vvip-01", section: "VVIP", row: "A", seats: "Seats 5–6", qty: 2, price: 568, badges: ["Front stage", "Instant download"], score: 9.7 },
    { id: "abby-vip-01", section: "VIP", row: "C", seats: "Seats 11–12", qty: 2, price: 448, badges: ["Premium view", "Instant download"], score: 9.5 },
    { id: "abby-ps1-01", section: "PS1", row: "F", seats: "Seats 17–18", qty: 4, price: 328, badges: ["Centre view", "Aisle seats"], score: 9.1 },
    { id: "abby-ps2-01", section: "PS2", row: "J", seats: "Seats 21–22", qty: 4, price: 218, badges: ["Best value"], score: 8.6 },
  ] },
  { id: "yy-wong-genting-2026", name: "YY Wong & Equator", tour: "LIVE CONCERT 2026", date: "DEC 08, 2026", isoDate: "2026-12-08", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "ROCK CLASSICS", accent: "yywong", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/yy-chek-dou-live-concert/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy.coreimg.jpeg/1790838743237/720x720.jpeg", imageAlt: "Official poster for YY Wong and Equator live concert", source: "https://rwgenting.com/content/rw-genting/web/zh_cn/entertainment/yy-chek-dou-live-concert.html", sourceLabel: "Resorts World Genting", sections: ["PS1"], listings: [
    { id: "yy-ps1-01", section: "PS1", row: "D", seats: "Seats 9–10", qty: 2, price: 198, badges: ["Reserved seats", "Instant download"], score: 8.9 },
    { id: "yy-ps1-02", section: "PS1", row: "H", seats: "Seats 15–16", qty: 4, price: 188, badges: ["Aisle seats"], score: 8.5 },
  ] },
  { id: "yao-xiaotang-genting-2026", name: "Yao Xiaotang", tour: "BREAKING DAWN · BANGBANGTANG TOUR", date: "DEC 12, 2026", isoDate: "2026-12-12", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "LIVE IN GENTING", accent: "yao", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/yao-xiaotang-breaking-dawn-bangbangtang-concert/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy_copy.coreimg.jpeg/1791875155071/720x720.jpeg", imageAlt: "Official poster for Yao Xiaotang Breaking Dawn Malaysia concert", source: "https://www.rwgenting.com/zh_cn/entertainment/yao-xiaotang-breaking-dawn-bangbangtang-concert.html", sourceLabel: "Resorts World Genting", sections: ["VIP", "PS1", "PS2", "PS3", "PS4"], listings: [
    { id: "yao-vip-01", section: "VIP", row: "A", seats: "Seats 7–8", qty: 2, price: 898, badges: ["Premium view", "Instant download"], score: 9.7 },
    { id: "yao-ps1-01", section: "PS1", row: "D", seats: "Seats 13–14", qty: 2, price: 718, badges: ["Centre view", "Instant download"], score: 9.4 },
    { id: "yao-ps2-01", section: "PS2", row: "H", seats: "Seats 19–20", qty: 4, price: 548, badges: ["Aisle seats"], score: 9.0 },
    { id: "yao-ps3-01", section: "PS3", row: "K", seats: "Seats 23–24", qty: 4, price: 418, badges: ["Great view"], score: 8.7 },
    { id: "yao-ps4-01", section: "PS4", row: "M", seats: "Seats 27–28", qty: 4, price: 318, badges: ["Best value"], score: 8.2 },
  ] },
  { id: "jimmy-nicky-genting-2026", name: "Jimmy Lin x Nicky Lee", tour: "CONCERT 2.0 · MALAYSIA", date: "DEC 19, 2026", isoDate: "2026-12-19", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "TWO ICONIC VOICES", accent: "jimmy-nicky", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/jimmy-x-nicky-concert-2-0-live-in-malaysia-2026/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy.coreimg.jpeg/1787733079771/720x720.jpeg", imageAlt: "Official poster for Jimmy Lin x Nicky Lee Concert 2.0 Malaysia", source: "https://rwgenting.com/zh_cn/entertainment/jimmy-x-nicky-concert-2-0-live-in-malaysia-2026.html", sourceLabel: "Resorts World Genting", sections: ["VIP", "PS1", "PS2", "PS3", "PS4"], listings: [
    { id: "jn-vip-01", section: "VIP", row: "B", seats: "Seats 5–6", qty: 2, price: 1198, badges: ["Premium view", "Instant download"], score: 9.7 },
    { id: "jn-ps1-01", section: "PS1", row: "D", seats: "Seats 11–12", qty: 2, price: 948, badges: ["Centre view", "Instant download"], score: 9.4 },
    { id: "jn-ps2-01", section: "PS2", row: "G", seats: "Seats 17–18", qty: 4, price: 738, badges: ["Aisle seats"], score: 9.1 },
    { id: "jn-ps3-01", section: "PS3", row: "K", seats: "Seats 21–22", qty: 4, price: 538, badges: ["Great view"], score: 8.7 },
    { id: "jn-ps4-01", section: "PS4", row: "N", seats: "Seats 25–26", qty: 4, price: 328, badges: ["Best value"], score: 8.3 },
  ] },
];
const TIERS = [
  { id: "all", name: "All tickets" }, { id: "premium", name: "VVIP / VIP" },
  { id: "value", name: "PS1–PS4" }, { id: "instant", name: "Instant download" },
];
const SECTIONS = ["All sections", "VVIP", "VIP", "PS1", "PS2", "PS3", "PS4"];
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const money = value => `RM ${Number(value || 0).toFixed(2)}`;
const uuid = () => window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const n = Math.random() * 16 | 0; return (c === "x" ? n : (n & 3 | 8)).toString(16); });
const state = { step: 1, events: EVENTS, eventId: "priscilla-abby-genting-2026", section: "All sections", classFilter: "all", quantity: 2, sort: "recommended", minPrice: 0, maxPrice: 2000, listing: null, key: "", name: "", email: "", receipt: null, bookingId: "", booking: null, lookupBusy: false, cancelBusy: false, refreshing: false, toast: "", searchTerm: "", searchOpen: false, mapExpanded: false };
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
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 44 44" role="img" aria-label="ECHO LIVE logo"><defs><linearGradient id="echo-disc" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#8150bd"/><stop offset="1" stop-color="#21132f"/></linearGradient></defs><circle cx="22" cy="22" r="21" fill="url(#echo-disc)"/><circle cx="22" cy="22" r="15.2" fill="none" stroke="#cfb3f6" stroke-width="1.6" stroke-dasharray="61 13" transform="rotate(-38 22 22)"/><path d="M10 22c2.8 0 2.8-4.2 5.6-4.2s2.8 8.4 5.6 8.4 2.8-8.4 5.6-8.4 2.8 4.2 5.6 4.2" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="22" cy="22" r="2" fill="#fff"/></svg>`;
}
function toast(message) {
  state.toast = message; render(); clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { state.toast = ""; render(); }, 4800);
}

function posterImage(event, className = "") {
  return `<div class="poster-frame ${esc(event.accent)} ${className}"><img src="${esc(event.image)}" alt="${esc(event.imageAlt)}" loading="lazy" decoding="async" fetchpriority="low" referrerpolicy="no-referrer" onerror="this.hidden=true;this.parentElement.classList.add('poster-fallback')"><div class="poster-fallback-copy"><span>${esc(event.tour)}</span><strong>${esc(event.name)}</strong></div></div>`;
}

function getListings() {
  const event = currentEvent();
  let list = (event.listings || []).filter(item => item.qty >= selectedCount() && item.price >= Number(state.minPrice) && item.price <= Number(state.maxPrice));
  if (state.section !== "All sections") list = list.filter(item => item.section === state.section);
  if (state.classFilter === "premium") list = list.filter(item => ["VVIP", "VIP"].includes(item.section));
  if (state.classFilter === "value") list = list.filter(item => item.section.startsWith("PS"));
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

function updateEventSearch() {
  const strip = $(".event-strip");
  if (!strip) return;
  const query = state.searchTerm.trim().toLowerCase();
  let visibleCount = 0;
  strip.querySelectorAll(".event-card").forEach(card => {
    const item = state.events.find(event => event.id === card.dataset.id);
    const text = item ? `${item.name} ${item.tour} ${item.venue} ${item.city}`.toLowerCase() : "";
    const visible = !query || text.includes(query);
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  let empty = strip.querySelector(".no-events");
  if (!empty) { empty = document.createElement("div"); empty.className = "no-events"; empty.textContent = "No shows found. Try another artist or venue."; strip.append(empty); }
  empty.hidden = visibleCount > 0;
}
const ARENA_ZONES = {
  VVIP: { label: [260, 112], paths: ["M211 88 Q260 77 309 88 L302 128 Q260 119 218 128 Z"] },
  VIP: { label: [175, 120], paths: ["M145 96 Q174 83 203 89 L213 130 Q180 138 153 156 Z", "M375 96 Q346 83 317 89 L307 130 Q340 138 367 156 Z"] },
  PS1: { label: [194, 166], paths: ["M161 148 Q187 132 218 132 L230 178 Q198 183 174 199 Z", "M359 148 Q333 132 302 132 L290 178 Q322 183 346 199 Z"] },
  PS2: { label: [260, 205], paths: ["M185 190 Q260 174 335 190 L350 229 Q260 216 170 229 Z"] },
  PS3: { label: [126, 219], paths: ["M105 183 Q132 164 158 158 L173 207 Q145 220 122 240 Z", "M415 183 Q388 164 362 158 L347 207 Q375 220 398 240 Z"] },
  PS4: { label: [260, 260], paths: ["M75 233 Q101 213 119 208 L136 256 Q116 275 95 286 Z", "M445 233 Q419 213 401 208 L384 256 Q404 275 425 286 Z", "M145 244 Q260 223 375 244 L389 281 Q260 263 131 281 Z"] },
};

function sectionMap() {
  const event = currentEvent();
  return `<div class="venue-map arena-map"><svg class="arena-map-svg" viewBox="0 0 520 330" role="group" aria-label="Interactive Arena of Stars venue map"><defs><linearGradient id="arena-stage" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#312039"/><stop offset=".5" stop-color="#8055aa"/><stop offset="1" stop-color="#312039"/></linearGradient></defs><path class="arena-bowl" d="M59 100 Q260 12 461 100 L490 288 Q260 344 30 288 Z"/><path class="arena-row" d="M90 126 Q260 45 430 126M73 167 Q260 92 447 167M56 211 Q260 143 464 211M43 255 Q260 196 477 255"/><g class="stage-block"><path d="M168 26 Q260 16 352 26 L342 67 Q260 60 178 67 Z"/><text x="260" y="50" text-anchor="middle">STAGE</text></g>${Object.entries(ARENA_ZONES).map(([name]) => mapSection(name)).join("")}<g class="arena-gates"><text x="92" y="311">GATE A</text><text x="260" y="311">GATE B</text><text x="428" y="311">GATE C</text></g></svg><div class="map-footnote">Arena of Stars · seating zones are illustrative and not to scale</div></div>`;
}

function mapSection(name) {
  const zone = ARENA_ZONES[name];
  const active = state.section === name;
  const available = currentEvent().listings?.some(item => item.section === name);
  const status = available ? "Sample tickets listed" : "No sample listings";
  return `<g class="seat-zone ${active ? "zone-active" : ""} ${available ? "zone-available" : "zone-empty"}" data-action="section" data-section="${name}" role="button" tabindex="0" aria-pressed="${active}" aria-label="${name}, ${status}"><title>${name} · ${status}</title>${zone.paths.map(path => `<path d="${path}"/>`).join("")}<text x="${zone.label[0]}" y="${zone.label[1]}" text-anchor="middle">${name}</text></g>`;
}
function listingCard(item, index) {
  const estimated = item.price * selectedCount();
  return `<article class="ticket-listing"><div class="deal-stamp ${index === 0 ? "best-deal" : ""}">${index === 0 ? "GREAT VALUE" : esc(item.badges[0] || "AVAILABLE")}</div><div class="ticket-main"><div class="ticket-section-line"><h3>${esc(item.section)}</h3><span class="ticket-type-pill">${item.badges.some(b => b.includes("Standing")) ? "Standing" : "Seated"}</span></div><p class="ticket-row">${item.row === "GA" ? "General admission" : `Row ${esc(item.row)} · ${esc(item.seats)}`}</p><div class="ticket-perks">${item.badges.map(badge => `<span>✓ ${esc(badge)}</span>`).join("")}</div></div><div class="ticket-stock"><strong>${item.qty} tickets</strong><span>together</span></div><div class="ticket-price"><strong>${money(item.price)}</strong><span>per ticket</span><small>${money(estimated)} total</small></div><button class="primary-btn ticket-cta" data-action="choose-listing" data-id="${esc(item.id)}">See tickets <span>→</span></button></article>`;
}

function listingPanel(event) {
  const listings = getListings();
  const sectionOptions = SECTIONS.map(section => `<option value="${esc(section)}" ${state.section === section ? "selected" : ""}>${esc(section)}</option>`).join("");
  const filters = TIERS.map(item => `<button class="filter-chip ${state.classFilter === item.id ? "filter-active" : ""}" data-action="class-filter" data-filter="${item.id}">${item.name}</button>`).join("");
  return `<div class="market-grid"><section class="map-card ${state.mapExpanded ? "map-card-expanded" : ""}" role="${state.mapExpanded ? "dialog" : "region"}" aria-modal="${state.mapExpanded}" aria-label="Arena of Stars ticket zones"><div class="card-heading"><div><span class="section-kicker">ARENA OF STARS</span><h2>Choose your zone</h2></div><button class="map-help" data-action="${state.mapExpanded ? "close-map" : "map-help"}" aria-label="${state.mapExpanded ? "Close map" : "Map information"}">${state.mapExpanded ? "×" : "?"}</button></div>${sectionMap()}<div class="map-legend"><span><i class="legend-dot dot-available"></i>Demo marketplace listings shown</span><span><i class="legend-dot dot-selected"></i>Selected zone</span><span><i class="legend-dot dot-none"></i>No sample listings</span></div><button class="clear-section map-expand-button" data-action="${state.mapExpanded ? "close-map" : "expand-map"}">${state.mapExpanded ? "Close map" : "Show all zones ↗"}</button></section><button class="map-backdrop" data-action="close-map" aria-label="Close expanded venue map" ${state.mapExpanded ? "" : "hidden"}></button><section class="listings-column"><div class="listings-toolbar"><div><span class="section-kicker">${esc(event.name.toUpperCase())} · ${esc(event.venue.toUpperCase())}</span><h2>Tickets for this show</h2><p>${listings.length} demo listings · Prices shown per ticket</p></div><a class="official-link" href="${esc(event.source)}" target="_blank" rel="noopener">Official event info ↗</a></div><div class="filter-panel"><div class="filter-row"><label class="quantity-filter"><span>Tickets</span><select data-change="quantity">${[1,2,3,4,5,6].map(n => `<option ${n === selectedCount() ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="section-filter"><span>Section</span><select data-change="section">${sectionOptions}</select></label><label class="sort-filter"><span>Sort by</span><select data-change="sort"><option value="recommended" ${state.sort === "recommended" ? "selected" : ""}>Recommended</option><option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option><option value="best" ${state.sort === "best" ? "selected" : ""}>Best view</option></select></label></div><div class="filter-chips">${filters}</div><div class="price-filter"><label>Price per ticket <strong>${money(state.minPrice)} – ${money(state.maxPrice)}</strong></label><div><input aria-label="Minimum price" type="range" min="0" max="2000" step="25" value="${state.minPrice}" data-change="min-price"><input aria-label="Maximum price" type="range" min="100" max="2000" step="25" value="${state.maxPrice}" data-change="max-price"></div></div></div><div class="demo-notice"><span>i</span><p><strong>Sample marketplace listings</strong> — prices and availability here are demo data. Connect your ticket inventory API to show live offers.</p></div><div class="listing-header"><strong>${listings.length} listings</strong><span>Price includes estimated fees</span></div><div class="listing-results">${listings.length ? listings.map(listingCard).join("") : `<div class="empty-listings"><strong>No tickets match these filters.</strong><span>Try another section or ticket type.</span><button data-action="clear-filters">Clear filters</button></div>`}</div></section></div>`;
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
  return `<section class="checkout-card"><div class="checkout-heading"><div><span class="section-kicker">FINAL STEP</span><h2>Checkout</h2><p>You're one step away from a live night out.</p></div><span class="secure-pill">✓ Secure checkout</span></div><div class="checkout-layout"><form class="checkout-form" id="checkout-form"><h3>Ticket delivery</h3><label>Full name<input required name="customerName" value="${esc(state.name)}" placeholder="Name on the booking"></label><label>Email address<input required name="customerEmail" type="email" value="${esc(state.email)}" placeholder="you@example.com"></label><div class="idempotency-note"><span>Request protection</span><code>${esc(state.key)}</code><b>READY</b></div><button class="primary-btn checkout-submit" type="submit">Confirm booking · ${money(item.price * selectedCount())}</button><p class="demo-terms">Prototype checkout only — no payment is collected.</p></form><aside class="checkout-summary"><span class="section-kicker">ORDER SUMMARY</span><h3>${esc(event.name)}</h3><p>${esc(event.date)} · ${esc(event.venue)}</p><div class="summary-line"><span>${esc(item.section)} · Row ${esc(item.row)} × ${selectedCount()}</span><strong>${money(item.price * selectedCount())}</strong></div><div class="summary-line"><span>Estimated fees</span><strong>Included</strong></div><div class="summary-total"><span>Total</span><strong>${money(item.price * selectedCount())}</strong></div><div class="summary-note">Demo ticket details stay in this browser.</div></aside></div><button class="secondary-btn checkout-back" data-action="step" data-step="2">← Back to review</button></section>`;
}

function bookingView() {
  const booking = state.booking;
  const cancelled = ["cancelled", "canceled"].includes(String(booking?.status || "").toLowerCase());
  return `<section class="manage-card" id="booking-search"><div class="manage-heading"><span class="section-kicker">YOUR ECHO LIVE ORDERS</span><h2>Manage a booking</h2><p>Enter the booking reference from your confirmation email.</p></div><form id="lookup-form"><label for="booking-reference">Booking reference</label><div class="lookup-row"><input id="booking-reference" name="bookingId" value="${esc(state.bookingId)}" placeholder="e.g. 3c2b1a…" autocomplete="off"><button class="primary-btn" type="submit" ${state.lookupBusy ? "disabled" : ""}>${state.lookupBusy ? "Searching…" : "Find booking →"}</button></div></form>${booking ? `<article class="booking-result"><div class="booking-result-head"><div><span class="section-kicker">BOOKING DETAILS</span><h3>${esc(booking.eventName || booking.event || "Live event")}</h3></div><span class="booking-status ${cancelled ? "cancelled" : ""}">${cancelled ? "CANCELLED" : esc(String(booking.status || "CONFIRMED").toUpperCase())}</span></div><div class="result-ref">Reference <strong>${esc(booking.id || booking.bookingId || state.bookingId)}</strong></div><div class="receipt-grid"><div><small>VENUE</small><strong>${esc(booking.venue || "—")}</strong></div><div><small>DATE / TIME</small><strong>${esc(booking.date || "—")} · ${esc(booking.time || "—")}</strong></div><div><small>SECTION / ROW</small><strong>${esc(booking.section || "—")} · ${esc(booking.row || "—")}</strong></div><div><small>QUANTITY / TOTAL</small><strong>${Number(booking.quantity || 0)} · ${money(booking.total)}</strong></div></div><div class="result-actions"><span>Cancelled tickets return to availability.</span><button class="cancel-button" data-action="cancel-booking" ${state.cancelBusy || cancelled ? "disabled" : ""}>${state.cancelBusy ? "Cancelling…" : "Cancel booking"}</button></div></article>` : `<div class="empty-bookings"><span>▤</span><strong>No booking selected</strong><small>Your ticket details will appear here.</small></div>`}<button class="secondary-btn" data-action="step" data-step="1">← Browse shows</button></section>`;
}

function render() {
  const event = currentEvent();
  document.body.classList.toggle("map-open", state.mapExpanded);
  root.innerHTML = `<div class="app-shell"><header class="topbar ${state.searchOpen ? "search-open" : ""}"><a class="brand" href="#top">${logo()}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><nav class="main-nav"><a href="#shows">Concerts</a><a class="active" href="#market">Tickets</a><a href="#footer">Help</a></nav><div class="top-actions"><label class="search-box"><span>⌕</span><input name="eventSearch" value="${esc(state.searchTerm)}" placeholder="Artist, event or venue" aria-label="Search shows"></label><button class="location-button" data-action="scroll-market">⌖ <span>Genting Highlands</span>⌄</button><button class="account-button" data-action="manage">My tickets</button></div><button class="mobile-search" data-action="toggle-search" aria-label="Search">⌕</button></header><main id="top"><section class="event-hero"><img class="hero-photo" src="${esc(event.image)}" alt="${esc(event.imageAlt)}" decoding="async" fetchpriority="high" onerror="this.hidden=true"><div class="hero-shade"></div><div class="hero-inner"><div class="hero-event-copy"><div class="hero-tags"><span>${esc(event.tag)}</span><span class="live-tag">LIVE MUSIC</span></div><p class="hero-kicker">${esc(event.tour)}</p><h1>${esc(event.name)}</h1><p class="hero-meta">${esc(event.date)} <i></i> ${esc(event.venue)} <i></i> ${esc(event.area)}</p><p class="hero-time">${esc(event.time)} · ${esc(event.state === "SOLD OUT" ? "Official tickets sold out" : "Demo marketplace listings shown")}</p><a class="primary-btn hero-button" href="#market">Find tickets&nbsp; ↓</a></div><div class="hero-poster-wrap">${posterImage(event, "hero-poster")}<span>OFFICIAL EVENT ARTWORK</span></div></div><div class="hero-bottom"><span><i class="live-dot"></i> ECHO LIVE PICKS</span><a href="${esc(event.source)}" target="_blank" rel="noopener">Official event details ↗</a></div></section>
      <section class="discovery" id="shows"><div class="discovery-head"><div><span class="section-kicker">UP NEXT AT ARENA OF STARS</span><h2>Find your next live moment</h2><p>Four nights of live music at Resorts World Genting.</p></div><button class="all-shows" data-action="scroll-market">View all shows&nbsp; →</button></div><div class="event-strip">${eventCards()}</div></section>
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
  } else if (action === "section") { state.section = button.dataset.section; state.mapExpanded = false; document.body.classList.remove("map-open"); render(); }
  else if (action === "expand-map") { state.section = "All sections"; state.mapExpanded = true; render(); $("[data-action=close-map]")?.focus(); }
  else if (action === "close-map") { state.mapExpanded = false; document.body.classList.remove("map-open"); render(); $("[data-action=expand-map]")?.focus(); }
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
  else if (action === "map-help") toast("Select a ticket zone to filter this show’s sample listings. Section positions are illustrative, not to scale.");
  else if (action === "toggle-search") { state.searchOpen = !state.searchOpen; render(); if (state.searchOpen) $('[name="eventSearch"]')?.focus(); }
  else if (action === "scroll-market") { event.preventDefault(); $("#market")?.scrollIntoView({ behavior: "smooth" }); }
});

root.addEventListener("keydown", event => {
  if (state.mapExpanded && event.key === "Escape") { state.mapExpanded = false; document.body.classList.remove("map-open"); render(); $("[data-action=expand-map]")?.focus(); return; }
  const zone = event.target.closest(".seat-zone");
  if (zone && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); zone.click(); }
});root.addEventListener("change", event => {
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
  if (target.name === "eventSearch") { state.searchTerm = target.value; updateEventSearch(); }
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
