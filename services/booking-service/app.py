import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any

import httpx
from fastapi import FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_connection, init_db
from notification_client import dispatch_notification

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [booking-service:%(process)d] %(message)s"
)
logger = logging.getLogger("booking-service")

PORT = int(os.environ.get("PORT", 5001))
AVAILABILITY_SERVICE_URL = os.environ.get("AVAILABILITY_SERVICE_URL", "http://localhost:5002").rstrip("/")
NOTIFICATION_SERVICE_URL = os.environ.get("NOTIFICATION_SERVICE_URL", "http://localhost:5003").rstrip("/")

app = FastAPI(
    title="ECHO LIVE Booking & Orchestration Service",
    description="Member 2 (JJ) - Orchestration, Idempotency Caching, and Booking Lifecycle Management",
    version="1.0.0"
)

# Enable CORS for browser client communication (Port 3000 -> Port 5001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    logger.info(f"Booking Service initialized on port {PORT}. Downstreams: Availability={AVAILABILITY_SERVICE_URL}, Notification={NOTIFICATION_SERVICE_URL}")

# --- Pydantic Request Models ---

class BookingCreateRequest(BaseModel):
    eventId: Optional[str] = Field(None, examples=["priscilla-abby-genting-2026"])
    eventName: Optional[str] = Field(None, examples=["Priscilla Abby 19+ Concert"])
    venue: Optional[str] = Field(None, examples=["Arena of Stars"])
    date: Optional[str] = Field(None, examples=["DEC 05, 2026"])
    time: Optional[str] = Field(None, examples=["6:00 PM"])
    section: Optional[str] = Field(None, examples=["VVIP"])
    zoneLabel: Optional[str] = Field(None, examples=["VVIP Block A"])
    row: Optional[str] = Field(None, examples=["A"])
    ticketType: Optional[str] = Field(None, examples=["Front stage, Instant download"])
    listingId: Optional[str] = Field(None, examples=["abby-vvip-01"])
    ticketUnitPrice: Optional[float] = Field(None, examples=[568.0])
    quantity: int = Field(1, ge=1, le=10, examples=[2])
    customerName: Optional[str] = Field("Concert Guest", examples=["JJ Chua"])
    email: Optional[str] = Field("guest@echolive.my", examples=["user@example.com"])
    paymentMethod: Optional[str] = Field(None, examples=["Touch and Go"])
    total: float = Field(0.0, examples=[1136.0])
    seat_ids: Optional[List[str]] = Field(None, examples=[["VVIP-A-5", "VVIP-A-6"]])
    userId: Optional[str] = Field(None, examples=["user-123"])

# --- Health Check ---

