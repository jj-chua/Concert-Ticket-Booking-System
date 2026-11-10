/* ECHO LIVE: concert ticket marketplace prototype, built with vanilla JavaScript. */
const API_BASE = (window.EVENT_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_MODE = !API_BASE;
const VENUE_SECTIONS = {
  "arena-stars": ["VVIP", "VIP", "PS1", "PS2", "PS3", "PS4"],
  "unifi-arena": ["VVIP", "VIP", "PS1", "PS2", "PS3", "PS4", "GA"],
  "tm-stadium-nasional": ["FLOOR A", "FLOOR B", "FLOOR C", "CAT 1", "CAT 2", "CAT 3", "CAT 4", "CAT 5", "CAT 6", "CAT 7", "CAT 8", "CAT 9"],
};
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
    const price = Math.max(168, priceTop - index * 95);
    const standing = section === "GA" || section.startsWith("FLOOR");
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
  makeUpcomingShow({ id: "westlife-unifi-2027-01-13", name: "Westlife", tour: "25 · THE ANNIVERSARY WORLD TOUR", date: "JAN 13, 2027", isoDate: "2027-01-13", venueKey: "unifi-arena", venue: "Axiata Arena", time: "Time TBC", state: "ON SALE", tag: "NEW SHOW ADDED", accent: "unifi", image: "https://networksites.livenationinternational.com/networksites/kmdmeh2j/westlife-kl-2027_1080x1350_vip_added-show.png?format=webp&quality=75&width=1920", imageAlt: "Westlife 25 anniversary tour Kuala Lumpur poster", source: "https://www.livenation.my/event/westlife-25-the-anniversary-world-tour-kuala-lumpur-tickets-edp1686551", priceTop: 798, sections: ["VVIP", "VIP", "PS1", "PS2", "PS3", "PS4"] }),
  makeUpcomingShow({ id: "westlife-unifi-2027-01-14", name: "Westlife", tour: "25 · THE ANNIVERSARY WORLD TOUR", date: "JAN 14, 2027", isoDate: "2027-01-14", venueKey: "unifi-arena", venue: "Axiata Arena", time: "Time TBC", state: "ON SALE", tag: "AXIATA ARENA", accent: "unifi", image: "https://networksites.livenationinternational.com/networksites/kmdmeh2j/westlife-kl-2027_1080x1350_vip_added-show.png?format=webp&quality=75&width=1920", imageAlt: "Westlife 25 anniversary tour Kuala Lumpur poster", source: "https://www.livenation.my/event/westlife-25-the-anniversary-world-tour-kuala-lumpur-tickets-edp1686551", priceTop: 798, sections: ["VVIP", "VIP", "PS1", "PS2", "PS3", "PS4"] })
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
const state = { page: "home", pageHistory: ["home"], sellDraft: null, step: 1, events: EVENTS, eventId: "priscilla-abby-genting-2026", section: "All sections", classFilter: "all", quantity: 2, sort: "recommended", minPrice: 0, maxPrice: 2000, listing: null, key: "", name: "", email: "", receipt: null, bookingId: "", booking: null, lookupBusy: false, cancelBusy: false, adminQuery: "", adminOrder: null, adminBusy: false, adminError: "", refreshing: false, toast: "", searchTerm: "", showAllEvents: false, searchOpen: false, locationFilter: "all", locationOpen: false, mapExpanded: false };
const root = $("#root");
const currentEvent = () => state.events.find(item => item.id === state.eventId) || EVENTS[0];
const selectedCount = () => Number(state.quantity || 2);
function captureSellDraft() {
  const form = $("#sell-form", root);
  if (form) state.sellDraft = Object.fromEntries(new FormData(form).entries());
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
  if (state.classFilter === "premium") list = list.filter(item => ["VVIP", "VIP"].includes(item.section));
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
  return shownEvents.map(event => `<button class="event-card ${event.id === state.eventId ? "event-card-active" : ""}" data-action="event" data-id="${esc(event.id)}">${posterImage(event, "event-card-poster")}<div class="event-card-info"><div class="event-date">${esc(event.date)}</div><h3>${esc(event.name)}</h3><p>${esc(event.venue)} · ${esc(event.city)}</p><span class="event-sale ${event.state === "SOLD OUT" ? "is-sold-out" : ""}">${esc(event.state)}</span></div></button>`).join("");
}

function updateEventSearch() {
  const strip = $(".event-strip");
  if (!strip) return;
  strip.innerHTML = eventCards();
}

function concertOptions(selectedId) {
  return state.events.filter(item => state.locationFilter === "all" || item.venueKey === state.locationFilter)
    .map(item => `<option value="${esc(item.id)}" ${item.id === selectedId ? "selected" : ""}>${esc(item.name)} · ${esc(item.date)}</option>`).join("");
}
const ARENA_ZONES = {
  VVIP: { label: [260, 107], paths: ["M211 88 Q260 77 309 88 L302 128 Q260 119 218 128 Z"] },
  VIP: { label: [175, 120], paths: ["M145 96 Q174 83 203 89 L213 130 Q180 138 153 156 Z", "M375 96 Q346 83 317 89 L307 130 Q340 138 367 156 Z"] },
  PS1: { label: [194, 166], paths: ["M161 148 Q187 132 218 132 L230 178 Q198 183 174 199 Z", "M359 148 Q333 132 302 132 L290 178 Q322 183 346 199 Z"] },
  PS2: { label: [260, 205], paths: ["M185 190 Q260 174 335 190 L350 229 Q260 216 170 229 Z"] },
  PS3: { label: [143, 203], paths: ["M105 183 Q132 164 158 158 L173 207 Q145 220 122 240 Z", "M415 183 Q388 164 362 158 L347 207 Q375 220 398 240 Z"] },
  PS4: { label: [260, 253], paths: ["M75 233 Q101 213 119 208 L136 256 Q116 275 95 286 Z", "M445 233 Q419 213 401 208 L384 256 Q404 275 425 286 Z", "M145 244 Q260 223 375 244 L389 281 Q260 263 131 281 Z"] },
};
const UNIFI_ZONES = {
  VVIP: { label: [350, 153], paths: ["M289 127 L411 127 L431 169 L269 169 Z"] },
  VIP: { label: [350, 193], paths: ["M270 174 L430 174 L440 212 L260 212 Z"] },
  PS1: { label: [178, 184], paths: ["M117 148 L247 169 L236 216 L110 199 Z", "M583 148 L453 169 L464 216 L590 199 Z"] },
  PS2: { label: [350, 323], paths: ["M221 284 Q350 307 479 284 L469 331 Q350 352 231 331 Z"] },
  PS3: { label: [178, 116], paths: ["M112 111 Q150 73 212 73 L258 116 L245 155 L116 135 Z", "M588 111 Q550 73 488 73 L442 116 L455 155 L584 135 Z"] },
  PS4: { label: [164, 253], paths: ["M101 211 L226 230 L215 281 Q154 290 105 258 Z", "M599 211 L474 230 L485 281 Q546 290 595 258 Z"] },
  GA: { label: [350, 245], paths: ["M264 217 L436 217 L445 274 L255 274 Z"] },
};
const STADIUM_ZONES = {
  "FLOOR A": { label: [278, 256], paths: ["M232 216 L313 216 L313 295 L232 295 Z"] },
  "FLOOR B": { label: [380, 256], paths: ["M318 216 L442 216 L442 295 L318 295 Z"] },
  "FLOOR C": { label: [482, 256], paths: ["M447 216 L528 216 L528 295 L447 295 Z"] },
  "CAT 1": { label: [176, 158], paths: ["M106 220 C102 159 146 111 220 82 L249 127 C198 148 165 180 161 222 Z"] },
  "CAT 2": { label: [584, 158], paths: ["M654 220 C658 159 614 111 540 82 L511 127 C562 148 595 180 599 222 Z"] },
  "CAT 3": { label: [303, 80], paths: ["M224 80 C270 53 325 42 372 42 L372 94 C324 94 282 105 251 127 Z"] },
  "CAT 4": { label: [457, 80], paths: ["M536 80 C490 53 435 42 388 42 L388 94 C436 94 478 105 509 127 Z"] },
  "CAT 5": { label: [380, 380], paths: ["M247 365 C290 393 337 408 380 408 C423 408 470 393 513 365 L480 326 C448 348 416 361 380 361 C344 361 312 348 280 326 Z"] },
  "CAT 6": { label: [140, 286], paths: ["M102 229 C106 277 129 319 166 350 L213 315 C185 291 169 259 165 226 Z"] },
  "CAT 7": { label: [620, 286], paths: ["M658 229 C654 277 631 319 594 350 L547 315 C575 291 591 259 595 226 Z"] },
  "CAT 8": { label: [222, 358], paths: ["M169 353 C195 374 218 389 246 399 L273 350 L220 319 Z"] },
  "CAT 9": { label: [538, 358], paths: ["M591 353 C565 374 542 389 514 399 L487 350 L540 319 Z"] },
};

function sectionMap() {
  const event = currentEvent();
  if (event.venueKey === "unifi-arena") return unifiArenaMap(event);
  if (event.venueKey === "tm-stadium-nasional") return nationalStadiumMap(event);
  return `<div class="venue-map arena-map"><svg class="arena-map-svg" viewBox="0 0 520 330" role="group" aria-label="Interactive Arena of Stars venue map"><defs><linearGradient id="arena-stage" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#312039"/><stop offset=".5" stop-color="#8055aa"/><stop offset="1" stop-color="#312039"/></linearGradient></defs><path class="arena-bowl" d="M59 100 Q260 12 461 100 L490 288 Q260 344 30 288 Z"/><path class="arena-row" d="M90 126 Q260 45 430 126M73 167 Q260 92 447 167M56 211 Q260 143 464 211M43 255 Q260 196 477 255"/><g class="stage-block"><path d="M168 26 Q260 16 352 26 L342 67 Q260 60 178 67 Z"/><text x="260" y="50" text-anchor="middle">STAGE</text></g>${Object.entries(ARENA_ZONES).map(([name]) => mapSection(name)).join("")}<g class="arena-gates"><text x="92" y="311">GATE A</text><text x="260" y="311">GATE B</text><text x="428" y="311">GATE C</text></g></svg><div class="map-footnote">Arena of Stars · illustrative zone map</div></div>`;
}

function mapZoneButton(name, zone, event = currentEvent()) {
  const active = state.section === name;
  const available = event.listings?.some(item => item.section === name);
  const status = available ? "Sample tickets listed" : "No sample listings";
  return `<g class="seat-zone ${active ? "zone-active" : ""} ${available ? "zone-available" : "zone-empty"}" data-action="section" data-section="${esc(name)}" role="button" tabindex="0" aria-pressed="${active}" aria-label="${esc(name)}, ${status}"><title>${esc(name)} · ${status}</title>${zone.paths.map(path => `<path d="${path}"/>`).join("")}<text x="${zone.label[0]}" y="${zone.label[1]}" text-anchor="middle">${esc(name)}</text></g>`;
}

function mapSection(name) {
  return mapZoneButton(name, ARENA_ZONES[name]);
}

function unifiArenaMap(event) {
  const zones = Object.keys(UNIFI_ZONES).filter(name => event.sections.includes(name)).map(name => mapZoneButton(name, UNIFI_ZONES[name], event)).join("");
  return `<div class="venue-map arena-map unifi-map"><svg class="arena-map-svg" viewBox="0 0 700 410" role="group" aria-label="Interactive Axiata Arena concert seating map"><rect class="unifi-bowl" x="65" y="61" width="570" height="306" rx="132"/><rect class="unifi-ring" x="95" y="84" width="510" height="260" rx="112"/><rect class="unifi-floor" x="222" y="184" width="256" height="123" rx="9"/><path class="unifi-centerline" d="M222 245H478"/><g class="unifi-stage"><path d="M290 45h120v28H290z"/><text x="350" y="64" text-anchor="middle">STAGE</text></g><g class="unifi-sections">${zones}</g><text class="unifi-floor-label" x="350" y="298" text-anchor="middle">INDOOR ARENA FLOOR</text></svg><div class="map-footnote">Axiata Arena · compact indoor bowl · schematic concert layout</div></div>`;
}

function nationalStadiumMap(event) {
  const zones = Object.keys(STADIUM_ZONES).filter(name => event.sections.includes(name)).map(name => mapZoneButton(name, STADIUM_ZONES[name], event)).join("");
  const stageMarkup = event.stageLayout === "360" ? `<g class="stadium-stage stadium-stage-360"><circle cx="380" cy="239" r="28"/><text x="380" y="243" text-anchor="middle">360°</text></g>` : `<g class="stadium-stage"><path d="M330 151h100v28H330z"/><text x="380" y="170" text-anchor="middle">STAGE</text></g>`;
  return `<div class="venue-map arena-map national-map"><svg class="arena-map-svg" viewBox="0 0 760 470" role="group" aria-label="Interactive TM Stadium Nasional Bukit Jalil three-tier seating map"><ellipse class="stadium-outline" cx="380" cy="237" rx="347" ry="211"/><ellipse class="stadium-tier stadium-tier-outer" cx="380" cy="237" rx="315" ry="184"/><ellipse class="stadium-tier stadium-tier-mid" cx="380" cy="237" rx="277" ry="153"/><ellipse class="stadium-track" cx="380" cy="237" rx="232" ry="120"/><rect class="stadium-field" x="199" y="164" width="362" height="151" rx="7"/><path class="stadium-field-lines" d="M199 239.5H561M380 164V315"/><circle class="stadium-field-lines" cx="380" cy="239" r="30"/><g class="stadium-zones">${zones}</g>${stageMarkup}<text class="stadium-level level-one" x="380" y="103" text-anchor="middle">LEVEL 1</text><text class="stadium-level level-two" x="380" y="71" text-anchor="middle">LEVEL 2</text><text class="stadium-level level-three" x="380" y="42" text-anchor="middle">LEVEL 3</text><g class="stadium-gates"><text x="95" y="408">GATE A</text><text x="380" y="430">GATE B</text><text x="665" y="408">GATE C</text></g></svg><div class="map-footnote">TM Stadium Nasional · 3-tier outdoor oval · schematic concert layout</div></div>`;
}
function listingCard(item, index) {
  const estimated = item.price * selectedCount();
  return `<article class="ticket-listing"><div class="deal-stamp ${index === 0 ? "best-deal" : ""}">${index === 0 ? "GREAT VALUE" : esc(item.badges[0] || "AVAILABLE")}</div><div class="ticket-main"><div class="ticket-section-line"><h3>${esc(item.section)}</h3><span class="ticket-type-pill">${item.badges.some(b => b.includes("Standing")) ? "Standing" : "Seated"}</span></div><p class="ticket-row">${item.row === "GA" ? "General admission" : `Row ${esc(item.row)} · ${esc(item.seats)}`}</p><div class="ticket-perks">${item.badges.map(badge => `<span>✓ ${esc(badge)}</span>`).join("")}</div></div><div class="ticket-stock"><strong>${item.qty} tickets</strong><span>together</span></div><div class="ticket-price"><strong>${money(item.price)}</strong><span>per ticket</span><small>${money(estimated)} total</small></div><button class="primary-btn ticket-cta" data-action="choose-listing" data-id="${esc(item.id)}">See tickets <span>→</span></button></article>`;
}

function listingPanel(event) {
  const listings = getListings();
  const sectionOptions = ["All sections", ...(event.sections || VENUE_SECTIONS[event.venueKey] || VENUE_SECTIONS["arena-stars"])].map(section => `<option value="${esc(section)}" ${state.section === section ? "selected" : ""}>${esc(section)}</option>`).join("");
  const filters = TIERS.map(item => `<button class="filter-chip ${state.classFilter === item.id ? "filter-active" : ""}" data-action="class-filter" data-filter="${item.id}">${item.name}</button>`).join("");
  return `<div class="market-grid"><section class="map-card ${state.mapExpanded ? "map-card-expanded" : ""}" role="${state.mapExpanded ? "dialog" : "region"}" aria-modal="${state.mapExpanded}" aria-label="${esc(event.venue)} ticket zones"><div class="card-heading"><div><span class="section-kicker">${esc(event.venue.toUpperCase())}</span><h2>Choose your zone</h2></div><button class="map-help" data-action="${state.mapExpanded ? "close-map" : "map-help"}" aria-label="${state.mapExpanded ? "Close map" : "Map information"}">${state.mapExpanded ? "×" : "?"}</button></div>${sectionMap()}<div class="map-legend"><span><i class="legend-dot dot-available"></i>Demo marketplace listings shown</span><span><i class="legend-dot dot-selected"></i>Selected zone</span><span><i class="legend-dot dot-none"></i>No sample listings</span></div>${!state.mapExpanded ? `<button class="clear-section map-expand-button" data-action="expand-map">Zoom in</button>` : ""}</section><button class="map-backdrop" data-action="close-map" aria-label="Close expanded venue map" ${state.mapExpanded ? "" : "hidden"}></button><section class="listings-column"><div class="listings-toolbar"><div><span class="section-kicker">${esc(event.name.toUpperCase())} · ${esc(event.venue.toUpperCase())}</span><h2>Tickets for this show</h2><p>${listings.length} demo listings · Prices shown per ticket</p></div><a class="official-link" href="${esc(event.source)}" target="_blank" rel="noopener">Official event info ↗</a></div><div class="filter-panel"><div class="filter-row"><label class="quantity-filter"><span>Tickets</span><select data-change="quantity">${[1,2,3,4,5,6].map(n => `<option ${n === selectedCount() ? "selected" : ""}>${n}</option>`).join("")}</select></label><label class="section-filter"><span>Section</span><select data-change="section">${sectionOptions}</select></label><label class="sort-filter"><span>Sort by</span><select data-change="sort"><option value="recommended" ${state.sort === "recommended" ? "selected" : ""}>Recommended</option><option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option><option value="best" ${state.sort === "best" ? "selected" : ""}>Best view</option></select></label></div><div class="filter-chips">${filters}</div><div class="price-filter"><label>Price per ticket <strong>${money(state.minPrice)} – ${money(state.maxPrice)}</strong></label><div><input aria-label="Minimum price" type="range" min="0" max="2000" step="25" value="${state.minPrice}" data-change="min-price"><input aria-label="Maximum price" type="range" min="100" max="2000" step="25" value="${state.maxPrice}" data-change="max-price"></div></div></div><div class="demo-notice"><span>i</span><p><strong>Sample marketplace listings</strong> — prices and availability here are demo data. Connect your ticket inventory API to show live offers.</p></div><div class="listing-header"><strong>${listings.length} listings</strong><span>Price includes estimated fees</span></div><div class="listing-results">${listings.length ? listings.map(listingCard).join("") : `<div class="empty-listings"><strong>No tickets match these filters.</strong><span>Try another section or ticket type.</span><button data-action="clear-filters">Clear filters</button></div>`}</div></section></div>`;
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

function sellView() {
  const profile = getMemberProfile();
  const sellableShows = state.events.filter(event => event.resaleAllowed !== false);
  const selectedShow = sellableShows.find(event => event.id === (state.sellDraft?.eventId || state.eventId)) || sellableShows[0] || currentEvent();
  const events = sellableShows.map(event => `<option value="${esc(event.id)}" ${event.id === selectedShow.id ? "selected" : ""}>${esc(event.name)} · ${esc(event.date)}</option>`).join("");
  const draft = state.sellDraft || {};
  const selectedSection = selectedShow.sections.includes(draft.section) ? draft.section : selectedShow.sections[0];
  const sections = selectedShow.sections.map(section => `<option value="${esc(section)}" ${section === selectedSection ? "selected" : ""}>${esc(section)}</option>`).join("");
  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(row => `<option ${row === draft.row ? "selected" : ""}>${row}</option>`).join("");
  return `<section class="sell-page"><div class="page-heading-layout">${backButton("go-home")}<div class="page-heading"><span class="section-kicker">SELL ON ECHO LIVE</span><h1>Make someone’s night.</h1><p>List your tickets for ${esc(selectedShow.venue)}.</p></div></div><div class="sell-layout"><form id="sell-form" class="sell-form"><div class="form-section-title"><span>01</span><div><h2>Ticket details</h2><p>Tell fans what you’re selling.</p></div></div><label>Concert<select name="eventId" data-change="sell-event" required>${events}</select></label><div class="form-fields-two"><label>Section<select name="section" required>${sections}</select></label><label>Row<select name="row" required>${rows}</select></label></div><div class="form-fields-two"><label>Seat numbers<input name="seats" value="${esc(draft.seats || "")}" required maxlength="30" placeholder="e.g. 5–6" autocomplete="off"></label><label>Quantity<input name="quantity" type="number" min="1" max="6" step="1" value="${esc(draft.quantity || "2")}" required></label></div><label>Price per ticket (RM)<input name="price" type="number" min="1" max="2000" step="1" value="${esc(draft.price || "")}" placeholder="e.g. 350" required></label><div class="form-section-title seller-contact-title"><span>02</span><div><h2>Seller contact</h2><p>Buyers won’t see your details on the listing.</p></div></div><label>Your name<input name="sellerName" value="${esc(draft.sellerName || profile.name)}" maxlength="80" required autocomplete="name"></label><label>Email address<input name="sellerEmail" type="email" value="${esc(draft.sellerEmail || profile.email)}" maxlength="120" required autocomplete="email" placeholder="you@example.com"></label><div class="local-save-note"><span>✓</span><p><strong>Instant demo listing</strong><br>Your ticket will appear in the marketplace and be saved on this device.</p></div><button class="primary-btn publish-button" type="submit">Publish tickets</button></form><aside class="sell-side-card"><span class="section-kicker">HOW IT WORKS</span><h2>List in a few steps.</h2><ol><li><span>1</span><div><strong>Add your seat details</strong><small>Choose the concert, section, row and seats.</small></div></li><li><span>2</span><div><strong>Set your asking price</strong><small>Enter a price for each ticket.</small></div></li><li><span>3</span><div><strong>Publish to the marketplace</strong><small>Your offer becomes available to fans right away.</small></div></li></ol><p class="sell-side-footnote">Demo listings stay in this browser’s local storage.</p></aside></div></section>`;
}

function accountView() {
  const profile = getMemberProfile();
  const bookings = getBookings();
  const listings = getSellerListings();
  const initials = (profile.name || "E").trim().split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = new Date(profile.joinedAt || Date.now()).toLocaleDateString("en-MY", { month: "short", year: "numeric" });
  const bookingRows = bookings.length ? bookings.slice(0, 5).map(booking => `<article class="account-data-row"><div><strong>${esc(booking.eventName || booking.event || "Live event")}</strong><small>${esc(booking.date || "Date pending")} · ${esc(booking.section || "Tickets")} · ${Number(booking.quantity || 0)} ticket(s)</small></div><span class="booking-status ${["cancelled", "canceled"].includes(String(booking.status).toLowerCase()) ? "cancelled" : ""}">${esc(String(booking.status || "confirmed").toUpperCase())}</span><button class="account-inline-action" data-action="open-account-booking" data-id="${esc(booking.id || booking.bookingId || "")}">Details</button></article>`).join("") : `<div class="account-empty">No bookings yet. Your ticket purchases will appear here.</div>`;
  const listingRows = listings.length ? listings.map(listing => { const event = state.events.find(item => item.id === listing.eventId); return `<article class="account-data-row"><div><strong>${esc(event?.name || listing.eventName || "Live event")}</strong><small>${esc(listing.section)} · Row ${esc(listing.row)} · ${esc(listing.seats)} · ${Number(listing.qty)} available</small></div><strong class="account-listing-price">${money(listing.price)} <small>each</small></strong><button class="account-inline-action remove-listing-action" data-action="remove-listing" data-id="${esc(listing.id)}">Remove</button></article>`; }).join("") : `<div class="account-empty">No active listings. Use Sell to offer tickets to other fans.</div>`;
  return `<section class="account-page"><div class="page-heading-layout">${backButton("go-home")}<div class="page-heading"><span class="section-kicker">YOUR ECHO LIVE ACCOUNT</span><h1>Profile &amp; activity</h1><p>Keep your contact details and ticket activity together.</p></div></div><div class="account-grid"><article class="profile-card"><div class="profile-identity"><div class="profile-avatar">${esc(initials || "EL")}</div><div><span class="section-kicker">LOCAL DEMO PROFILE</span><h2>${esc(profile.name || "Echo Live Member")}</h2><p>Member since ${esc(memberSince)}</p></div></div><form id="profile-form" class="profile-form"><label>Full name<input name="profileName" value="${esc(profile.name || "")}" maxlength="80" required autocomplete="name"></label><label>Email address<input name="profileEmail" type="email" value="${esc(profile.email || "")}" maxlength="120" autocomplete="email" placeholder="Add your email"></label><label>Phone number<input name="profilePhone" type="tel" value="${esc(profile.phone || "")}" maxlength="30" autocomplete="tel" placeholder="Add your phone number"></label><label>Region<input name="profileRegion" value="${esc(profile.region || "Malaysia")}" maxlength="60" autocomplete="country-name"></label><button class="primary-btn" type="submit">Save profile</button></form><p class="local-profile-note">Your profile is stored on this device for this demo.</p></article><div class="account-activity"><article class="account-panel"><div class="account-panel-heading"><div><span class="section-kicker">TICKET HISTORY</span><h2>Your bookings</h2></div><button class="account-inline-action" data-action="manage">Booking lookup</button></div>${bookingRows}</article><article class="account-panel"><div class="account-panel-heading"><div><span class="section-kicker">SELLER DASHBOARD</span><h2>Your listings</h2></div><button class="account-inline-action" data-action="sell">Add tickets</button></div>${listingRows}</article></div></div></section>`;
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
  return `<section class="admin-page">${backButton()}<div class="page-heading"><span class="section-kicker">ECHO LIVE OPERATIONS</span><h1>Booking &amp; seat audit</h1><p>Look up an order, review its payment or timeout status, and check the seat-pool release record.</p></div><div class="admin-demo-warning"><strong>${DEMO_MODE ? "Local demo mode" : "Admin API connected"}</strong><span>${DEMO_MODE ? "Orders are only visible in this browser. Seat release cannot be verified globally until the backend provides an inventory audit." : "Order lookups use the connected backend. Only authorized administrators should be allowed to call this endpoint."}</span></div><article class="admin-lookup-card"><form id="admin-lookup-form"><label for="admin-order-reference">Booking ID</label><div class="lookup-row"><input id="admin-order-reference" name="adminOrderId" value="${esc(state.adminQuery)}" placeholder="Paste a booking reference" autocomplete="off" required><button class="primary-btn" type="submit" ${state.adminBusy ? "disabled" : ""}>${state.adminBusy ? "Searching…" : "Find order"}</button></div></form>${state.adminError ? `<p class="admin-error" role="alert">${esc(state.adminError)}</p>` : ""}</article>${state.adminOrder ? adminAuditView(state.adminOrder) : `<article class="admin-empty"><span>ORDER MONITOR</span><strong>Search by booking ID</strong><p>Results include the order status, timeout details, seat assignment, and any release audit supplied by the server.</p></article>`}<article class="admin-integration-note"><span class="section-kicker">SERVER REQUIREMENT</span><h2>Automatic release needs a backend timer</h2><p>For the live flow, create an expiring seat hold when checkout begins. A server-side expiry worker should release unpaid holds even if a customer closes the page, and the admin lookup should return the release audit with the order.</p><code>GET /admin/orders/{bookingId}/audit</code></article></section>`;
}

function render() {
  const event = currentEvent();
  document.body.classList.toggle("map-open", state.mapExpanded);
  root.innerHTML = `<div class="app-shell"><header class="topbar ${state.searchOpen ? "search-open" : ""}"><a class="brand" href="#top">${logo()}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><div class="top-actions"><label class="search-box"><span>⌕</span><input name="eventSearch" value="${esc(state.searchTerm)}" placeholder="Artist, event or venue" aria-label="Search shows"></label>${locationPicker()}<button class="sell-button" data-action="sell">Sell</button><button class="account-button" data-action="account" aria-label="Account and my bookings" title="Account"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.25"></circle><circle cx="12" cy="9" r="3"></circle><path d="M6.8 18.2c.7-2.7 2.7-4.2 5.2-4.2s4.5 1.5 5.2 4.2"></path></svg></button></div><button class="mobile-search" data-action="toggle-search" aria-label="Search">⌕</button></header><main id="top"><section class="event-hero"><img class="hero-photo" src="${esc(event.image)}" alt="${esc(event.imageAlt)}" decoding="async" fetchpriority="high" onerror="this.hidden=true"><div class="hero-shade"></div><div class="hero-inner"><div class="hero-event-copy"><div class="hero-tags"><span>${esc(event.tag)}</span><span class="live-tag">LIVE MUSIC</span></div><p class="hero-kicker">${esc(event.tour)}</p><h1>${esc(event.name)}</h1><p class="hero-meta">${esc(event.date)} <i></i> ${esc(event.venue)} <i></i> ${esc(event.area)}</p><p class="hero-time">${esc(event.time)} · ${esc(event.state === "SOLD OUT" ? "Official tickets sold out" : "Demo marketplace listings shown")}</p><a class="primary-btn hero-button" href="#market">Find tickets</a></div><div class="hero-poster-wrap">${posterImage(event, "hero-poster")}<span>OFFICIAL EVENT ARTWORK</span></div></div><div class="hero-bottom"><span><i class="live-dot"></i> ECHO LIVE PICKS</span><a href="${esc(event.source)}" target="_blank" rel="noopener">Official event details ↗</a></div></section>
      <section class="discovery" id="shows"><div class="discovery-head"><div><span class="section-kicker">UP NEXT · ALL VENUES</span><h2>Find your next live moment</h2><p>Live music across Resorts World Genting and Bukit Jalil.</p></div><button class="all-shows" data-action="toggle-all-shows">${state.showAllEvents ? "Show fewer shows" : "View all shows"}</button></div><div class="event-strip">${eventCards()}</div></section>
      <section class="market-section" id="market"><div class="market-heading"><div class="market-heading-main"><label class="concert-selector"><span>Concert</span><select aria-label="Choose concert" data-change="market-event">${concertOptions(event.id)}</select></label><div class="market-heading-copy"><span class="section-kicker">TICKETS FOR ${esc(event.name.toUpperCase())}</span><h2>Pick a spot. Feel every song.</h2><p>${esc(event.date)} · ${esc(event.venue)} · ${esc(event.area)}</p></div></div><div class="event-status ${event.state === "SOLD OUT" ? "sold-out" : ""}"><i></i>${esc(event.state)}</div></div>${stepper()}${state.step === 1 ? listingPanel(event) : ""}${state.step === 2 ? reviewView(event) : ""}${state.step === 3 ? checkoutView(event) : ""}${state.step === 4 ? bookingView() : ""}</section>
    </main><footer class="site-footer" id="footer"><a class="brand footer-brand" href="#top">${logo(32)}<span class="brand-name">ECHO LIVE<small>YOUR NIGHT. YOUR WAY.</small></span></a><span>© ${new Date().getFullYear()} ECHO LIVE. All rights reserved.</span><div><a href="#footer">Help center</a><a href="#footer">Terms</a><a href="#footer">Privacy</a><button class="footer-admin-link" data-action="admin">Admin</button></div></footer>${state.toast ? `<div class="toast" role="status"><span>!</span>${esc(state.toast)}<button data-action="dismiss" aria-label="Dismiss">×</button></div>` : ""}</div>`;
  const main = $("#top", root);
  if (state.page === "sell") main.innerHTML = sellView();
  else if (state.page === "account") main.innerHTML = accountView();
  else if (state.page === "admin") main.innerHTML = adminView();}

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
  restoreSellerListings();
  render();
}

function publishListing(form) {
  const formData = new FormData(form);
  const event = state.events.find(item => item.id === formData.get("eventId"));
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  if (!event || event.resaleAllowed === false || !event.sections?.includes(String(formData.get("section"))) || quantity < 1 || quantity > 6 || price < 1 || price > 2000) { toast("Please check the ticket details and try again."); return; }
  const listing = { id: uuid(), eventId: event.id, eventName: event.name, section: String(formData.get("section")), row: String(formData.get("row")).toUpperCase(), seats: `Seats ${String(formData.get("seats")).trim()}`, qty: quantity, price, badges: ["Seller listed", "Reserved seats"], score: 7.8, sellerListing: true, sellerName: String(formData.get("sellerName")).trim(), sellerEmail: String(formData.get("sellerEmail")).trim(), createdAt: new Date().toISOString() };
  if (!saveSellerListings([...getSellerListings(), listing])) { toast(state.toast); return; }
  restoreSellerListings(); resetPageHistory(); state.sellDraft = null; state.eventId = event.id; state.step = 1; state.listing = null;
  state.section = listing.section; state.classFilter = "all"; state.quantity = Math.min(2, quantity); state.sort = "recommended"; state.minPrice = 0; state.maxPrice = 2000; state.searchTerm = ""; state.locationFilter = event.venueKey; state.locationOpen = false;
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
    state.eventId = button.dataset.id; state.section = "All sections"; state.listing = null; state.receipt = null; state.step = 1; state.locationOpen = false; render(); refreshListings();
    requestAnimationFrame(() => $("#market")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  } else if (action === "toggle-location") { state.locationOpen = !state.locationOpen; render(); }
  else if (action === "location-choice") {
    state.locationFilter = button.dataset.location; state.locationOpen = false; state.searchTerm = "";
    const matches = state.events.filter(item => state.locationFilter === "all" || item.venueKey === state.locationFilter);
    if (matches.length && !matches.some(item => item.id === state.eventId)) { state.eventId = matches[0].id; state.section = "All sections"; state.step = 1; state.listing = null; }
    render();
  } else if (action === "section") { state.section = button.dataset.section; state.mapExpanded = false; document.body.classList.remove("map-open"); render(); }
  else if (action === "expand-map") { state.section = "All sections"; state.mapExpanded = true; render(); $("[data-action=close-map]")?.focus(); }
  else if (action === "close-map") { state.mapExpanded = false; document.body.classList.remove("map-open"); render(); $("[data-action=expand-map]")?.focus(); }
  else if (action === "clear-section") { state.section = "All sections"; render(); }
  else if (action === "class-filter") { state.classFilter = button.dataset.filter; render(); }
  else if (action === "clear-filters") { state.section = "All sections"; state.classFilter = "all"; state.minPrice = 0; state.maxPrice = 2000; state.quantity = 2; render(); }
  else if (action === "choose-listing") { state.listing = currentEvent().listings.find(item => item.id === button.dataset.id) || null; setStep(2); }
  else if (action === "step") setStep(Number(button.dataset.step));
  else if (action === "begin-checkout") setStep(3);
  else if (action === "sell") { navigateToPage("sell"); }
  else if (action === "account") { state.mapExpanded = false; navigateToPage("account"); }
  else if (action === "admin") { state.mapExpanded = false; navigateToPage("admin"); }
  else if (action === "go-back") returnToPreviousPage();
  else if (action === "go-home") { resetPageHistory(); state.page = "home"; state.sellDraft = null; state.step = 1; state.listing = null; state.receipt = null; state.mapExpanded = false; document.body.classList.remove("map-open"); render(); }
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
  else if (action === "new-search") { resetPageHistory(); state.listing = null; state.receipt = null; state.section = "All sections"; setStep(1); }
  else if (action === "cancel-booking") await cancelBooking();
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
  if (target.dataset.change === "market-event") {
    const show = state.events.find(item => item.id === target.value);
    if (show) {
      state.eventId = show.id; state.section = "All sections"; state.listing = null; state.receipt = null; state.step = 1;
      state.classFilter = "all"; state.minPrice = 0; state.maxPrice = 2000; state.quantity = 2; state.sort = "recommended";
      render(); refreshListings();
      requestAnimationFrame(() => $("#market")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    return;
  }
  if (target.dataset.change === "sell-event") {
    const show = state.events.find(item => item.id === target.value);
    const sectionSelect = $('[name="section"]', root);
    if (show && sectionSelect) sectionSelect.innerHTML = show.sections.map(section => `<option value="${esc(section)}">${esc(section)}</option>`).join("");
    return;
  }
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
  const event = currentEvent();
  const payload = { eventId: event.id, eventName: event.name, venue: event.venue, date: event.date, time: event.time, section: state.listing.section, row: state.listing.row, ticketType: state.listing.badges.join(", "), listingId: state.listing.id, quantity: selectedCount(), customerName: state.name.trim(), email: state.email.trim(), total: state.listing.price * selectedCount() };
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

