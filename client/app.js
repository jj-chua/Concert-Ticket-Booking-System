/* ECHO LIVE: concert ticket marketplace prototype, built with vanilla JavaScript. */
const API_BASE = (window.EVENT_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_MODE = !API_BASE;
const VENUE_SECTIONS = {
  "arena-stars": ["VVIP", "VIP", "PS1", "PS2", "PS3", "PS4"],
  "unifi-arena": ["VIP", "CAT 1", "CAT 2", "CAT 3"],
  "tm-stadium-nasional": ["FLOOR A", "FLOOR B", "FLOOR C", "CAT 1", "CAT 2", "CAT 3", "CAT 4", "CAT 5", "CAT 6", "CAT 7", "CAT 8", "CAT 9"],
};
const AXIATA_PRICES = [798, 598, 398, 298];
const TM_PRICES = [1288, 1088, 888, 788, 688, 588, 558, 488, 458, 428, 388, 388];
const EVENTS = [
  { id: "priscilla-abby-genting-2026", venueKey: "arena-stars", name: "Priscilla Abby", tour: "19+ MALAYSIA CONCERT 2026", date: "DEC 05, 2026", isoDate: "2026-12-05", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "GENTING EXCLUSIVE", accent: "priscilla", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/19-priscilla-abby-malaysia-concert-2026/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy.coreimg.jpeg/1793253873176/arena-of-stars-priscilla-abby-con-2026.jpeg", imageAlt: "Official poster for Priscilla Abby 19+ Malaysia Concert 2026", source: "https://www.rwgenting.com/zh_cn/entertainment/19-priscilla-abby-malaysia-concert-2026.html", sourceLabel: "Resorts World Genting", sections: ["VVIP", "VIP", "PS1", "PS2"], listings: [
    { id: "abby-vvip-01", section: "VVIP", row: "A", seats: "Seats 5–6", qty: 2, price: 568, badges: ["Front stage", "Instant download"], score: 9.7 },
    { id: "abby-vip-01", section: "VIP", row: "C", seats: "Seats 11–12", qty: 2, price: 448, badges: ["Premium view", "Instant download"], score: 9.5 },
    { id: "abby-ps1-01", section: "PS1", row: "F", seats: "Seats 17–18", qty: 4, price: 328, badges: ["Centre view", "Aisle seats"], score: 9.1 },
    { id: "abby-ps2-01", section: "PS2", row: "J", seats: "Seats 21–22", qty: 4, price: 218, badges: ["Best value"], score: 8.6 },
  ] },
  { id: "yy-wong-genting-2026", venueKey: "arena-stars", name: "YY Wong & Equator", tour: "LIVE CONCERT 2026", date: "DEC 08, 2026", isoDate: "2026-12-08", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "ROCK CLASSICS", accent: "yywong", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/yy-chek-dou-live-concert/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy.coreimg.jpeg/1790838743237/720x720.jpeg", imageAlt: "Official poster for YY Wong and Equator live concert", source: "https://rwgenting.com/content/rw-genting/web/zh_cn/entertainment/yy-chek-dou-live-concert.html", sourceLabel: "Resorts World Genting", sections: ["PS1"], listings: [
    { id: "yy-ps1-01", section: "PS1", row: "D", seats: "Seats 9–10", qty: 2, price: 198, badges: ["Reserved seats", "Instant download"], score: 8.9 },
    { id: "yy-ps1-02", section: "PS1", row: "H", seats: "Seats 15–16", qty: 4, price: 188, badges: ["Aisle seats"], score: 8.5 },
  ] },
  { id: "yao-xiaotang-genting-2026", venueKey: "arena-stars", name: "Yao Xiaotang", tour: "BREAKING DAWN · BANGBANGTANG TOUR", date: "DEC 12, 2026", isoDate: "2026-12-12", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "LIVE IN GENTING", accent: "yao", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/yao-xiaotang-breaking-dawn-bangbangtang-concert/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy_copy.coreimg.jpeg/1791875155071/720x720.jpeg", imageAlt: "Official poster for Yao Xiaotang Breaking Dawn Malaysia concert", source: "https://www.rwgenting.com/zh_cn/entertainment/yao-xiaotang-breaking-dawn-bangbangtang-concert.html", sourceLabel: "Resorts World Genting", sections: ["VIP", "PS1", "PS2", "PS3", "PS4"], listings: [
    { id: "yao-vip-01", section: "VIP", row: "A", seats: "Seats 7–8", qty: 2, price: 898, badges: ["Premium view", "Instant download"], score: 9.7 },
    { id: "yao-ps1-01", section: "PS1", row: "D", seats: "Seats 13–14", qty: 2, price: 718, badges: ["Centre view", "Instant download"], score: 9.4 },
    { id: "yao-ps2-01", section: "PS2", row: "H", seats: "Seats 19–20", qty: 4, price: 548, badges: ["Aisle seats"], score: 9.0 },
    { id: "yao-ps3-01", section: "PS3", row: "K", seats: "Seats 23–24", qty: 4, price: 418, badges: ["Great view"], score: 8.7 },
    { id: "yao-ps4-01", section: "PS4", row: "M", seats: "Seats 27–28", qty: 4, price: 318, badges: ["Best value"], score: 8.2 },
  ] },
  { id: "jimmy-nicky-genting-2026", venueKey: "arena-stars", name: "Jimmy Lin x Nicky Lee", tour: "CONCERT 2.0 · MALAYSIA", date: "DEC 19, 2026", isoDate: "2026-12-19", venue: "Arena of Stars", area: "Resorts World Genting · Genting Highlands", city: "Genting Highlands", time: "6:00 PM", state: "DEMO LISTINGS", tag: "TWO ICONIC VOICES", accent: "jimmy-nicky", image: "https://www.rwgenting.com/content/rw-genting/web/zh_cn/entertainment/jimmy-x-nicky-concert-2-0-live-in-malaysia-2026/_jcr_content/root/container/column_container_cop/column-1-wrapper/column_container_172/column-1-wrapper/image_copy.coreimg.jpeg/1787733079771/720x720.jpeg", imageAlt: "Official poster for Jimmy Lin x Nicky Lee Concert 2.0 Malaysia", source: "https://rwgenting.com/zh_cn/entertainment/jimmy-x-nicky-concert-2-0-live-in-malaysia-2026.html", sourceLabel: "Resorts World Genting", sections: ["VIP", "PS1", "PS2", "PS3", "PS4"], listings: [
    { id: "jn-vip-01", section: "VIP", row: "B", seats: "Seats 5–6", qty: 2, price: 1198, badges: ["Premium view", "Instant download"], score: 9.7 },
    { id: "jn-ps1-01", section: "PS1", row: "D", seats: "Seats 11–12", qty: 2, price: 948, badges: ["Centre view", "Instant download"], score: 9.4 },
    { id: "jn-ps2-01", section: "PS2", row: "G", seats: "Seats 17–18", qty: 4, price: 738, badges: ["Aisle seats"], score: 9.1 },
    { id: "jn-ps3-01", section: "PS3", row: "K", seats: "Seats 21–22", qty: 4, price: 538, badges: ["Great view"], score: 8.7 },
    { id: "jn-ps4-01", section: "PS4", row: "N", seats: "Seats 25–26", qty: 4, price: 328, badges: ["Best value"], score: 8.3 },
  ] },
];
const LOCATION_OPTIONS = [
  { id: "all", label: "All locations", shortLabel: "All locations" },
  { id: "arena-stars", label: "Genting Highlands · Arena of Stars", shortLabel: "Genting Highlands" },
  { id: "unifi-arena", label: "Bukit Jalil · Axiata Arena", shortLabel: "Axiata Arena" },
  { id: "tm-stadium-nasional", label: "Bukit Jalil · TM Stadium Nasional", shortLabel: "TM Stadium" },
];
function sampleTicketListings(showId, venueKey, priceTop, sections = VENUE_SECTIONS[venueKey]) {
  return sections.map((section, index) => {
    const price = venueKey === "unifi-arena" ? AXIATA_PRICES[VENUE_SECTIONS[venueKey].indexOf(section)] : venueKey === "tm-stadium-nasional" ? TM_PRICES[VENUE_SECTIONS[venueKey].indexOf(section)] : Math.max(168, priceTop - index * 95);
    const standing = section.includes("STANDING") || section === "GA" || section.startsWith("FLOOR");
    return { id: `${showId}-${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, section, row: standing ? "GA" : String.fromCharCode(65 + (index % 12)), seats: standing ? "General admission" : `Seats ${5 + index * 2}–${6 + index * 2}`, qty: index % 2 ? 4 : 2, price, badges: [standing ? "Standing admission" : "Reserved seats", "Sample resale", "Instant download"], score: Math.max(7.4, 9.8 - index * 0.16) };
  });
}
function makeUpcomingShow(show) {
  const sections = show.sections || VENUE_SECTIONS[show.venueKey];
  return { ...show, area: show.venueKey === "tm-stadium-nasional" ? "National Stadium Bukit Jalil · Kuala Lumpur" : "Bukit Jalil · Kuala Lumpur Sports City", city: "Bukit Jalil", sections, listings: show.allowSampleListings === false ? [] : sampleTicketListings(show.id, show.venueKey, show.priceTop, sections), sourceLabel: "Live Nation Malaysia" };
}
EVENTS.push(
  makeUpcomingShow({ id: "babymonster-unifi-2026-11-14", name: "BABYMONSTER", tour: "2026–27 WORLD TOUR · [춤 (CHOOM)]", date: "NOV 14, 2026", isoDate: "2026-11-14", venueKey: "unifi-arena", venue: "Axiata Arena", time: "5:00 PM", state: "SOLD OUT", tag: "OFFICIAL SHOW · DEMO LISTINGS", accent: "unifi", image: "https://networksites.livenationinternational.com/networksites/5cabpce0/babymonster-group_press.jpg?format=webp&quality=75&width=1920", imageAlt: "BABYMONSTER group photo", source: "https://www.livenation.my/event/2026-27-babymonster-world-tour-%EC%B6%A4-choom-in-kuala-lumpur-kuala-lumpur-tickets-edp1682916", priceTop: 888 }),
  makeUpcomingShow({ id: "mcr-tm-stadium-2026-11-19", name: "My Chemical Romance", tour: "SOUTHEAST ASIA TOUR 2026", date: "NOV 19, 2026", isoDate: "2026-11-19", venueKey: "tm-stadium-nasional", venue: "TM Stadium Nasional", time: "Time TBC", state: "ON SALE", tag: "STADIUM SHOW", accent: "tm-stadium", image: "https://dynamicmedia.livenationinternational.com/q/e/s/7e601e78-8c12-4424-9584-ab219054ea65.png?format=webp&quality=75&width=1920", imageAlt: "My Chemical Romance performing live", source: "https://www.livenation.my/event/my-chemical-romance-southeast-asia-2026-kuala-lumpur-tickets-edp1711397", priceTop: 1288 }),
  makeUpcomingShow({ id: "mcr-tm-stadium-2026-11-20", name: "My Chemical Romance", tour: "SOUTHEAST ASIA TOUR 2026", date: "NOV 20, 2026", isoDate: "2026-11-20", venueKey: "tm-stadium-nasional", venue: "TM Stadium Nasional", time: "Time TBC", state: "ON SALE", tag: "SECOND NIGHT", accent: "tm-stadium", image: "https://dynamicmedia.livenationinternational.com/q/e/s/7e601e78-8c12-4424-9584-ab219054ea65.png?format=webp&quality=75&width=1920", imageAlt: "My Chemical Romance performing live", source: "https://www.livenation.my/event/my-chemical-romance-southeast-asia-2026-kuala-lumpur-tickets-edp1711397", priceTop: 1288 }),
  makeUpcomingShow({ id: "bts-tm-stadium-2026-12-12", name: "BTS", tour: "WORLD TOUR · ARIRANG", date: "DEC 12, 2026", isoDate: "2026-12-12", venueKey: "tm-stadium-nasional", venue: "TM Stadium Nasional", time: "7:30 PM", state: "SOLD OUT", tag: "OFFICIAL TICKETS SOLD OUT", accent: "tm-stadium", image: "https://dynamicmedia.livenationinternational.com/p/i/r/0545f243-606d-4d8a-acb7-bb7210f21353.jpg?format=webp&quality=75&width=1920", imageAlt: "BTS group photo", source: "https://www.livenation.my/event/bts-world-tour-arirang-in-kuala-lumpur-kuala-lumpur-tickets-edp1675786", priceTop: 1588, allowSampleListings: false, resaleAllowed: false, stageLayout: "360" }),
  makeUpcomingShow({ id: "bts-tm-stadium-2026-12-13", name: "BTS", tour: "WORLD TOUR · ARIRANG", date: "DEC 13, 2026", isoDate: "2026-12-13", venueKey: "tm-stadium-nasional", venue: "TM Stadium Nasional", time: "7:30 PM", state: "SOLD OUT", tag: "SECOND NIGHT · SOLD OUT", accent: "tm-stadium", image: "https://dynamicmedia.livenationinternational.com/p/i/r/0545f243-606d-4d8a-acb7-bb7210f21353.jpg?format=webp&quality=75&width=1920", imageAlt: "BTS group photo", source: "https://www.livenation.my/event/bts-world-tour-arirang-in-kuala-lumpur-kuala-lumpur-tickets-edp1675786", priceTop: 1588, allowSampleListings: false, resaleAllowed: false, stageLayout: "360" }),
  makeUpcomingShow({ id: "westlife-unifi-2027-01-13", name: "Westlife", tour: "25 · THE ANNIVERSARY WORLD TOUR", date: "JAN 13, 2027", isoDate: "2027-01-13", venueKey: "unifi-arena", venue: "Axiata Arena", time: "Time TBC", state: "ON SALE", tag: "NEW SHOW ADDED", accent: "unifi", image: "https://networksites.livenationinternational.com/networksites/kmdmeh2j/westlife-kl-2027_1080x1350_vip_added-show.png?format=webp&quality=75&width=1920", imageAlt: "Westlife 25 anniversary tour Kuala Lumpur poster", source: "https://www.livenation.my/event/westlife-25-the-anniversary-world-tour-kuala-lumpur-tickets-edp1686551", priceTop: 798 }),
  makeUpcomingShow({ id: "westlife-unifi-2027-01-14", name: "Westlife", tour: "25 · THE ANNIVERSARY WORLD TOUR", date: "JAN 14, 2027", isoDate: "2027-01-14", venueKey: "unifi-arena", venue: "Axiata Arena", time: "Time TBC", state: "ON SALE", tag: "AXIATA ARENA", accent: "unifi", image: "https://networksites.livenationinternational.com/networksites/kmdmeh2j/westlife-kl-2027_1080x1350_vip_added-show.png?format=webp&quality=75&width=1920", imageAlt: "Westlife 25 anniversary tour Kuala Lumpur poster", source: "https://www.livenation.my/event/westlife-25-the-anniversary-world-tour-kuala-lumpur-tickets-edp1686551", priceTop: 798 })
);

const TIERS = [
  { id: "all", name: "All tickets" }, { id: "premium", name: "VVIP / VIP" },
  { id: "value", name: "Standard sections" }, { id: "instant", name: "Instant download" },
];
const SECTIONS = ["All sections", ...new Set(Object.values(VENUE_SECTIONS).flat())];
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const money = value => `RM ${Number(value || 0).toFixed(2)}`;
const uuid = () => window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const n = Math.random() * 16 | 0; return (c === "x" ? n : (n & 3 | 8)).toString(16); });
const state = { page: "home", pageHistory: ["home"], sellDraft: null, step: 1, events: EVENTS, eventId: "priscilla-abby-genting-2026", section: "All sections", block: "All blocks", classFilter: "all", quantity: 2, sort: "recommended", minPrice: 0, maxPrice: 2000, listing: null, key: "", name: "", email: "", receipt: null, bookingId: "", booking: null, lookupBusy: false, cancelBusy: false, adminQuery: "", adminOrder: null, adminBusy: false, adminError: "", refreshing: false, toast: "", searchTerm: "", showAllEvents: false, searchOpen: false, locationFilter: "all", locationOpen: false, mapExpanded: false, checkoutModalOpen: false, checkoutLocking: false, checkoutDeadline: 0, checkoutTimer: null, paymentMethod: "" };
const root = $("#root");
const currentEvent = () => state.events.find(item => item.id === state.eventId) || EVENTS[0];
const selectedCount = () => Number(state.quantity || 2);
function captureSellDraft() {
  const form = $("#sell-form", root);
  if (form) state.sellDraft = { ...(state.sellDraft || {}), ...Object.fromEntries(new FormData(form).entries()) };
}
function navigateToPage(page) {
  if (state.page === "sell") captureSellDraft();
  if (state.page !== page) state.pageHistory.push(page);
  state.page = page;
  render();
}
function returnToPreviousPage() {
  if (state.page === "sell") captureSellDraft();
  if (state.pageHistory.length > 1) state.pageHistory.pop();
  state.page = state.pageHistory.at(-1) || "home";
  if (state.page === "home") state.sellDraft = null;
  state.mapExpanded = false;
  render();
}
function resetPageHistory(page = "home") {
  state.page = page;
  state.pageHistory = [page];
}
function backPageLabel() {
  const previousPage = state.pageHistory.at(-2);
  if (previousPage === "account") return "Back to profile";
  if (previousPage === "sell") return "Back to sell tickets";
  return "Back to concerts";
}
function backButton(action = "go-back") {
  const label = esc(action === "go-home" ? "Back to home" : backPageLabel());
  return `<button class="text-back back-icon-button" data-action="${action}" aria-label="${label}" title="${label}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5m7 7-7-7 7-7"/></svg></button>`;
}
const getBookings = () => { try { return JSON.parse(localStorage.getItem("echo-ticket-orders") || "[]"); } catch { return []; } };
const getSellerListings = () => { try { return JSON.parse(localStorage.getItem("echo-seller-listings") || "[]"); } catch { return []; } };
const saveSellerListings = listings => { try { localStorage.setItem("echo-seller-listings", JSON.stringify(listings)); return true; } catch { state.toast = "Could not save this listing on this device."; return false; } };
function restoreSellerListings() {
  const owned = getSellerListings();
  state.events.forEach(event => {
    event.listings = (event.listings || []).filter(item => !item.sellerListing).concat(owned.filter(item => item.eventId === event.id));
  });
}
function getMemberProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("echo-member-profile") || "null");
    if (saved) return saved;
    const profile = { id: uuid(), name: "Echo Live Member", email: "", phone: "", region: "Malaysia", joinedAt: new Date().toISOString() };
    localStorage.setItem("echo-member-profile", JSON.stringify(profile));
    return profile;
  } catch { return { id: "local-member", name: "Echo Live Member", email: "", phone: "", region: "Malaysia", joinedAt: new Date().toISOString() }; }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { message: raw }; }
  if (!response.ok) { const error = new Error(data.message || data.error || `Request failed (${response.status})`); error.status = response.status; error.data = data; throw error; }
  return data;
}

function locationPicker() {
  const selected = LOCATION_OPTIONS.find(item => item.id === state.locationFilter) || LOCATION_OPTIONS[0];
  const options = LOCATION_OPTIONS.map(item => `<button class="location-option ${item.id === state.locationFilter ? "selected" : ""}" data-action="location-choice" data-location="${item.id}" role="option" aria-selected="${item.id === state.locationFilter}">${item.id === state.locationFilter ? "✓ " : ""}${esc(item.label)}</button>`).join("");
  return `<div class="location-picker"><button class="location-button" data-action="toggle-location" aria-expanded="${state.locationOpen}" aria-haspopup="listbox"><svg class="location-menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>${esc(selected.shortLabel)}</span></button>${state.locationOpen ? `<div class="location-menu" role="listbox" aria-label="Choose a venue">${options}</div>` : ""}</div>`;
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
  if (state.classFilter === "premium") list = list.filter(item => /^(VVIP|VIP)/.test(item.section));
  if (state.classFilter === "value") list = list.filter(item => /^(PS|CAT|FLOOR)/.test(item.section) || item.section === "GA");
  if (state.classFilter === "instant") list = list.filter(item => item.badges.some(badge => badge.toLowerCase().includes("instant")));
  if (state.sort === "price") list = list.sort((a, b) => a.price - b.price);
  else if (state.sort === "best") list = list.sort((a, b) => b.score - a.score);
  return list;
}

function eventCards() {
  const q = state.searchTerm.trim().toLowerCase();
  const events = state.events.filter(item => (state.locationFilter === "all" || item.venueKey === state.locationFilter) && (!q || `${item.name} ${item.tour} ${item.venue} ${item.city}`.toLowerCase().includes(q)));
  if (!events.length) return `<div class="no-events">No shows found. Try another artist or venue.</div>`;
  const shownEvents = state.showAllEvents || q ? events : events.slice(0, 8);
  return shownEvents.map(event => `<button type="button" class="event-card ${event.id === state.eventId ? "event-card-active" : ""}" data-action="event" data-id="${esc(event.id)}">${posterImage(event, "event-card-poster")}<div class="event-card-info"><div class="event-date">${esc(event.date)}</div><h3>${esc(event.name)}</h3><p>${esc(event.venue)} · ${esc(event.city)}</p><span class="event-sale ${event.state === "SOLD OUT" ? "is-sold-out" : ""}">${esc(event.state)}</span></div></button>`).join("");
}

function updateEventSearch() {
  const strip = $(".event-strip");
  if (!strip) return;
  strip.innerHTML = eventCards();
}

const concertGroupKey = event => `${event.venueKey}::${event.name}::${event.tour}`;
function concertGroup(event) {
  return state.events.filter(item => concertGroupKey(item) === concertGroupKey(event)).sort((a, b) => String(a.isoDate || a.date).localeCompare(String(b.isoDate || b.date)));
}
function concertGroups() {
  const events = state.events.filter(item => state.locationFilter === "all" || item.venueKey === state.locationFilter);
  const seen = new Set();
  return events.filter(item => {
    const key = concertGroupKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function concertOptions(selectedEvent) {
  return concertGroups().map(item => `<option value="${esc(concertGroupKey(item))}" ${concertGroupKey(item) === concertGroupKey(selectedEvent) ? "selected" : ""}>${esc(item.name)}</option>`).join("");
}
function dateOptions(selectedEvent) {
  return concertGroup(selectedEvent).map(item => `<option value="${esc(item.id)}" ${item.id === selectedEvent.id ? "selected" : ""}>${esc(item.date)}</option>`).join("");
}
function selectShowForTickets(show) {
  if (!show) return;
  state.eventId = show.id; state.section = "All sections"; state.block = "All blocks"; state.listing = null; state.receipt = null; state.step = 1;
  state.classFilter = "all"; state.minPrice = 0; state.maxPrice = 2000; state.quantity = 2; state.sort = "recommended";
  render(); refreshListings();
}
const makeBlock = (d, label, x, y) => ({ d, label, x, y });
const ARENA_ZONES = {
  VVIP: { blocks: [makeBlock("M452 120h96v82h-96z", "VVIP", 500, 165)] },
  VIP: { blocks: [makeBlock("M218 122h106v86H218z", "228–201", 271, 169), makeBlock("M334 122h106v86H334z", "214–201", 387, 169), makeBlock("M560 122h106v86H560z", "101–114", 613, 169), makeBlock("M676 122h106v86H676z", "115–128", 729, 169), makeBlock("M302 244h178v34H302z", "VIP", 391, 266), makeBlock("M520 244h178v34H520z", "VIP", 609, 266)] },
  PS1: { blocks: [makeBlock("M302 282h178v84H302z", "PS1 · LEFT", 391, 329), makeBlock("M520 282h178v84H520z", "PS1 · RIGHT", 609, 329)] },
  PS2: { blocks: [makeBlock("M72 122h132v86H72z", "RESTRICTED", 138, 170), makeBlock("M796 122h132v86H796z", "RESTRICTED", 862, 170), makeBlock("M282 390h198v92H282z", "252–201", 381, 441), makeBlock("M520 390h198v92H520z", "101–149", 619, 441)] },
  PS3: { blocks: [makeBlock("M82 240h168v139H82z", "234–201", 166, 314), makeBlock("M750 240h168v139H750z", "101–146", 834, 314)] },
  PS4: { blocks: [makeBlock("M100 403h158v90H100z", "236–201", 179, 451), makeBlock("M742 403h158v90H742z", "101–143", 821, 451)] },
};
const AXIATA_ZONES = {
  "VIP": { blocks: [makeBlock("M590 156h62v112h-62z", "VA1", 621, 212), makeBlock("M660 156h62v112h-62z", "VB1", 691, 212), makeBlock("M730 156h62v112h-62z", "VC1", 761, 212), makeBlock("M590 278h62v112h-62z", "VA2", 621, 334), makeBlock("M660 278h62v112h-62z", "VB2", 691, 334), makeBlock("M730 278h62v112h-62z", "VC2", 761, 334), makeBlock("M586 505h64v82h-64z", "301", 618, 546), makeBlock("M658 505h64v82h-64z", "302", 690, 546), makeBlock("M730 505h64v82h-64z", "303", 762, 546)] },
  "CAT 1": { blocks: [makeBlock("M500 176h54v105h-54z", "318", 527, 228), makeBlock("M500 289h54v105h-54z", "319", 527, 341), makeBlock("M500 402h64v42h-64z", "320", 532, 423), makeBlock("M462 449h103v24l-42 37h-61z", "321", 514, 480), makeBlock("M500 547l68-63 10 30v80h-60z", "322", 543, 552), makeBlock("M815 449h103v61h-61l-42-37z", "305", 866, 480), makeBlock("M852 289h54v105h-54z", "306", 879, 341), makeBlock("M852 176h54v105h-54z", "307", 879, 228), makeBlock("M874 547l-69-77-4 36v88h73z", "304", 838, 551)] },
  "CAT 2": { blocks: [makeBlock("M355 176h96v105h-96z", "417", 403, 228), makeBlock("M355 289h96v105h-96z", "418", 403, 341), makeBlock("M355 402h96v105h-96z", "419", 403, 454), makeBlock("M927 176h96v105h-96z", "407", 975, 228), makeBlock("M927 289h96v105h-96z", "406", 975, 341), makeBlock("M927 402h96v105h-96z", "405", 975, 454), makeBlock("M534 601h98v88h-98z", "401", 583, 645), makeBlock("M641 601h98v88h-98z", "402", 690, 645), makeBlock("M748 601h98v88h-98z", "403", 797, 645)] },
  "CAT 3": { blocks: [makeBlock("M355 515h115l26 53v121h-24l-111-93z", "420", 438, 605), makeBlock("M1023 515H908l-26 53v121h24l111-93z", "404", 940, 605)] },
};

function ellipseBlock(cx, cy, rxOuter, ryOuter, rxInner, ryInner, start, end) {
  const point = (rx, ry, angle) => [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  const a = point(rxOuter, ryOuter, start), b = point(rxOuter, ryOuter, end), c = point(rxInner, ryInner, end), d = point(rxInner, ryInner, start);
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} A${rxOuter} ${ryOuter} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)} L${c[0].toFixed(1)} ${c[1].toFixed(1)} A${rxInner} ${ryInner} 0 0 0 ${d[0].toFixed(1)} ${d[1].toFixed(1)} Z`;
}
function makeStadiumZones() {
  const zones = Object.fromEntries(VENUE_SECTIONS["tm-stadium-nasional"].filter(name => name.startsWith("CAT")).map(name => [name, { blocks: [] }]));
  [[1, 310, 194, 238, 143, ["CAT 1", "CAT 2", "CAT 3"]], [2, 352, 225, 311, 194, ["CAT 4", "CAT 5", "CAT 6"]], [3, 383, 250, 352, 225, ["CAT 7", "CAT 8", "CAT 9"]]].forEach(([level, rxO, ryO, rxI, ryI, categories]) => {
    const count = 32;
    for (let i = 0; i < count; i++) {
      const mid = -Math.PI / 2 + (i + .5) * Math.PI * 2 / count;
      const delta = Math.abs((((mid + Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI));
      const cat = categories[delta < .95 ? 0 : delta < 2.05 ? 1 : 2];
      const labelPoint = [400 + (rxO + rxI) / 2 * Math.cos(mid), 315 + (ryO + ryI) / 2 * Math.sin(mid)];
      zones[cat].blocks.push(makeBlock(ellipseBlock(400, 315, rxO, ryO, rxI, ryI, -Math.PI / 2 + i * Math.PI * 2 / count, -Math.PI / 2 + (i + 1) * Math.PI * 2 / count), String(level * 100 + i + 1), labelPoint[0], labelPoint[1]));
    }
  });
  zones["FLOOR A"] = { blocks: [] }; zones["FLOOR B"] = { blocks: [] }; zones["FLOOR C"] = { blocks: [] };
  ["FLOOR A", "FLOOR B"].forEach((name, side) => {
    for (let i = 0; i < 16; i++) {
      const x = (side ? 416 : 248) + (i % 4) * 35, y = 257 + Math.floor(i / 4) * 29;
      zones[name].blocks.push(makeBlock(`M${x} ${y}h31v25h-31z`, `${side ? "B" : "A"}${i + 1}`, x + 15.5, y + 16));
    }
  });
  for (let i = 0; i < 3; i++) { const x = 366 + i * 23; zones["FLOOR C"].blocks.push(makeBlock(`M${x} 376h20v19h-20z`, `C${i + 1}`, x + 10, 389)); }
  return zones;
}
const STADIUM_ZONES = makeStadiumZones();
function venueMapBlocks(venueKey) {
  const zones = venueKey === "unifi-arena" ? AXIATA_ZONES : venueKey === "tm-stadium-nasional" ? STADIUM_ZONES : ARENA_ZONES;
  return Object.entries(zones).flatMap(([area, zone]) => (zone.blocks || []).map((block, index) => ({ area, key: `${area}::${index}`, label: block.label || area })));
}

function sectionMap() {
  const event = currentEvent();
  if (event.venueKey === "unifi-arena") return unifiArenaMap(event);
  if (event.venueKey === "tm-stadium-nasional") return nationalStadiumMap(event);
  return `<div class="venue-map arena-map genting-map"><svg class="arena-map-svg" viewBox="0 0 1000 620" role="group" aria-label="Interactive Genting Arena of Stars seating map"><path class="arena-bowl" d="M48 116 Q500 12 952 116 L984 500 Q500 610 16 500 Z"/><path class="arena-row" d="M90 225H910M68 380H932M42 510H958"/><g class="stage-block"><path d="M300 47h400v52H300z"/><text x="500" y="80" text-anchor="middle">STAGE</text></g><g class="arena-gate-vip"><path d="M70 128v48m-12-36h24m-20-10h16"/><text x="82" y="194">GATE VIP</text></g>${Object.entries(ARENA_ZONES).map(([name]) => mapSection(name)).join("")}<g class="arena-gates"><text x="165" y="535">GATE C</text><text x="500" y="550">GATE B</text><text x="835" y="535">GATE A</text></g><g class="arena-pillar"><circle cx="500" cy="520" r="15"/><text x="500" y="525" text-anchor="middle">P</text></g><text class="arena-warning" x="500" y="592" text-anchor="middle">Perspective seating plan · illustrative layout</text></svg><div class="map-footnote">Arena of Stars · seating blocks and price zones · schematic 2D plan</div></div>`;
}

function mapZoneButton(name, zone, event = currentEvent()) {
  const areaActive = state.section === name;
  const available = event.listings?.some(item => item.section === name && Number(item.qty || 0) >= selectedCount());
  const listings = (event.listings || []).filter(item => item.section === name);
  const lowest = listings.length ? Math.min(...listings.map(item => item.price)) : null;
  const gentingColorTier = { VVIP: 0, VIP: 0, PS1: 1, PS2: 2, PS3: 3, PS4: 4 };
  const tier = event.venueKey === "arena-stars" ? gentingColorTier[name] ?? 0 : Math.max(0, (VENUE_SECTIONS[event.venueKey] || event.sections || []).indexOf(name));
  const priceLabel = lowest == null ? "No sample offers" : `from RM ${Number(lowest).toLocaleString("en-MY")}`;
  const blocks = zone.blocks || (zone.paths || []).map((d, index) => ({ d, label: index ? "" : name, x: zone.label?.[0] || 0, y: zone.label?.[1] || 0 }));
  return blocks.map((block, index) => {
    const blockKey = `${name}::${index}`;
    const active = state.block === blockKey || (state.block === "All blocks" && areaActive);
    const label = block.label || name;
    return `<g class="seat-zone tier-${tier % 11} ${active ? "zone-active" : ""} ${available ? "zone-available" : "zone-empty"}" ${available ? `data-action="map-block" data-area="${esc(name)}" data-block="${esc(blockKey)}" role="button" tabindex="0" aria-pressed="${active}"` : `aria-disabled="true" tabindex="-1"`} aria-label="${esc(name)} · ${esc(label)}${available ? `, ${priceLabel}` : ", Sold out"}"><title>${esc(name)} · ${esc(label)} · ${available ? priceLabel : "Sold out"}</title><path d="${block.d}"/>${block.label ? `<text x="${block.x}" y="${block.y}" text-anchor="middle" dominant-baseline="central">${esc(block.label)}</text>` : ""}</g>`;
  }).join("");
}

function mapSection(name) {
  return mapZoneButton(name, ARENA_ZONES[name]);
}

function unifiArenaMap(event) {
  const zones = Object.keys(AXIATA_ZONES).map(name => mapZoneButton(name, AXIATA_ZONES[name], event)).join("");
  return `<div class="venue-map arena-map unifi-map"><svg class="arena-map-svg" viewBox="330 0 710 730" role="group" aria-label="Interactive Axiata Arena concert seating map"><rect class="axiata-canvas" x="330" y="0" width="710" height="730"/><path class="axiata-stage" d="M590 30h228v58H590zM632 88h144v45H632z"/><text class="axiata-stage-label" x="704" y="70" text-anchor="middle">STAGE</text><rect class="axiata-royal-box" x="463" y="176" width="30" height="105"/><rect class="axiata-royal-box" x="463" y="289" width="30" height="105"/><text class="axiata-media-label" x="478" y="228" text-anchor="middle" transform="rotate(-90 478 228)">ROYAL BOX</text><text class="axiata-media-label" x="478" y="341" text-anchor="middle" transform="rotate(-90 478 341)">MEDIA</text><text class="axiata-aisle-label" x="577" y="327" text-anchor="middle">AISLE</text><g class="unifi-sections">${zones}</g><rect class="axiata-stage-b" x="600" y="440" width="180" height="44" rx="2"/><text class="axiata-stage-b-label" x="690" y="469" text-anchor="middle">STAGE B</text></svg></div>`;
}

function nationalStadiumMap(event) {
  const ringZones = Object.keys(STADIUM_ZONES).filter(name => name.startsWith("CAT")).map(name => mapZoneButton(name, STADIUM_ZONES[name], event)).join("");
  const floorZones = Object.keys(STADIUM_ZONES).filter(name => name.startsWith("FLOOR")).map(name => mapZoneButton(name, STADIUM_ZONES[name], event)).join("");
  const stageMarkup = event.stageLayout === "360" ? `<g class="stadium-stage stadium-stage-360"><circle cx="400" cy="317" r="29"/><text x="400" y="321" text-anchor="middle">360°</text></g>` : `<g class="stadium-stage"><path d="M342 216h116v30H342z"/><text x="400" y="236" text-anchor="middle">STAGE</text></g>`;
  return `<div class="venue-map arena-map national-map"><svg class="arena-map-svg" viewBox="0 0 800 570" role="group" aria-label="Interactive TM Stadium Nasional Bukit Jalil numbered seating map"><ellipse class="stadium-outline" cx="400" cy="315" rx="383" ry="249"/><ellipse class="stadium-track" cx="400" cy="315" rx="225" ry="135"/><g class="stadium-zones">${ringZones}</g><rect class="stadium-field" x="238" y="254" width="324" height="126" rx="8"/><path class="stadium-field-lines" d="M238 317H562M400 254V380"/><circle class="stadium-field-lines" cx="400" cy="317" r="25"/><g class="stadium-floor-zones">${floorZones}</g>${stageMarkup}<text class="stadium-level level-one" x="400" y="138" text-anchor="middle">LEVEL 1 · 101–132</text><text class="stadium-level level-two" x="400" y="101" text-anchor="middle">LEVEL 2 · 201–232</text><text class="stadium-level level-three" x="400" y="65" text-anchor="middle">LEVEL 3 · 301–332</text><g class="stadium-gates"><text x="91" y="430">GATE A</text><text x="400" y="536">GATE B</text><text x="709" y="430">GATE C</text><text x="202" y="487">GATE D</text><text x="598" y="487">GATE E</text></g></svg><div class="map-footnote">TM Stadium Nasional · numbered 100 / 200 / 300 level blocks · schematic</div></div>`;
}

function mapPriceLegend(event) {
  return "";
}
function listingCard(item, index) {
  const estimated = item.price * selectedCount();
  const viewLabel = item.score >= 9.2 ? "Excellent view" : item.score >= 8.5 ? "Great view" : "Clear view";
  return `<article class="ticket-listing"><div class="deal-stamp ${index === 0 ? "best-deal" : ""}">${index === 0 ? "GREAT VALUE" : esc(item.badges[0] || "AVAILABLE")}</div><div class="ticket-main"><div class="ticket-section-line"><h3>${esc(item.section)}</h3><span class="ticket-type-pill">${item.badges.some(b => b.includes("Standing")) ? "Standing" : "Seated"}</span></div><p class="ticket-row"><svg class="ticket-feature-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg><span>${viewLabel}</span></p><p class="ticket-age-note"><svg class="ticket-feature-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="2.5"/><path d="M4.5 20v-4.3A4.5 4.5 0 0 1 9 11.2a4.5 4.5 0 0 1 4.5 4.5V20M16.5 8.5a2 2 0 1 0 0 4M16.5 14.5a3 3 0 0 1 3 3V20"/></svg><span>Under 16s must be accompanied by an adult.</span></p><div class="ticket-perks">${item.badges.map(badge => `<span>✓ ${esc(badge)}</span>`).join("")}</div></div><div class="ticket-stock"><strong>${item.qty} tickets</strong><span>together</span></div><div class="ticket-price"><strong>${money(item.price)}</strong><span>per ticket</span><small>${money(estimated)} total</small></div><button class="primary-btn ticket-cta" data-action="choose-listing" data-id="${esc(item.id)}">See tickets <span>→</span></button></article>`;
}

function listingPanel(event) {
  const listings = getListings();
  const venueSections = [...new Set([...(VENUE_SECTIONS[event.venueKey] || []), ...(event.sections || [])])];
  const areaOptions = `<option value="all" ${state.section === "All sections" ? "selected" : ""}>All areas</option>${venueSections.map(area => {
    const blocks = venueMapBlocks(event.venueKey).filter(block => block.area === area);
    const areaValue = `area::${area}`;
    const areaSelected = state.section === area && state.block === "All blocks";
    const available = event.listings?.some(item => item.section === area && Number(item.qty || 0) >= selectedCount());
    const unavailable = available ? "" : "disabled";
    return `<optgroup label="${esc(area)}"><option value="${esc(areaValue)}" ${areaSelected ? "selected" : ""} ${unavailable}>${esc(area)}${available ? "" : " · SOLD OUT"}</option>${blocks.map(block => `<option value="block::${esc(block.key)}" ${state.block === block.key ? "selected" : ""} ${unavailable}>${esc(block.label)}${available ? "" : " · SOLD OUT"}</option>`).join("")}</optgroup>`;
  }).join("")}`;
  const filters = TIERS.map(item => `<button class="filter-chip ${state.classFilter === item.id ? "filter-active" : ""}" data-action="class-filter" data-filter="${item.id}">${item.name}</button>`).join("");
  return `<div class="market-grid"><section class="map-card ${state.mapExpanded ? "map-card-expanded" : ""}" role="${state.mapExpanded ? "dialog" : "region"}" aria-modal="${state.mapExpanded}" aria-label="${esc(event.venue)} ticket zones"><div class="card-heading"><div><span class="section-kicker">${esc(event.venue.toUpperCase())}</span><h2>Choose your zone</h2></div><button class="map-help" data-action="${state.mapExpanded ? "close-map" : "map-help"}" aria-label="${state.mapExpanded ? "Close map" : "Map information"}">${state.mapExpanded ? "×" : "?"}</button></div>${sectionMap()}${mapPriceLegend(event)}<div class="map-legend"><span><i class="legend-dot dot-available"></i>Listed zone · price-coded</span><span><i class="legend-dot dot-selected"></i>Selected zone</span><span><i class="legend-dot dot-none"></i>No sample offers</span></div>${!state.mapExpanded ? `<button class="clear-section map-expand-button" data-action="expand-map">Zoom in</button>` : ""}</section><button class="map-backdrop" data-action="close-map" aria-label="Close expanded venue map" ${state.mapExpanded ? "" : "hidden"}></button><section class="listings-column"><div class="listings-toolbar"><div><span class="section-kicker">${esc(event.name.toUpperCase())} · ${esc(event.venue.toUpperCase())}</span><h2>Tickets for this show</h2><p>${listings.length} demo listings · Prices shown per ticket</p></div><a class="official-link" href="${esc(event.source)}" target="_blank" rel="noopener">Official event info ↗</a></div><div class="filter-panel"><div class="filter-row"><label class="concert-filter"><span>Concert</span><select data-change="concert">${concertOptions(event)}</select></label><label class="date-filter"><span>Date</span><select data-change="date">${dateOptions(event)}</select></label><label class="quantity-filter"><span>Tickets</span><select data-change="quantity">${[1,2,3,4,5,6].map(n => `<option value="${n}" ${n === selectedCount() ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="area-filter"><span>Area</span><select data-change="area">${areaOptions}</select></label><label class="sort-filter"><span>Sort by</span><select data-change="sort"><option value="recommended" ${state.sort === "recommended" ? "selected" : ""}>Recommended</option><option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option><option value="best" ${state.sort === "best" ? "selected" : ""}>Best view</option></select></label></div><div class="filter-chips">${filters}</div><div class="price-filter"><label>Price per ticket <strong>${money(state.minPrice)} – ${money(state.maxPrice)}</strong></label><div><input aria-label="Minimum price" type="range" min="0" max="2000" step="25" value="${state.minPrice}" data-change="min-price"><input aria-label="Maximum price" type="range" min="100" max="2000" step="25" value="${state.maxPrice}" data-change="max-price"></div></div></div><div class="listing-header"><strong>${listings.length} listings</strong><span>Price includes estimated fees</span></div><div class="listing-results">${listings.length ? listings.map(listingCard).join("") : `<div class="empty-listings"><strong>No tickets match these filters.</strong><span>Try another section or ticket type.</span><button data-action="clear-filters">Clear filters</button></div>`}</div></section></div>`;
}

function stepper() {
  return `<nav class="purchase-steps" aria-label="Purchase steps"><button class="purchase-step ${state.step === 1 ? "active" : ""}" data-action="step" data-step="1"><span>1</span>Find tickets</button><i></i><button class="purchase-step ${state.step === 2 ? "active" : ""}" data-action="step" data-step="2" ${!state.listing ? "disabled" : ""}><span>2</span>Review</button><i></i><button class="purchase-step ${state.step === 3 ? "active" : ""}" data-action="step" data-step="3" ${!state.listing ? "disabled" : ""}><span>3</span>Checkout</button><i></i><button class="purchase-step ${state.step === 4 ? "active" : ""}" data-action="manage"><span>4</span>My bookings</button></nav>`;
}

function reviewView(event) {
  const item = state.listing;
  if (!item) return `<section class="review-card"><h2>Choose a ticket first</h2><button class="primary-btn" data-action="step" data-step="1">Browse tickets →</button></section>`;
  const quantity = Math.min(selectedCount(), item.qty);
  return `<section class="review-card"><div class="review-heading"><div><span class="section-kicker">YOUR TICKET SELECTION</span><h2>Make sure it's your moment</h2></div><span class="secure-pill">✓ Secure booking</span></div><div class="review-event"><div class="review-poster">${posterImage(event)}</div><div><span class="section-kicker">${esc(event.tour)}</span><h3>${esc(event.name)}</h3><p>${esc(event.date)} · ${esc(event.time)}</p><p>${esc(event.venue)} · ${esc(event.area)}</p></div></div><div class="review-ticket-row"><div><span class="section-kicker">AREA</span><strong>${esc(item.section)}</strong><small>Under 16s must be accompanied by an adult.</small></div><div><span class="section-kicker">QUANTITY</span><strong>${quantity} tickets</strong></div><div><span class="section-kicker">PRICE EACH</span><strong>${money(item.price)}</strong></div></div><div class="review-total"><div><span>Estimated total <small>Includes estimated fees</small></span><strong>${money(item.price * quantity)}</strong></div><p>Tickets are demo inventory until a live marketplace API is connected.</p></div><div class="review-actions"><button class="secondary-btn" data-action="step" data-step="1">← Back to tickets</button><button class="primary-btn" data-action="begin-checkout">Continue to checkout&nbsp; →</button></div></section>`;
}

function paymentIcon(method) {
  const variants = {
    "Touch and Go": `<span class="payment-brand payment-tng">TnG</span>`,
    Visa: `<span class="payment-brand payment-visa">VISA</span>`,
    Mastercard: `<span class="payment-brand payment-mastercard"><i></i><i></i></span>`,
    UnionPay: `<span class="payment-brand payment-unionpay">UP</span>`,
    "Google Pay": `<span class="payment-brand payment-google"><b>G</b><small>Pay</small></span>`,
    "Apple Pay": `<span class="payment-brand payment-apple"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.7 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.6-1.7-3.2-1.8-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.7.8-3.4 2-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.4 1.1-2.5-.1 0-2.1-.8-2.1-3zM14.7 5.8c.6-.7 1-1.6.9-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.5-.9 2.4.9.1 1.8-.4 2.4-1z"/></svg><small>Pay</small></span>`,
    "WeChat Pay": `<span class="payment-brand payment-wechat"><i></i><i></i></span>`,
    Alipay: `<span class="payment-brand payment-alipay">A</span>`,
  };
  return variants[method] || `<span class="payment-brand">${esc(method.slice(0, 2))}</span>`;
}

function checkoutView(event) {
  if (state.receipt) return `<section class="receipt-card"><div class="receipt-success"><span>✓</span><div class="section-kicker">BOOKING CONFIRMED</div><h2>Your night is booked.</h2><p>Your e-ticket details are below.</p></div><div class="receipt-paper"><div class="receipt-paper-top">${logo(30)}<span>ECHO LIVE · E-TICKET</span></div><div class="receipt-ref"><span>BOOKING REFERENCE</span><strong>${esc(state.receipt.id || "Reference unavailable")}</strong></div><div class="receipt-grid"><div><small>EVENT</small><strong>${esc(state.receipt.eventName || event.name)}</strong></div><div><small>VENUE</small><strong>${esc(state.receipt.venue || event.venue)}</strong></div><div><small>DATE / TIME</small><strong>${esc(state.receipt.date || event.date)} · ${esc(state.receipt.time || event.time)}</strong></div><div><small>AREA</small><strong>${esc(state.receipt.section || state.listing?.section)}</strong></div><div><small>QUANTITY</small><strong>${Number(state.receipt.quantity || state.quantity)} tickets</strong></div><div><small>TOTAL</small><strong>${money(state.receipt.total ?? state.listing?.price * state.quantity)}</strong></div></div></div><div class="receipt-actions"><button class="secondary-btn" data-action="show-booking">Manage booking</button><button class="primary-btn" data-action="new-search">Explore more shows&nbsp; →</button></div></section>`;
  const item = state.listing;
  if (!item) return `<section class="review-card"><h2>Choose a ticket first</h2><button class="primary-btn" data-action="step" data-step="1">Browse tickets →</button></section>`;
  const paymentMethods = ["Touch and Go", "Visa", "Mastercard", "UnionPay", "Google Pay", "Apple Pay", "WeChat Pay", "Alipay"];
  const paymentOptions = `<fieldset class="payment-methods"><legend>Payment method</legend><div class="payment-method-grid">${paymentMethods.map(method => `<button type="button" class="payment-option ${state.paymentMethod === method ? "selected" : ""}" data-action="payment-method" data-method="${esc(method)}" aria-pressed="${state.paymentMethod === method}">${paymentIcon(method)}<strong>${esc(method)}</strong><span class="payment-check">${state.paymentMethod === method ? "✓" : ""}</span></button>`).join("")}</div></fieldset>`;
  const remaining = Math.max(0, Math.ceil((state.checkoutDeadline - Date.now()) / 1000));
  const countdown = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  return `<section class="checkout-card"><div class="checkout-heading"><div><span class="section-kicker">FINAL STEP</span><h2>Checkout</h2><p>You're one step away from a live night out.</p></div><span class="checkout-countdown">Tickets held for <strong id="checkout-countdown-value">${countdown}</strong></span></div><div class="checkout-layout"><form class="checkout-form" id="checkout-form"><h3>Ticket delivery</h3><label>Full name<input required name="customerName" value="${esc(state.name)}" placeholder="Name on the booking"></label><label>Email address<input required name="customerEmail" type="email" value="${esc(state.email)}" placeholder="you@example.com"></label>${paymentOptions}<div class="idempotency-note"><span>Request protection</span><code>${esc(state.key)}</code><b>READY</b></div><button class="primary-btn checkout-submit" type="submit" ${!state.paymentMethod ? "disabled" : ""}>Confirm booking · ${money(item.price * selectedCount())}</button><p class="demo-terms">Prototype checkout only — no payment is collected.</p></form><aside class="checkout-summary"><span class="section-kicker">ORDER SUMMARY</span><h3>${esc(event.name)}</h3><p>${esc(event.date)} · ${esc(event.venue)}</p><div class="summary-line"><span>${esc(item.section)} × ${selectedCount()}</span><strong>${money(item.price * selectedCount())}</strong></div><div class="summary-line"><span>Estimated fees</span><strong>Included</strong></div><div class="summary-total"><span>Total</span><strong>${money(item.price * selectedCount())}</strong></div><div class="summary-note">Demo ticket details stay in this browser.</div></aside></div><button class="secondary-btn checkout-back" data-action="leave-checkout">← Back to review</button></section>`;
}

function checkoutHoldModal() {
  return `<div class="checkout-hold-backdrop"><section class="checkout-hold-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-hold-title"><div class="hold-lock ${state.checkoutLocking ? "locking" : ""}"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="lock-shackle" d="M15 21v-7a9 9 0 0 1 18 0v7"/><rect x="10" y="20" width="28" height="22" rx="5"/><circle cx="24" cy="30" r="2"/><path d="M24 32v4"/></svg></div><span class="section-kicker">${state.checkoutLocking ? "SECURING YOUR SEATS" : "YOUR SEATS ARE READY"}</span><h2 id="checkout-hold-title">Complete your purchase within 10 minutes</h2><p>${state.checkoutLocking ? "Locking your selected tickets…" : "Start checkout to hold these tickets while you complete payment."}</p><button class="primary-btn" data-action="start-checkout" ${state.checkoutLocking ? "disabled" : ""}>${state.checkoutLocking ? "Securing tickets…" : "Start"}</button><button class="hold-cancel" data-action="cancel-checkout" ${state.checkoutLocking ? "disabled" : ""}>Cancel</button></section></div>`;
}

function bookingEvent(booking) {
  return state.events.find(event => event.id === (booking?.eventId || booking?.event_id))
    || state.events.find(event => event.name === (booking?.eventName || booking?.event) && (!booking?.venue || event.venue === booking.venue));
}

function bookingDaysUntilEvent(booking) {
  const rawDate = bookingEvent(booking)?.isoDate || booking?.isoDate || booking?.eventDate || booking?.date;
  if (!rawDate) return null;
  const isoDate = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const eventDate = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(rawDate);
  if (Number.isNaN(eventDate.getTime())) return null;
  eventDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((eventDate - today) / 86400000);
}

function bookingView() {
  const booking = state.booking;
  const cancelled = ["cancelled", "canceled"].includes(String(booking?.status || "").toLowerCase());
  const daysUntil = booking ? bookingDaysUntilEvent(booking) : null;
  const eventPassed = daysUntil !== null && daysUntil < 0;
  const bookingStatus = String(booking?.status || "").toLowerCase();
  const inactive = cancelled || ["expired", "timed_out", "refunded", "listed_for_resale"].includes(bookingStatus);
  let bookingActions = "";
  if (inactive) bookingActions = `<div class="result-actions"><span>${cancelled ? "Cancelled tickets return to availability." : bookingStatus === "listed_for_resale" ? "These tickets are listed for resale." : "This booking is no longer active."}</span></div>`;
  else if (eventPassed) bookingActions = `<div class="result-actions"><span>This event has already taken place.</span></div>`;
  else if (daysUntil !== null && daysUntil < 14) bookingActions = `<div class="result-actions"><span>Within 14 days of the event, tickets can only be resold.</span><button class="cancel-button" data-action="resell-booking">Resell tickets</button></div>`;
  else bookingActions = `<div class="result-actions"><span>${daysUntil === null ? "Cancellation is available for this booking." : "You can cancel until 14 days before the event."}</span><button class="cancel-button" data-action="cancel-booking" ${state.cancelBusy ? "disabled" : ""}>${state.cancelBusy ? "Cancelling…" : "Cancel booking"}</button></div>`;
  return `<section class="manage-card" id="booking-search"><div class="manage-heading"><span class="section-kicker">YOUR ECHO LIVE ORDERS</span><h2>Manage a booking</h2><p>Enter the booking reference from your confirmation email.</p></div><form id="lookup-form"><label for="booking-reference">Booking reference</label><div class="lookup-row"><input id="booking-reference" name="bookingId" value="${esc(state.bookingId)}" placeholder="e.g. 3c2b1a…" autocomplete="off"><button class="primary-btn" type="submit" ${state.lookupBusy ? "disabled" : ""}>${state.lookupBusy ? "Searching…" : "Find booking →"}</button></div></form>${booking ? `<article class="booking-result"><div class="booking-result-head"><div><span class="section-kicker">BOOKING DETAILS</span><h3>${esc(booking.eventName || booking.event || "Live event")}</h3></div><span class="booking-status ${cancelled ? "cancelled" : ""}">${cancelled ? "CANCELLED" : esc(String(booking.status || "CONFIRMED").toUpperCase())}</span></div><div class="result-ref">Reference <strong>${esc(booking.id || booking.bookingId || state.bookingId)}</strong></div><div class="receipt-grid"><div><small>VENUE</small><strong>${esc(booking.venue || "—")}</strong></div><div><small>DATE / TIME</small><strong>${esc(booking.date || "—")} · ${esc(booking.time || "—")}</strong></div><div><small>AREA</small><strong>${esc(booking.section || "—")}</strong></div><div><small>QUANTITY / TOTAL</small><strong>${Number(booking.quantity || 0)} · ${money(booking.total)}</strong></div></div>${bookingActions}</article>` : `<div class="empty-bookings"><span>▤</span><strong>No booking selected</strong><small>Your ticket details will appear here.</small></div>`}<div class="booking-footer-actions"><button class="browse-text-button" data-action="step" data-step="1">‹ Browse shows</button><button class="history-button" data-action="history">History</button></div></section>`;
}

function sellView() {
  const profile = getMemberProfile();
  const sellableShows = state.events.filter(event => event.resaleAllowed !== false || (state.sellDraft?.bookingId && event.id === state.sellDraft.bookingEventId));
  const selectedShow = sellableShows.find(event => event.id === (state.sellDraft?.eventId || state.eventId)) || sellableShows[0] || currentEvent();
  const draft = state.sellDraft || {};
  const concertOptions = [...new Map(sellableShows.map(event => [concertGroupKey(event), event])).values()].map(event => `<option value="${esc(concertGroupKey(event))}" ${concertGroupKey(event) === (draft.concertKey || concertGroupKey(selectedShow)) ? "selected" : ""}>${esc(event.name)}</option>`).join("");
  const selectedGroup = sellableShows.filter(event => concertGroupKey(event) === (draft.concertKey || concertGroupKey(selectedShow))).sort((a, b) => String(a.isoDate || a.date).localeCompare(String(b.isoDate || b.date)));
  const eventOptions = selectedGroup.map(event => `<option value="${esc(event.id)}" ${event.id === selectedShow.id ? "selected" : ""}>${esc(event.date)} · ${esc(event.time)}</option>`).join("");
  const quantityMax = draft.bookingId ? Math.max(1, Number(draft.quantity || 1)) : 6;
  return `<section class="sell-page"><div class="page-heading-layout">${backButton("go-home")}<div class="page-heading"><span class="section-kicker">SELL ON ECHO LIVE</span><h1>Make someone’s night.</h1><p>List your tickets for ${esc(selectedShow.venue)}.</p></div></div><div class="sell-layout"><form id="sell-form" class="sell-form"><div class="form-section-title"><span>01</span><div><h2>Ticket details</h2><p>Choose the show and how many tickets you have.</p></div></div><label>Concert name<select name="concertKey" data-change="sell-concert" required>${concertOptions}</select></label><label>Show date &amp; time<select name="eventId" data-change="sell-event" required>${eventOptions}</select></label><label>Ticket quantity<input name="quantity" type="number" min="1" max="${quantityMax}" step="1" value="${esc(draft.quantity || "2")}" required></label><div class="local-save-note"><span>✓</span><p><strong>Quick listing</strong><br>Price and seller details are filled in automatically for this demo.</p></div><button class="primary-btn publish-button" type="submit">Publish tickets</button></form><aside class="sell-side-card"><span class="section-kicker">HOW IT WORKS</span><h2>List in a few steps.</h2><ol><li><span>1</span><div><strong>Choose the concert</strong><small>Select its name and performance date.</small></div></li><li><span>2</span><div><strong>Set your ticket count</strong><small>Choose how many tickets are available.</small></div></li><li><span>3</span><div><strong>Publish to the marketplace</strong><small>Your offer appears for fans to browse.</small></div></li></ol><p class="sell-side-footnote">Price and account contact are provided by this demo profile.</p></aside></div></section>`;
}

function accountView() {
  const profile = getMemberProfile();
  const bookings = getBookings();
  const listings = getSellerListings();
  const initials = (profile.name || "E").trim().split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = new Date(profile.joinedAt || Date.now()).toLocaleDateString("en-MY", { month: "short", year: "numeric" });
  const bookingRows = bookings.length ? bookings.map(booking => `<article class="account-data-row"><div><strong>${esc(booking.eventName || booking.event || "Live event")}</strong><small>${esc(booking.date || "Date pending")} · ${esc(booking.section || "Tickets")} · ${Number(booking.quantity || 0)} ticket(s)</small></div><span class="booking-status ${["cancelled", "canceled"].includes(String(booking.status).toLowerCase()) ? "cancelled" : ""}">${esc(String(booking.status || "confirmed").toUpperCase())}</span><button class="account-inline-action" data-action="open-account-booking" data-id="${esc(booking.id || booking.bookingId || "")}">Details</button></article>`).join("") : `<div class="account-empty">No bookings yet. Your ticket purchases will appear here.</div>`;
  const listingRows = listings.length ? listings.map(listing => { const event = state.events.find(item => item.id === listing.eventId); return `<article class="account-data-row"><div><strong>${esc(event?.name || listing.eventName || "Live event")}</strong><small>${esc(listing.section)} · Row ${esc(listing.row)} · ${esc(listing.seats)} · ${Number(listing.qty)} available</small></div><strong class="account-listing-price">${money(listing.price)} <small>each</small></strong><button class="account-inline-action remove-listing-action" data-action="remove-listing" data-id="${esc(listing.id)}">Remove</button></article>`; }).join("") : `<div class="account-empty">No active listings. Use Sell to offer tickets to other fans.</div>`;
  return `<section class="account-page"><div class="page-heading-layout">${backButton("go-home")}<div class="page-heading"><span class="section-kicker">YOUR ECHO LIVE ACCOUNT</span><h1>Profile &amp; activity</h1><p>Keep your contact details and ticket activity together.</p></div></div><div class="account-grid"><article class="profile-card"><div class="profile-identity"><div class="profile-avatar">${esc(initials || "EL")}</div><div><span class="section-kicker">LOCAL DEMO PROFILE</span><h2>${esc(profile.name || "Echo Live Member")}</h2><p>Member since ${esc(memberSince)}</p></div></div><form id="profile-form" class="profile-form"><label>Full name<input name="profileName" value="${esc(profile.name || "")}" maxlength="80" required autocomplete="name"></label><label>Email address<input name="profileEmail" type="email" value="${esc(profile.email || "")}" maxlength="120" autocomplete="email" placeholder="Add your email"></label><label>Phone number<input name="profilePhone" type="tel" value="${esc(profile.phone || "")}" maxlength="30" autocomplete="tel" placeholder="Add your phone number"></label><label>Region<input name="profileRegion" value="${esc(profile.region || "Malaysia")}" maxlength="60" autocomplete="country-name"></label><button class="primary-btn" type="submit">Save profile</button></form><p class="local-profile-note">Your profile is stored on this device for this demo.</p></article><div class="account-activity"><article class="account-panel" id="ticket-history"><div class="account-panel-heading"><div><span class="section-kicker">TICKET HISTORY</span><h2>Your bookings</h2></div><button class="account-inline-action" data-action="manage">Booking lookup</button></div>${bookingRows}</article><article class="account-panel"><div class="account-panel-heading"><div><span class="section-kicker">SELLER DASHBOARD</span><h2>Your listings</h2></div><button class="account-inline-action" data-action="sell">Add tickets</button></div>${listingRows}</article></div></div></section>`;
}

function adminAuditView(order) {
  const booking = order.booking || {};
  const audit = order.audit;
  const status = String(audit?.status || "unverified").toLowerCase().replaceAll("_", "-");
  const statusLabel = ({ verified: "VERIFIED", mismatch: "MISMATCH", pending: "PENDING", "not-applicable": "NOT APPLICABLE", unverified: "UNVERIFIED" })[status] || String(audit?.status || "UNVERIFIED").toUpperCase();
  const statusClass = ["verified", "mismatch", "pending"].includes(status) ? status : "unverified";
  const seats = Array.isArray(booking.seats) ? booking.seats.join(", ") : (booking.seats || booking.seatNumbers || booking.listingSnapshot?.seats || "Not recorded");
  const seatRelease = audit ? `<section class="admin-audit-result"><div class="admin-audit-heading"><div><span class="section-kicker">SEAT POOL CHECK</span><h3>Release audit</h3></div><span class="admin-audit-status ${statusClass}">${esc(statusLabel)}</span></div><p>${esc(audit.message || (status === "verified" ? "The backend reports that released seats match the expected inventory." : status === "mismatch" ? "The backend reports a difference between expected and released seats." : "The backend has not completed this inventory check."))}</p><div class="admin-facts"><div><small>EXPECTED SEATS</small><strong>${esc(audit.expectedSeatCount ?? audit.expectedSeats ?? booking.quantity ?? "—")}</strong></div><div><small>RELEASED SEATS</small><strong>${esc(audit.releasedSeatCount ?? audit.releasedSeats ?? "—")}</strong></div><div><small>AVAILABLE NOW</small><strong>${esc(audit.availableSeatCount ?? audit.availableSeats ?? "—")}</strong></div><div><small>CHECKED AT</small><strong>${esc(audit.verifiedAt || audit.checkedAt || "Not provided")}</strong></div></div></section>` : `<section class="admin-audit-result admin-audit-unverified"><div class="admin-audit-heading"><div><span class="section-kicker">SEAT POOL CHECK</span><h3>Release audit</h3></div><span class="admin-audit-status unverified">UNVERIFIED</span></div><p>No authoritative seat-pool audit was returned. A cancelled order alone does not prove that its seats are available again.</p></section>`;
  return `<article class="admin-order-card"><div class="admin-order-heading"><div><span class="section-kicker">ORDER LOOKUP RESULT</span><h2>${esc(booking.eventName || booking.event || "Concert booking")}</h2></div><span class="booking-status ${["cancelled", "canceled", "expired", "timed_out"].includes(String(booking.status || "").toLowerCase()) ? "cancelled" : ""}">${esc(String(booking.status || "UNKNOWN").replaceAll("_", " ").toUpperCase())}</span></div><div class="admin-reference">Booking ID <strong>${esc(booking.id || booking.bookingId || state.adminQuery)}</strong></div><div class="admin-facts"><div><small>PAYMENT STATUS</small><strong>${esc(booking.paymentStatus || booking.payment_status || "Not provided")}</strong></div><div><small>HOLD EXPIRES</small><strong>${esc(booking.holdExpiresAt || booking.hold_expires_at || "Not provided")}</strong></div><div><small>CANCEL REASON</small><strong>${esc(booking.cancelReason || booking.cancel_reason || "—")}</strong></div><div><small>SECTION / ROW</small><strong>${esc(booking.section || "—")} · ${esc(booking.row || "—")}</strong></div><div><small>SEAT DETAILS</small><strong>${esc(seats)}</strong></div><div><small>QUANTITY / TOTAL</small><strong>${Number(booking.quantity || 0)} · ${money(booking.total)}</strong></div></div>${seatRelease}<div class="admin-result-source">${order.source === "local-demo" ? "Local demo record · this browser only" : "Admin API response"}</div></article>`;
}

function adminView() {
  return `<section class="admin-page"><div class="page-heading-layout">${backButton("go-home")}<div class="page-heading"><span class="section-kicker">ECHO LIVE OPERATIONS</span><h1>Booking &amp; seat audit</h1><p>Look up an order, review its payment or timeout status, and check the seat-pool release record.</p></div></div><div class="admin-demo-warning"><strong>${DEMO_MODE ? "Local demo mode" : "Admin API connected"}</strong><span>${DEMO_MODE ? "Orders are only visible in this browser. Seat release cannot be verified globally until the backend provides an inventory audit." : "Order lookups use the connected backend. Only authorized administrators should be allowed to call this endpoint."}</span></div><article class="admin-lookup-card"><form id="admin-lookup-form"><label for="admin-order-reference">Booking ID</label><div class="lookup-row"><input id="admin-order-reference" name="adminOrderId" value="${esc(state.adminQuery)}" placeholder="Paste a booking reference" autocomplete="off" required><button class="primary-btn" type="submit" ${state.adminBusy ? "disabled" : ""}>${state.adminBusy ? "Searching…" : "Find order"}</button></div></form>${state.adminError ? `<p class="admin-error" role="alert">${esc(state.adminError)}</p>` : ""}</article>${state.adminOrder ? adminAuditView(state.adminOrder) : `<article class="admin-empty"><span>ORDER MONITOR</span><strong>Search by booking ID</strong><p>Results include the order status, timeout details, seat assignment, and any release audit supplied by the server.</p></article>`}<article class="admin-integration-note"><span class="section-kicker">SERVER REQUIREMENT</span><h2>Automatic release needs a backend timer</h2><p>For the live flow, create an expiring seat hold when checkout begins. A server-side expiry worker should release unpaid holds even if a customer closes the page, and the admin lookup should return the release audit with the order.</p><code>GET /admin/orders/{bookingId}/audit</code></article></section>`;
}

function render() {
  const event = currentEvent();
  document.body.classList.toggle("map-open", state.mapExpanded);
  root.innerHTML = `<div class="app-shell"><header class="topbar ${state.searchOpen ? "search-open" : ""}"><a class="brand" href="#top">${logo()}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><div class="top-actions"><label class="search-box"><span>⌕</span><input name="eventSearch" value="${esc(state.searchTerm)}" placeholder="Artist, event or venue" aria-label="Search shows"></label>${locationPicker()}<button class="sell-button" data-action="sell">Sell</button><button class="account-button" data-action="account" aria-label="Account and my bookings" title="Account"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.25"></circle><circle cx="12" cy="9" r="3"></circle><path d="M6.8 18.2c.7-2.7 2.7-4.2 5.2-4.2s4.5 1.5 5.2 4.2"></path></svg></button></div><button class="mobile-search" data-action="toggle-search" aria-label="Search">⌕</button></header><main id="top"><section class="event-hero"><img class="hero-photo" src="${esc(event.image)}" alt="${esc(event.imageAlt)}" decoding="async" fetchpriority="high" onerror="this.hidden=true"><div class="hero-shade"></div><div class="hero-inner"><div class="hero-event-copy"><div class="hero-tags"><span>${esc(event.tag)}</span><span class="live-tag">LIVE MUSIC</span></div><p class="hero-kicker">${esc(event.tour)}</p><h1>${esc(event.name)}</h1><p class="hero-meta">${esc(event.date)} <i></i> ${esc(event.venue)} <i></i> ${esc(event.area)}</p><p class="hero-time">${esc(event.time)} · ${esc(event.state === "SOLD OUT" ? "Official tickets sold out" : "Demo marketplace listings shown")}</p><a class="primary-btn hero-button" href="#market">Find tickets</a></div><div class="hero-poster-wrap">${posterImage(event, "hero-poster")}<span>OFFICIAL EVENT ARTWORK</span></div></div><div class="hero-bottom"><span><i class="live-dot"></i> ECHO LIVE PICKS</span><a href="${esc(event.source)}" target="_blank" rel="noopener">Official event details ↗</a></div></section>
      <section class="discovery" id="shows"><div class="discovery-head"><div><span class="section-kicker">UP NEXT · ALL VENUES</span><h2>Find your next live moment</h2><p>Live music across Resorts World Genting and Bukit Jalil.</p></div><button class="all-shows" data-action="toggle-all-shows">${state.showAllEvents ? "Show fewer shows" : "View all shows"}</button></div><div class="event-strip">${eventCards()}</div></section>
      <section class="market-section" id="market"><div class="market-heading"><div><span class="section-kicker">TICKETS FOR ${esc(event.name.toUpperCase())}</span><h2>Pick a spot. Feel every song.</h2><p>${esc(event.venue)} · ${esc(event.area)}</p></div><div class="event-status ${event.state === "SOLD OUT" ? "sold-out" : ""}"><i></i>${esc(event.state)}</div></div>${stepper()}${state.step === 1 ? listingPanel(event) : ""}${state.step === 2 ? reviewView(event) : ""}${state.step === 3 ? checkoutView(event) : ""}${state.step === 4 ? bookingView() : ""}</section>
    </main><footer class="site-footer" id="footer"><a class="brand footer-brand" href="#top">${logo(32)}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><span>© ${new Date().getFullYear()} ECHO LIVE. All rights reserved.</span><div><a href="#footer">Help center</a><a href="#footer">Terms</a><a href="https://youtu.be/dQw4w9WgXcQ?si=SttXnPRIuduZt2Mv" target="_blank" rel="noopener">Privacy</a><button class="footer-admin-link" data-action="admin">Admin</button></div></footer>${state.checkoutModalOpen ? checkoutHoldModal() : ""}${state.toast ? `<div class="toast" role="status"><span>!</span>${esc(state.toast)}<button data-action="dismiss" aria-label="Dismiss">×</button></div>` : ""}</div>`;
  const main = $("#top", root);
  if (state.page === "sell") main.innerHTML = sellView();
  else if (state.page === "account") main.innerHTML = accountView();
  else if (state.page === "admin") main.innerHTML = adminView();}

function setStep(step) {
  if (step === 2 && !state.listing) return;
  if (step === 3 && (!state.listing || !state.checkoutDeadline)) return;
  if (step !== 3 && state.checkoutDeadline) stopCheckoutTimer();
  if (step === 3 && state.step !== 3) { state.key = uuid(); state.receipt = null; }
  state.step = step; render();
}

function stopCheckoutTimer() {
  if (state.checkoutTimer) clearInterval(state.checkoutTimer);
  state.checkoutTimer = null;
  state.checkoutDeadline = 0;
}

function expireCheckoutHold() {
  stopCheckoutTimer();
  state.step = 1; state.listing = null; state.key = ""; state.paymentMethod = "";
  state.section = "All sections"; state.block = "All blocks";
  state.toast = "Your 10-minute checkout window expired. Please choose tickets again.";
  render(); refreshListings();
}

function startCheckoutHold() {
  if (!state.listing || state.checkoutLocking) return;
  state.checkoutLocking = true; render();
  setTimeout(() => {
    if (!state.checkoutLocking) return;
    state.checkoutLocking = false; state.checkoutModalOpen = false;
    state.checkoutDeadline = Date.now() + 10 * 60 * 1000;
    state.paymentMethod = "";
    setStep(3);
    state.checkoutTimer = setInterval(() => {
      if (Date.now() >= state.checkoutDeadline) { expireCheckoutHold(); return; }
      if (state.step === 3 && !state.receipt) {
        const clock = $("#checkout-countdown-value", root);
        if (clock) {
          const remaining = Math.max(0, Math.ceil((state.checkoutDeadline - Date.now()) / 1000));
          clock.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
        }
      }
    }, 1000);
  }, 850);
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
  restoreSellerListings();
  render();
}

function publishListing(form) {
  const formData = new FormData(form);
  const event = state.events.find(item => item.id === formData.get("eventId"));
  const isLinkedBookingResale = Boolean(state.sellDraft?.bookingId && event?.id === state.sellDraft?.bookingEventId);
  const linkedBookingId = isLinkedBookingResale ? state.sellDraft.bookingId : null;
  const quantity = Number(formData.get("quantity"));
  const profile = getMemberProfile();
  const section = isLinkedBookingResale && event?.sections?.includes(state.sellDraft?.section) ? state.sellDraft.section : event?.sections?.[0];
  const price = Number((isLinkedBookingResale && state.sellDraft?.price) || event?.listings?.find(item => Number(item.price) > 0)?.price || event?.priceTop || 100);
  if (!event || event.resaleAllowed === false && !isLinkedBookingResale || !section || quantity < 1 || quantity > 6 || price < 1 || price > 2000) { toast("Please check the concert and ticket quantity."); return; }
  const listing = { id: uuid(), eventId: event.id, eventName: event.name, section, row: isLinkedBookingResale ? state.sellDraft.row || "A" : "A", seats: isLinkedBookingResale && state.sellDraft?.seats ? `Seats ${String(state.sellDraft.seats).trim()}` : "Assigned seats", qty: quantity, price, badges: ["Seller listed", "Reserved seats"], score: 7.8, sellerListing: true, sellerName: state.sellDraft?.sellerName || profile.name, sellerEmail: state.sellDraft?.sellerEmail || profile.email, createdAt: new Date().toISOString() };
  if (!saveSellerListings([...getSellerListings(), listing])) { toast(state.toast); return; }
  if (linkedBookingId && DEMO_MODE) {
    const bookings = getBookings().map(booking => String(booking.id || booking.bookingId) === linkedBookingId ? { ...booking, status: "listed_for_resale", resaleListingId: listing.id } : booking);
    localStorage.setItem("echo-ticket-orders", JSON.stringify(bookings));
  }
  restoreSellerListings(); resetPageHistory(); state.sellDraft = null; state.eventId = event.id; state.step = 1; state.listing = null;
  state.section = listing.section; state.block = "All blocks"; state.classFilter = "all"; state.quantity = Math.min(2, quantity); state.sort = "recommended"; state.minPrice = 0; state.maxPrice = 2000; state.searchTerm = ""; state.locationFilter = event.venueKey; state.locationOpen = false;
  state.toast = "Your tickets are now listed in the marketplace."; render();
  $("#market")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveProfile(form) {
  const profile = getMemberProfile();
  profile.name = String(form.elements.profileName.value).trim();
  profile.email = String(form.elements.profileEmail.value).trim();
  profile.phone = String(form.elements.profilePhone.value).trim();
  profile.region = String(form.elements.profileRegion.value).trim();
  try { localStorage.setItem("echo-member-profile", JSON.stringify(profile)); }
  catch { toast("Could not save your profile on this device."); return; }
  state.toast = "Your profile has been saved."; render();
}

root.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "event") {
    state.locationOpen = false;
    selectShowForTickets(state.events.find(item => item.id === button.dataset.id));
  } else if (action === "toggle-location") { state.locationOpen = !state.locationOpen; render(); }
  else if (action === "location-choice") {
    state.locationFilter = button.dataset.location; state.locationOpen = false; state.searchTerm = "";
    const matches = state.events.filter(item => state.locationFilter === "all" || item.venueKey === state.locationFilter);
    if (matches.length && !matches.some(item => item.id === state.eventId)) { state.eventId = matches[0].id; state.section = "All sections"; state.block = "All blocks"; state.step = 1; state.listing = null; }
    render();
  } else if (action === "map-block") {
    if (state.block === button.dataset.block) { state.section = "All sections"; state.block = "All blocks"; }
    else { state.section = button.dataset.area; state.block = button.dataset.block; }
    state.mapExpanded = false; document.body.classList.remove("map-open"); render();
  }
  else if (action === "expand-map") { state.section = "All sections"; state.block = "All blocks"; state.mapExpanded = true; render(); $("[data-action=close-map]")?.focus(); }
  else if (action === "close-map") { state.mapExpanded = false; document.body.classList.remove("map-open"); render(); $("[data-action=expand-map]")?.focus(); }
  else if (action === "clear-section") { state.section = "All sections"; state.block = "All blocks"; render(); }
  else if (action === "class-filter") { state.classFilter = button.dataset.filter; render(); }
  else if (action === "clear-filters") { state.section = "All sections"; state.block = "All blocks"; state.classFilter = "all"; state.minPrice = 0; state.maxPrice = 2000; state.quantity = 2; render(); }
  else if (action === "choose-listing") { state.listing = currentEvent().listings.find(item => item.id === button.dataset.id) || null; setStep(2); }
  else if (action === "step") {
    if (Number(button.dataset.step) === 3 && state.step !== 3) { state.checkoutModalOpen = true; state.checkoutLocking = false; render(); }
    else setStep(Number(button.dataset.step));
  }
  else if (action === "begin-checkout") { state.checkoutModalOpen = true; state.checkoutLocking = false; render(); }
  else if (action === "start-checkout") startCheckoutHold();
  else if (action === "cancel-checkout") { state.checkoutModalOpen = false; state.checkoutLocking = false; render(); }
  else if (action === "payment-method") { state.paymentMethod = button.dataset.method; render(); }
  else if (action === "leave-checkout") { stopCheckoutTimer(); state.step = 2; render(); }
  else if (action === "sell") { navigateToPage("sell"); }
  else if (action === "account") { state.mapExpanded = false; navigateToPage("account"); }
  else if (action === "history") { state.mapExpanded = false; navigateToPage("account"); requestAnimationFrame(() => $("#ticket-history")?.scrollIntoView({ behavior: "smooth", block: "center" })); }
  else if (action === "admin") { state.mapExpanded = false; navigateToPage("admin"); }
  else if (action === "go-back") returnToPreviousPage();
  else if (action === "go-home") { resetPageHistory(); state.page = "home"; state.sellDraft = null; state.step = 1; state.listing = null; state.receipt = null; state.section = "All sections"; state.block = "All blocks"; state.mapExpanded = false; document.body.classList.remove("map-open"); render(); }
  else if (action === "toggle-all-shows") { state.showAllEvents = !state.showAllEvents; render(); $("#shows")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  else if (action === "remove-listing") {
    const listingId = button.dataset.id;
    saveSellerListings(getSellerListings().filter(item => item.id !== listingId));
    restoreSellerListings(); state.toast = "Your listing has been removed."; render();
  }
  else if (action === "open-account-booking") {
    state.booking = getBookings().find(item => String(item.id || item.bookingId) === button.dataset.id) || null;
    state.bookingId = state.booking?.id || state.booking?.bookingId || "";
    resetPageHistory(); state.step = 4; render();
    $("#booking-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  else if (action === "manage") { event.preventDefault(); resetPageHistory(); state.booking = null; setStep(4); }
  else if (action === "show-booking") { resetPageHistory(); state.bookingId = state.receipt?.id || ""; state.booking = state.receipt; setStep(4); }
  else if (action === "new-search") { resetPageHistory(); state.listing = null; state.receipt = null; state.section = "All sections"; state.block = "All blocks"; setStep(1); }
  else if (action === "cancel-booking") await cancelBooking();
  else if (action === "resell-booking") {
    const booking = state.booking;
    const eventInfo = bookingEvent(booking);
    if (!booking || !eventInfo) { toast("Could not open a resale form for this booking."); return; }
    const quantity = Math.max(1, Number(booking.quantity || 1));
    const profile = getMemberProfile();
    const rawSeats = Array.isArray(booking.seats) ? booking.seats.join(", ") : String(booking.seats || booking.seatNumbers || booking.listingSnapshot?.seats || "");
    state.sellDraft = {
      bookingId: String(booking.id || booking.bookingId || state.bookingId),
      bookingEventId: eventInfo.id,
      eventId: eventInfo.id,
      section: booking.section || booking.listingSnapshot?.section || eventInfo.sections?.[0],
      row: booking.row || booking.listingSnapshot?.row || "A",
      seats: rawSeats.replace(/^Seats\s*/i, ""),
      quantity,
      price: booking.listingSnapshot?.price || Math.max(1, Math.round(Number(booking.total || 0) / quantity)) || "",
      sellerName: profile.name || booking.customerName || booking.name || "",
      sellerEmail: profile.email || booking.email || ""
    };
    navigateToPage("sell");
  }
  else if (action === "dismiss") { state.toast = ""; render(); }
  else if (action === "map-help") toast(`Select a ${currentEvent().venue} zone to filter this show’s sample listings. The map is schematic; check the event organizer for the final seat plan.`);
  else if (action === "toggle-search") { state.searchOpen = !state.searchOpen; render(); if (state.searchOpen) $('[name="eventSearch"]')?.focus(); }
  else if (action === "scroll-market") { event.preventDefault(); $("#market")?.scrollIntoView({ behavior: "smooth" }); }
});

root.addEventListener("keydown", event => {
  if (state.mapExpanded && event.key === "Escape") { state.mapExpanded = false; document.body.classList.remove("map-open"); render(); $("[data-action=expand-map]")?.focus(); return; }
  const zone = event.target.closest(".seat-zone");
  if (zone && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); zone.click(); }
});root.addEventListener("change", event => {
  const target = event.target;
  if (target.dataset.change === "area") {
    if (target.value === "all") { state.section = "All sections"; state.block = "All blocks"; }
    else if (target.value.startsWith("area::")) { state.section = target.value.slice(6); state.block = "All blocks"; }
    else if (target.value.startsWith("block::")) {
      const block = venueMapBlocks(currentEvent().venueKey).find(item => item.key === target.value.slice(7));
      state.section = block?.area || "All sections";
      state.block = block?.key || "All blocks";
    }
    render();
    return;
  }
  if (target.dataset.change === "concert") {
    const concert = concertGroups().find(item => concertGroupKey(item) === target.value);
    if (concert) selectShowForTickets(concertGroup(concert)[0]);
    return;
  }
  if (target.dataset.change === "date") {
    selectShowForTickets(state.events.find(item => item.id === target.value));
    return;
  }
  if (target.dataset.change === "sell-concert") {
    captureSellDraft();
    const nextShow = state.events.find(item => concertGroupKey(item) === target.value && (item.resaleAllowed !== false || (state.sellDraft?.bookingId && item.id === state.sellDraft.bookingEventId)));
    if (nextShow) state.sellDraft = { ...state.sellDraft, concertKey: target.value, eventId: nextShow.id };
    render();
    return;
  }
  if (target.dataset.change === "sell-event") {
    captureSellDraft();
    const show = state.events.find(item => item.id === target.value);
    if (show) state.sellDraft = { ...state.sellDraft, concertKey: concertGroupKey(show), eventId: show.id };
    render();
    return;
  }
  if (target.dataset.change === "quantity") state.quantity = Number(target.value);
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
  else if (target.name === "adminOrderId") state.adminQuery = target.value;
});
root.addEventListener("submit", async event => {
  if (event.target.id === "checkout-form") { event.preventDefault(); await submitBooking(); }
  else if (event.target.id === "lookup-form") { event.preventDefault(); await findBooking(); }
  else if (event.target.id === "admin-lookup-form") { event.preventDefault(); await findAdminOrder(); }
  else if (event.target.id === "sell-form") { event.preventDefault(); publishListing(event.target); }
  else if (event.target.id === "profile-form") { event.preventDefault(); saveProfile(event.target); }
});

async function submitBooking() {
  if (!state.key || !state.listing) return;
  if (!state.paymentMethod) { toast("Choose a payment method to continue."); return; }
  if (!state.checkoutDeadline || Date.now() >= state.checkoutDeadline) { expireCheckoutHold(); return; }
  const event = currentEvent();
  const payload = { eventId: event.id, eventName: event.name, venue: event.venue, date: event.date, time: event.time, section: state.listing.section, row: state.listing.row, ticketType: state.listing.badges.join(", "), listingId: state.listing.id, quantity: selectedCount(), customerName: state.name.trim(), email: state.email.trim(), paymentMethod: state.paymentMethod, total: state.listing.price * selectedCount() };
  try {
    let booking;
    if (DEMO_MODE) {
      booking = { id: uuid(), status: "confirmed", ...payload, listingSnapshot: state.listing, createdAt: new Date().toISOString() };
      localStorage.setItem("echo-ticket-orders", JSON.stringify([booking, ...getBookings()]));
      const currentListing = event.listings.find(item => item.id === state.listing.id);
      if (currentListing?.sellerListing && currentListing.qty > selectedCount()) {
        currentListing.qty -= selectedCount();
        saveSellerListings(getSellerListings().map(item => item.id === currentListing.id ? { ...item, qty: currentListing.qty } : item));
      } else {
        event.listings = event.listings.filter(item => item.id !== state.listing.id);
        if (currentListing?.sellerListing) saveSellerListings(getSellerListings().filter(item => item.id !== currentListing.id));
      }
    } else booking = await request("/bookings", { method: "POST", headers: { "Idempotency-Key": state.key }, body: JSON.stringify(payload) });
    state.receipt = { ...booking, id: booking.id || booking.bookingId || booking.booking_id, status: booking.status || "confirmed" };
    stopCheckoutTimer();
    state.bookingId = state.receipt.id || "";
    toast("You're booked. Your e-ticket is ready.");
  } catch (error) {
    if (error.status === 409) {
      stopCheckoutTimer();
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

async function findAdminOrder() {
  const id = state.adminQuery.trim();
  if (!id) return;
  state.adminBusy = true; state.adminError = ""; state.adminOrder = null; render();
  try {
    if (DEMO_MODE) {
      const booking = getBookings().find(item => String(item.id || item.bookingId || "").toLowerCase() === id.toLowerCase());
      if (!booking) throw new Error("No matching order was found in this browser’s demo data.");
      state.adminOrder = { booking, audit: null, source: "local-demo" };
    } else {
      const data = await request(`/admin/orders/${encodeURIComponent(id)}/audit`);
      const booking = data.booking || data.order || data;
      const audit = data.seatReleaseAudit || data.seat_release_audit || data.releaseAudit || data.audit || null;
      state.adminOrder = { booking, audit, source: "api" };
    }
  } catch (error) {
    state.adminError = error.status === 404 ? "No order or seat audit was found for that booking ID." : (error.message || "Order lookup failed. Please try again.");
  }
  state.adminBusy = false; render();
}

async function cancelBooking() {
  const id = state.booking?.id || state.booking?.bookingId || state.bookingId.trim();
  if (!id || !state.booking) return;
  const daysUntil = bookingDaysUntilEvent(state.booking);
  if (daysUntil !== null && daysUntil < 14) {
    toast(daysUntil < 0 ? "This event has already taken place." : "Bookings can only be cancelled until 14 days before the event. Please resell your tickets instead.");
    return;
  }
  state.cancelBusy = true; render();
  try {
    let result;
    if (DEMO_MODE) {
      const saved = getBookings().map(item => item.id === id ? { ...item, status: "cancelled" } : item);
      localStorage.setItem("echo-ticket-orders", JSON.stringify(saved)); result = saved.find(item => item.id === id);
      const ownerEvent = state.events.find(item => item.id === result?.eventId);
      if (ownerEvent && result?.listingSnapshot) {
        const snapshot = result.listingSnapshot;
        const current = ownerEvent.listings.find(item => item.id === snapshot.id);
        if (snapshot.sellerListing) {
          const restoredQty = Number(result.quantity || 1);
          if (current) current.qty += restoredQty;
          else ownerEvent.listings.push({ ...snapshot, qty: restoredQty });
          const saved = getSellerListings();
          const stored = saved.find(item => item.id === snapshot.id);
          if (stored) stored.qty += restoredQty;
          else saved.push({ ...snapshot, qty: restoredQty });
          saveSellerListings(saved);
        } else if (!current) ownerEvent.listings.push(snapshot);
      }
    } else result = await request(`/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.booking = { ...state.booking, ...result, status: result?.status || "cancelled" };
    state.toast = "Your booking has been cancelled.";
  } catch (error) { state.toast = error.message || "Cancellation failed. Please try again."; }
  state.cancelBusy = false; render();
}

restoreSellerListings();
render();
loadEvents();