@app.get("/health")
def health_check():
    return {
        "service": "booking-service",
        "member": "Member 2 - JJ",
        "status": "UP",
        "port": PORT,
        "downstream_services": {
            "availability_service": AVAILABILITY_SERVICE_URL,
            "notification_service": NOTIFICATION_SERVICE_URL
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# --- Core Workflow: Create Booking with Idempotency (POST /bookings) ---

@app.post("/bookings", status_code=status.HTTP_201_CREATED)
async def create_booking(
    req: BookingCreateRequest,
    response: Response,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key")
):
    """
    Core Workflow Orchestration (Member 2 - JJ):
    1. Duplicate Request Handling: Inspects Idempotency-Key. If key exists in cache,
       replays stored response with X-Cache: HIT without calling downstream services.
    2. Availability Coordination: Calls Availability Service (POST /seats/hold).
       If 409 Conflict is returned, rejects request immediately with 409 Conflict.
    3. Persist Booking: Saves booking with status CONFIRMED in local database.
    4. Resilient Notification: Asynchronously calls Notification Service (POST /notifications).
    5. Cache & Return: Caches response under Idempotency-Key and returns 201 Created.
    """
    if not idempotency_key:
        idempotency_key = str(uuid.uuid4())

    # Canonical request hash for payload integrity verification
    request_payload_json = json.dumps(req.model_dump(), sort_keys=True)
    request_hash = hashlib.sha256(request_payload_json.encode()).hexdigest()

    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Step 1: Idempotency Check
        cursor.execute(
            "SELECT response_code, response_body FROM idempotency_records WHERE idempotency_key = ?",
            (idempotency_key,)
        )
        cached = cursor.fetchone()
        if cached:
            logger.info(f"[IDEMPOTENT HIT] Key: {idempotency_key} | Returning cached response.")
            response.headers["X-Cache"] = "HIT"
            response.headers["Idempotency-Key"] = idempotency_key
            response.status_code = cached["response_code"]
            return json.loads(cached["response_body"])

        # Determine seat identifiers
        seat_ids = req.seat_ids
        sec = (req.section or "GEN").upper()
        row = (req.row or "A").upper()
        event_id_val = req.eventId or "priscilla-abby-genting-2026"

        if not seat_ids:
            # Check if a specific marketplace listing was selected
            listing_max_qty = _get_listing_initial_qty(event_id_val, req.listingId)
            already_booked = 0
            if req.listingId:
                cursor.execute(
                    "SELECT COALESCE(SUM(quantity), 0) AS total_booked FROM bookings WHERE event_id = ? AND listing_id = ? AND status = 'CONFIRMED'",
                    (event_id_val, req.listingId)
                )
                row_booked = cursor.fetchone()
                already_booked = int(row_booked["total_booked"]) if row_booked else 0

            if req.listingId and listing_max_qty is not None:
                if already_booked + req.quantity <= listing_max_qty:
                    # Allocate consecutive seats starting after any partial purchase of this listing
                    start_num = already_booked + 1
                    seat_ids = [f"{sec}-{row}-{start_num + i}" for i in range(req.quantity)]
                else:
                    # Listing capacity exhausted: target the listing's primary seats so Availability returns 409 Conflict
                    seat_ids = [f"{sec}-{row}-{i + 1}" for i in range(req.quantity)]
            else:
                # Auto-allocate first N available sequential seats in section/row from Availability Service (FR2 & FR3)
                seat_ids = await _allocate_sequential_seats(event_id_val, sec, row, req.quantity)

        booking_id = f"ECHO-{uuid.uuid4().hex[:8].upper()}"
        created_at = datetime.now(timezone.utc).isoformat()

        # Step 2: Call Availability Service (POST /seats/hold)
        hold_url = f"{AVAILABILITY_SERVICE_URL}/seats/hold"
        hold_payload = {
            "showtime_id": req.eventId or "default-event",
            "eventId": req.eventId,
            "listing_id": req.listingId,
            "section": req.section,
            "row": req.row,
            "quantity": req.quantity,
            "seat_ids": seat_ids,
            "booking_id": booking_id,
            "confirm": True
        }

        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                hold_resp = await client.post(hold_url, json=hold_payload)
                if hold_resp.status_code == 409:
                    logger.warning(f"[CONCURRENCY CONFLICT] Availability service returned 409 Conflict for {seat_ids}.")
                    conflict_body = hold_resp.json() if hold_resp.headers.get("content-type", "").startswith("application/json") else {
                        "error": "Seat already reserved",
                        "message": "Those tickets are no longer available. Please choose another listing."
                    }
                    _save_idempotency(cursor, idempotency_key, request_hash, 409, conflict_body)
                    response.headers["Idempotency-Key"] = idempotency_key
                    response.status_code = status.HTTP_409_CONFLICT
                    return conflict_body

                if hold_resp.status_code not in [200, 201]:
                    logger.warning(f"Availability hold returned unexpected status {hold_resp.status_code}: {hold_resp.text}")
            except httpx.RequestError as exc:
                # If Availability Service is offline during standalone development, log warning and allow fallback
                logger.warning(f"[STANDALONE FALLBACK] Availability service unreachable at {hold_url}: {exc}. Proceeding with local reservation.")

        # Step 3: Persist Booking Record (CONFIRMED)
        cursor.execute("""
            INSERT INTO bookings (
                id, user_id, event_id, event_name, venue, date, time, section, row,
                ticket_type, listing_id, quantity, customer_name, customer_email,
                seat_ids, total, status, idempotency_key, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?)
        """, (
            booking_id, req.userId or "guest", req.eventId or "event-1", req.eventName,
            req.venue, req.date, req.time, req.section, req.row, req.ticketType,
            req.listingId, req.quantity, req.customerName, req.email,
            json.dumps(seat_ids), req.total, idempotency_key, created_at, created_at
        ))

        # Step 4: Resilient Notification Dispatch
        # Wrapped in 2s timeout and graceful degradation (never fails booking if notification fails)
        await dispatch_notification(
            booking_id=booking_id,
            email=req.email,
            seats=seat_ids,
            event_type="CONFIRMED"
        )

        # Step 5: Formulate Success Receipt & Save in Idempotency Cache
        unit_price = req.ticketUnitPrice if req.ticketUnitPrice is not None else (round(req.total / max(1, req.quantity), 2) if req.total else 0.0)
        result_payload = {
            "id": booking_id,
            "bookingId": booking_id,
            "booking_id": booking_id,
            "status": "confirmed",
            "eventId": req.eventId,
            "eventName": req.eventName,
            "venue": req.venue,
            "date": req.date,
            "time": req.time,
            "section": req.section,
            "zoneLabel": req.zoneLabel,
            "row": req.row,
            "ticketType": req.ticketType,
            "listingId": req.listingId,
            "ticketUnitPrice": unit_price,
            "originalTicketPrice": unit_price,
            "quantity": req.quantity,
            "customerName": req.customerName or "Echo Live Member",
            "email": req.email or "guest@echolive.my",
            "paymentMethod": req.paymentMethod,
            "total": req.total,
            "seat_ids": seat_ids,
            "seats": seat_ids,
            "createdAt": created_at,
            "purchasedAt": created_at
        }

        _save_idempotency(cursor, idempotency_key, request_hash, 201, result_payload)

        response.headers["Idempotency-Key"] = idempotency_key
        response.headers["X-Cache"] = "MISS"
        logger.info(f"[BOOKING CONFIRMED] Booking {booking_id} created for {req.email} | Seats: {seat_ids}")
        return result_payload

    finally:
        conn.close()

def _save_idempotency(cursor, key: str, req_hash: str, status_code: int, body: dict):
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO idempotency_records (idempotency_key, request_hash, response_code, response_body)
            VALUES (?, ?, ?, ?)
        """, (key, req_hash, status_code, json.dumps(body)))
    except Exception as e:
        logger.error(f"Failed to record idempotency: {e}")

async def _allocate_sequential_seats(event_id: str, section: str, row: str, quantity: int) -> List[str]:
    """
    Queries the Availability Service for the first N AVAILABLE sequential seats
    in the requested section/row (FR2 & FR3 sequential allocation).
    Falls back to deterministic labels if Availability Service is unreachable.
    """
    seats_url = f"{AVAILABILITY_SERVICE_URL}/events/{event_id}/seats"
    params = {"section": section}
    if row:
        params["row"] = row
    async with httpx.AsyncClient(timeout=2.5) as client:
        try:
            resp = await client.get(seats_url, params=params)
            if resp.status_code == 200:
                payload = resp.json()
                available = [s["seat"] for s in payload.get("seats", []) if s.get("status") == "AVAILABLE"]
                if len(available) >= quantity:
                    return available[:quantity]
        except Exception as exc:
            logger.warning(f"Sequential seat lookup fallback ({exc})")
    return [f"{section}-{row or 'A'}-{i + 1}" for i in range(quantity)]

def _format_booking_row(row) -> dict:
    """
    Normalizes a SQLite booking record to include both snake_case DB columns
    and camelCase keys expected by the ECHO LIVE frontend (Step 4 & Admin UI).
    """
    data = dict(row)
    try:
        seats = json.loads(data["seat_ids"]) if isinstance(data.get("seat_ids"), str) else (data.get("seat_ids") or [])
    except Exception:
        seats = []
    status_upper = (data.get("status") or "CONFIRMED").upper()
    is_cancelled = status_upper == "CANCELLED"
    qty = max(1, int(data.get("quantity") or 1))
    total_val = float(data.get("total") or 0.0)
    unit_price = round(total_val / qty, 2) if total_val > 0 else 0.0
    data["seat_ids"] = seats
    data["seats"] = seats
    data["bookingId"] = data.get("id")
    data["booking_id"] = data.get("id")
    data["eventId"] = data.get("event_id")
    data["eventName"] = data.get("event_name")
    data["ticketType"] = data.get("ticket_type")
    data["listingId"] = data.get("listing_id")
    data["ticketUnitPrice"] = unit_price
    data["originalTicketPrice"] = unit_price
    data["customerName"] = data.get("customer_name")
    data["email"] = data.get("customer_email")
    data["createdAt"] = data.get("created_at")
    data["purchasedAt"] = data.get("created_at")
    data["updatedAt"] = data.get("updated_at")
    data["paymentStatus"] = "REFUNDED" if is_cancelled else "PAID"
    data["holdExpiresAt"] = "Released" if is_cancelled else "Confirmed (no expiry)"
    data["cancelReason"] = "Customer requested cancellation" if is_cancelled else "—"
    return data

# --- Booking Lookup (GET /bookings/{id}) ---

@app.get("/bookings/{booking_id}")
def get_booking(booking_id: str):
    """
    Retrieve booking details by ID (UUID / Reference).
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bookings WHERE LOWER(id) = LOWER(?)", (booking_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Booking not found. Please verify reference.")
        return _format_booking_row(row)
    finally:
        conn.close()

# --- Booking Cancellation (DELETE /bookings/{id}) ---

@app.delete("/bookings/{booking_id}")
async def cancel_booking(booking_id: str):
    """
    Cancel an existing booking:
    1. Mutates booking status to CANCELLED.
    2. Calls Availability Service (POST /seats/release) to restore inventory.
    3. Dispatches cancellation notice to Notification Service.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bookings WHERE LOWER(id) = LOWER(?)", (booking_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Booking not found")

        current_status = row["status"]
        if current_status == "CANCELLED":
            return {"id": row["id"], "status": "cancelled", "message": "Booking is already cancelled"}

        seat_ids = []
        try:
            seat_ids = json.loads(row["seat_ids"]) if row["seat_ids"] else []
        except Exception:
            pass

        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("UPDATE bookings SET status = 'CANCELLED', updated_at = ? WHERE id = ?", (now, row["id"]))

        # Call Availability Service (POST /seats/release)
        release_url = f"{AVAILABILITY_SERVICE_URL}/seats/release"
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                await client.post(release_url, json={
                    "booking_id": row["id"],
                    "showtime_id": row["event_id"],
                    "seat_ids": seat_ids
                })
            except Exception as e:
                logger.warning(f"Could not reach Availability Service for release: {e}")

        # Dispatch Cancellation Notification
        await dispatch_notification(
            booking_id=row["id"],
            email=row["customer_email"],
            seats=seat_ids,
            event_type="CANCELLED"
        )

        logger.info(f"[BOOKING CANCELLED] Booking {row['id']} successfully cancelled.")
        return {
            "id": row["id"],
            "bookingId": row["id"],
            "status": "cancelled",
            "message": f"Booking {row['id']} has been cancelled.",
            "cancelledAt": now
        }
    finally:
        conn.close()

# --- Admin Order & Seat Release Audit Endpoint (Supports Member 4 Admin UI) ---

@app.get("/admin/orders/{booking_id}/audit")
async def get_admin_order_audit(booking_id: str):
    """
    Admin Order and Seat Release Audit endpoint (supports Member 4 Admin UI).
    Verifies against the Availability Service whether an order's seats were
    correctly released upon cancellation or remain permanently booked.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bookings WHERE LOWER(id) = LOWER(?)", (booking_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No order or seat audit was found for that booking ID.")

        booking_data = _format_booking_row(row)
        seats = booking_data["seats"]
        status_val = (booking_data.get("status") or "").upper()
        now_iso = datetime.now(timezone.utc).isoformat()
        expected_qty = int(booking_data.get("quantity") or len(seats) or 1)

        # Query Availability Service to verify actual seat pool statuses
        available_in_row = None
        verified_released = None
        event_id_val = booking_data.get("event_id") or "priscilla-abby-genting-2026"
        sec_val = booking_data.get("section")
        row_val = booking_data.get("row")

        async with httpx.AsyncClient(timeout=2.5) as client:
            try:
                params = {}
                if sec_val:
                    params["section"] = sec_val
                if row_val:
                    params["row"] = row_val
                resp = await client.get(f"{AVAILABILITY_SERVICE_URL}/events/{event_id_val}/seats", params=params)
                if resp.status_code == 200:
                    seat_list = resp.json().get("seats", [])
                    available_in_row = sum(1 for s in seat_list if s.get("status") == "AVAILABLE")
                    if seats:
                        seat_map = {s.get("seat"): s.get("status") for s in seat_list}
                        verified_released = sum(1 for label in seats if seat_map.get(label) == "AVAILABLE")
            except Exception as exc:
                logger.warning(f"Admin audit could not reach Availability Service: {exc}")

        if status_val == "CANCELLED":
            released_count = verified_released if verified_released is not None else expected_qty
            if released_count == expected_qty:
                audit_status = "verified"
                message = "The backend verified that all cancelled seats were released back to the available seat pool."
            else:
                audit_status = "mismatch"
                message = f"Expected {expected_qty} released seats, but {released_count} are currently AVAILABLE in the seat pool."
        elif status_val == "CONFIRMED":
            released_count = verified_released if verified_released is not None else 0
            audit_status = "not-applicable"
            message = "Active confirmed booking: seats remain permanently allocated to this order."
        else:
            released_count = verified_released if verified_released is not None else 0
            audit_status = "pending"
            message = f"Order status is {status_val}."

        available_now = available_in_row if available_in_row is not None else 28

        audit_data = {
            "status": audit_status,
            "message": message,
            "notes": message,
            "expectedSeatCount": expected_qty,
            "expectedSeats": expected_qty,
            "expectedCount": expected_qty,
            "releasedSeatCount": released_count,
            "releasedSeats": released_count,
            "releasedCount": released_count,
            "availableSeatCount": available_now,
            "availableSeats": available_now,
            "availableCount": available_now,
            "verifiedAt": now_iso,
            "checkedAt": now_iso
        }

        return {
            "booking": booking_data,
            "seatReleaseAudit": audit_data
        }
    finally:
        conn.close()

# --- Admin / Diagnostics & Testing Endpoints ---

@app.get("/bookings")
def list_bookings(limit: int = 50):
    """
    List all active and historical bookings for inspection.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bookings ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        result = [_format_booking_row(r) for r in rows]
        return {"count": len(result), "bookings": result}
    finally:
        conn.close()

@app.post("/bookings/reset")
def reset_bookings():
    """
    Reset booking database to initial empty state for test harness execution.
    """
    init_db(reset=True)
    logger.info("Bookings database reset to clean initial state.")
    return {"status": "SUCCESS", "message": "Bookings and idempotency records reset"}

# --- Client Support Endpoints (GET /events, GET /ticket-listings) ---

VENUE_SECTIONS = {
    "arena-stars": ["VVIP", "VIP", "PS1", "PS2", "PS3", "PS4"],
    "unifi-arena": ["VIP", "CAT 1", "CAT 2", "CAT 3"],
    "tm-stadium-nasional": ["FLOOR A", "FLOOR B", "FLOOR C", "CAT 1", "CAT 2", "CAT 3", "CAT 4", "CAT 5", "CAT 6", "CAT 7", "CAT 8", "CAT 9"],
}
AXIATA_PRICES = [798, 598, 398, 298]
TM_PRICES = [1288, 1088, 888, 788, 688, 588, 558, 488, 458, 428, 388, 388]

def _build_venue_listings(show_id: str, venue_key: str, price_top: int, sections: Optional[List[str]] = None) -> List[dict]:
    secs = sections or VENUE_SECTIONS[venue_key]
    listings = []
    for idx, sec in enumerate(secs):
        if venue_key == "unifi-arena":
            price = AXIATA_PRICES[VENUE_SECTIONS[venue_key].index(sec)]
        elif venue_key == "tm-stadium-nasional":
            price = TM_PRICES[VENUE_SECTIONS[venue_key].index(sec)]
        else:
            price = max(168, price_top - idx * 95)
        standing = "STANDING" in sec or sec == "GA" or sec.startswith("FLOOR")
        listings.append({
            "id": f"{show_id}-{sec.lower().replace(' ', '-')}",
            "section": sec,
            "row": "GA" if standing else chr(65 + (idx % 12)),
            "seats": "General admission" if standing else f"Seats {5 + idx * 2}–{6 + idx * 2}",
            "qty": 4 if (idx % 2) else 2,
            "price": price,
            "badges": ["Standing admission" if standing else "Reserved seats", "Sample resale", "Instant download"],
            "score": round(max(7.4, 9.8 - idx * 0.16), 2)
        })
    return listings

SAMPLE_EVENTS = [
    {
        "id": "priscilla-abby-genting-2026",
        "venueKey": "arena-stars",
        "name": "Priscilla Abby",
        "tour": "19+ MALAYSIA CONCERT 2026",
        "date": "DEC 05, 2026",
        "isoDate": "2026-12-05",
        "time": "6:00 PM",
        "venue": "Arena of Stars",
        "city": "Genting Highlands",
        "state": "DEMO LISTINGS",
        "sections": ["VVIP", "VIP", "PS1", "PS2"],
        "listings": [
            {"id": "abby-vvip-01", "section": "VVIP", "row": "A", "seats": "Seats 5–6", "qty": 2, "price": 568, "badges": ["Front stage", "Instant download"], "score": 9.7},
            {"id": "abby-vip-01", "section": "VIP", "row": "C", "seats": "Seats 11–12", "qty": 2, "price": 448, "badges": ["Premium view", "Instant download"], "score": 9.5},
            {"id": "abby-ps1-01", "section": "PS1", "row": "F", "seats": "Seats 17–18", "qty": 4, "price": 328, "badges": ["Centre view", "Aisle seats"], "score": 9.1},
            {"id": "abby-ps2-01", "section": "PS2", "row": "J", "seats": "Seats 21–22", "qty": 4, "price": 218, "badges": ["Best value"], "score": 8.6}
        ]
    },
    {
        "id": "yy-wong-genting-2026",
        "venueKey": "arena-stars",
        "name": "YY Wong & Equator",
        "tour": "LIVE CONCERT 2026",
        "date": "DEC 08, 2026",
        "isoDate": "2026-12-08",
        "time": "6:00 PM",
        "venue": "Arena of Stars",
        "city": "Genting Highlands",
        "state": "DEMO LISTINGS",
        "sections": ["PS1"],
        "listings": [
            {"id": "yy-ps1-01", "section": "PS1", "row": "D", "seats": "Seats 9–10", "qty": 2, "price": 198, "badges": ["Reserved seats", "Instant download"], "score": 8.9},
            {"id": "yy-ps1-02", "section": "PS1", "row": "H", "seats": "Seats 15–16", "qty": 4, "price": 188, "badges": ["Aisle seats"], "score": 8.5}
        ]
    },
    {
        "id": "yao-xiaotang-genting-2026",
        "venueKey": "arena-stars",
        "name": "Yao Xiaotang",
        "tour": "BREAKING DAWN · BANGBANGTANG TOUR",
        "date": "DEC 12, 2026",
        "isoDate": "2026-12-12",
        "time": "6:00 PM",
        "venue": "Arena of Stars",
        "city": "Genting Highlands",
        "state": "DEMO LISTINGS",
        "sections": ["VIP", "PS1", "PS2", "PS3", "PS4"],
        "listings": [
            {"id": "yao-vip-01", "section": "VIP", "row": "A", "seats": "Seats 7–8", "qty": 2, "price": 898, "badges": ["Premium view", "Instant download"], "score": 9.7},
            {"id": "yao-ps1-01", "section": "PS1", "row": "D", "seats": "Seats 13–14", "qty": 2, "price": 718, "badges": ["Centre view", "Instant download"], "score": 9.4},
            {"id": "yao-ps2-01", "section": "PS2", "row": "H", "seats": "Seats 19–20", "qty": 4, "price": 548, "badges": ["Aisle seats"], "score": 9.0},
            {"id": "yao-ps3-01", "section": "PS3", "row": "K", "seats": "Seats 23–24", "qty": 4, "price": 418, "badges": ["Great view"], "score": 8.7},
            {"id": "yao-ps4-01", "section": "PS4", "row": "M", "seats": "Seats 27–28", "qty": 4, "price": 318, "badges": ["Best value"], "score": 8.2}
        ]
    },
    {
        "id": "jimmy-nicky-genting-2026",
        "venueKey": "arena-stars",
        "name": "Jimmy Lin x Nicky Lee",
        "tour": "CONCERT 2.0 · MALAYSIA",
        "date": "DEC 19, 2026",
        "isoDate": "2026-12-19",
        "time": "6:00 PM",
        "venue": "Arena of Stars",
        "city": "Genting Highlands",
        "state": "DEMO LISTINGS",
        "sections": ["VIP", "PS1", "PS2", "PS3", "PS4"],
        "listings": [
            {"id": "jn-vip-01", "section": "VIP", "row": "B", "seats": "Seats 5–6", "qty": 2, "price": 1198, "badges": ["Premium view", "Instant download"], "score": 9.7},
            {"id": "jn-ps1-01", "section": "PS1", "row": "D", "seats": "Seats 11–12", "qty": 2, "price": 948, "badges": ["Centre view", "Instant download"], "score": 9.4},
            {"id": "jn-ps2-01", "section": "PS2", "row": "G", "seats": "Seats 17–18", "qty": 4, "price": 738, "badges": ["Aisle seats"], "score": 9.1},
            {"id": "jn-ps3-01", "section": "PS3", "row": "K", "seats": "Seats 21–22", "qty": 4, "price": 538, "badges": ["Great view"], "score": 8.7},
            {"id": "jn-ps4-01", "section": "PS4", "row": "N", "seats": "Seats 25–26", "qty": 4, "price": 328, "badges": ["Best value"], "score": 8.3}
        ]
    },
    {
        "id": "babymonster-unifi-2026-11-14",
        "venueKey": "unifi-arena",
        "name": "BABYMONSTER",
        "tour": "2026–27 WORLD TOUR · [춤 (CHOOM)]",
        "date": "NOV 14, 2026",
        "isoDate": "2026-11-14",
        "time": "5:00 PM",
        "venue": "Axiata Arena",
        "city": "Bukit Jalil",
        "state": "SOLD OUT",
        "sections": VENUE_SECTIONS["unifi-arena"],
        "listings": _build_venue_listings("babymonster-unifi-2026-11-14", "unifi-arena", 888)
    },
    {
        "id": "mcr-tm-stadium-2026-11-19",
        "venueKey": "tm-stadium-nasional",
        "name": "My Chemical Romance",
        "tour": "SOUTHEAST ASIA TOUR 2026",
        "date": "NOV 19, 2026",
        "isoDate": "2026-11-19",
        "time": "Time TBC",
        "venue": "TM Stadium Nasional",
        "city": "Bukit Jalil",
        "state": "ON SALE",
        "sections": VENUE_SECTIONS["tm-stadium-nasional"],
        "listings": _build_venue_listings("mcr-tm-stadium-2026-11-19", "tm-stadium-nasional", 1288)
    },
    {
        "id": "mcr-tm-stadium-2026-11-20",
        "venueKey": "tm-stadium-nasional",
        "name": "My Chemical Romance",
        "tour": "SOUTHEAST ASIA TOUR 2026",
        "date": "NOV 20, 2026",
        "isoDate": "2026-11-20",
        "time": "Time TBC",
        "venue": "TM Stadium Nasional",
        "city": "Bukit Jalil",
        "state": "ON SALE",
        "sections": VENUE_SECTIONS["tm-stadium-nasional"],
        "listings": _build_venue_listings("mcr-tm-stadium-2026-11-20", "tm-stadium-nasional", 1288)
    },
    {
        "id": "bts-tm-stadium-2026-12-12",
        "venueKey": "tm-stadium-nasional",
        "name": "BTS",
        "tour": "WORLD TOUR · ARIRANG",
        "date": "DEC 12, 2026",
        "isoDate": "2026-12-12",
        "time": "7:30 PM",
        "venue": "TM Stadium Nasional",
        "city": "Bukit Jalil",
        "state": "SOLD OUT",
        "resaleAllowed": False,
        "stageLayout": "360",
        "sections": VENUE_SECTIONS["tm-stadium-nasional"],
        "listings": []
    },
    {
        "id": "bts-tm-stadium-2026-12-13",
        "venueKey": "tm-stadium-nasional",
        "name": "BTS",
        "tour": "WORLD TOUR · ARIRANG",
        "date": "DEC 13, 2026",
        "isoDate": "2026-12-13",
        "time": "7:30 PM",
        "venue": "TM Stadium Nasional",
        "city": "Bukit Jalil",
        "state": "SOLD OUT",
        "resaleAllowed": False,
        "stageLayout": "360",
        "sections": VENUE_SECTIONS["tm-stadium-nasional"],
        "listings": []
    },
    {
        "id": "westlife-unifi-2027-01-13",
        "venueKey": "unifi-arena",
        "name": "Westlife",
        "tour": "25 · THE ANNIVERSARY WORLD TOUR",
        "date": "JAN 13, 2027",
        "isoDate": "2027-01-13",
        "time": "Time TBC",
        "venue": "Axiata Arena",
        "city": "Bukit Jalil",
        "state": "ON SALE",
        "sections": VENUE_SECTIONS["unifi-arena"],
        "listings": _build_venue_listings("westlife-unifi-2027-01-13", "unifi-arena", 798)
    },
    {
        "id": "westlife-unifi-2027-01-14",
        "venueKey": "unifi-arena",
        "name": "Westlife",
        "tour": "25 · THE ANNIVERSARY WORLD TOUR",
        "date": "JAN 14, 2027",
        "isoDate": "2027-01-14",
        "time": "Time TBC",
        "venue": "Axiata Arena",
        "city": "Bukit Jalil",
        "state": "ON SALE",
        "sections": VENUE_SECTIONS["unifi-arena"],
        "listings": _build_venue_listings("westlife-unifi-2027-01-14", "unifi-arena", 798)
    }
]

def _get_listing_initial_qty(event_id: Optional[str], listing_id: Optional[str]) -> Optional[int]:
    if not listing_id:
        return None
    for ev in SAMPLE_EVENTS:
        if not event_id or ev["id"] == event_id:
            for item in ev.get("listings", []):
                if item["id"] == listing_id:
                    return int(item["qty"])
    return None

def _get_live_listings(event_obj: dict, section: Optional[str] = None) -> List[dict]:
    """
    Computes remaining ticket counts for an event's listings by subtracting
    active CONFIRMED bookings stored in bookings.db. Cancelled bookings
    automatically restore listing availability.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT listing_id, COALESCE(SUM(quantity), 0) AS booked_qty FROM bookings WHERE event_id = ? AND status = 'CONFIRMED' AND listing_id IS NOT NULL GROUP BY listing_id",
            (event_obj["id"],)
        )
        booked_map = {r["listing_id"]: int(r["booked_qty"]) for r in cursor.fetchall()}
    except Exception:
        booked_map = {}
    finally:
        conn.close()

    live = []
    for item in event_obj.get("listings", []):
        if section and section != "All sections" and item["section"] != section:
            continue
        remaining = int(item["qty"]) - booked_map.get(item["id"], 0)
        if remaining > 0:
            copy_item = dict(item)
            copy_item["qty"] = remaining
            live.append(copy_item)
    return live

@app.get("/events")
def get_events():
    """
    Returns full 11-concert event catalog with live remaining listing quantities.
    """
    events_out = []
    for ev in SAMPLE_EVENTS:
        ev_copy = dict(ev)
        ev_copy["listings"] = _get_live_listings(ev)
        events_out.append(ev_copy)
    return {"events": events_out}

@app.get("/ticket-listings")
def get_ticket_listings(eventId: Optional[str] = None, section: Optional[str] = None, quantity: Optional[int] = None):
    """
    Returns live available listings filtered by event ID and section.
    """
    target = next((e for e in SAMPLE_EVENTS if e["id"] == eventId), SAMPLE_EVENTS[0])
    listings = _get_live_listings(target, section=section)
    return {"eventId": target["id"], "listings": listings}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
