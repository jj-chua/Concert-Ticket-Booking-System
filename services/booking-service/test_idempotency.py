import sys
import time
import uuid
import requests

# Set stdout encoding for cross-platform terminal compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BOOKING_URL = "http://localhost:5001"

def run_test():
    print("=" * 75)
    print(" ECHO LIVE: Idempotency & Duplicate Request Suppression Test")
    print(" Member 2 Deliverable [JJ] - Orchestration & Booking Service")
    print("=" * 75)

    # 1. Pre-flight health check
    try:
        health = requests.get(f"{BOOKING_URL}/health", timeout=3)
        if health.status_code != 200:
            print(f"[FAIL] Booking Service health check failed: HTTP {health.status_code}")
            return False
        print(f"[OK] Booking Service is UP on port 5001 ({health.json().get('service')})")
    except Exception as e:
        print(f"[FAIL] Cannot connect to Booking Service at {BOOKING_URL}: {e}")
        print("Please start the booking service first: python services/booking-service/app.py")
        return False

    # 2. Reset database state for clean test
    print("\n[SETUP] Resetting booking database to clean state...")
    try:
        requests.post(f"{BOOKING_URL}/bookings/reset", timeout=3)
        print("[SETUP] Database reset successfully.")
    except Exception as e:
        print(f"[WARN] Could not reset database: {e}")

    # 3. Prepare test payload with identical Idempotency-Key
    fixed_key = f"TEST-IDEMPOTENCY-{uuid.uuid4().hex[:12].upper()}"
    payload = {
        "eventId": "priscilla-abby-genting-2026",
        "eventName": "Priscilla Abby 19+ Concert",
        "venue": "Arena of Stars",
        "date": "DEC 05, 2026",
        "time": "6:00 PM",
        "section": "VVIP",
        "row": "A",
        "ticketType": "Front stage, Instant download",
        "listingId": "abby-vvip-01",
        "quantity": 2,
        "customerName": "JJ Chua",
        "email": "jj.chua@example.com",
        "total": 1136.0,
        "seat_ids": ["VVIP-A-5", "VVIP-A-6"]
    }
    headers = {
        "Content-Type": "application/json",
        "Idempotency-Key": fixed_key
    }

    print(f"\nTarget Event       : {payload['eventName']} ({payload['venue']})")
    print(f"Target Section     : {payload['section']} (Row {payload['row']}) | Seats: {payload['seat_ids']}")
    print(f"Fixed Idempotency-Key: {fixed_key}")
    print(f"Scenario           : Firing 3 sequential HTTP POST requests with identical payload & key\n")

    responses = []
    for attempt in range(1, 4):
        print(f"[ATTEMPT #{attempt}] Submitting POST /bookings...")
        t0 = time.perf_counter()
        resp = requests.post(f"{BOOKING_URL}/bookings", json=payload, headers=headers, timeout=5)
        dt_ms = (time.perf_counter() - t0) * 1000

        cache_header = resp.headers.get("X-Cache", "MISS")
        data = resp.json()
        b_id = data.get("id") or data.get("bookingId") or data.get("booking_id")

        responses.append({
            "attempt": attempt,
            "status": resp.status_code,
            "cache": cache_header,
            "latency_ms": dt_ms,
            "booking_id": b_id,
            "data": data
        })

        tag = "INITIAL CREATION" if attempt == 1 else "CACHED REPLAY"
        print(f"  -> HTTP {resp.status_code} | X-Cache: {cache_header:<4} | Latency: {dt_ms:.1f} ms | Booking ID: {b_id} ({tag})")
        time.sleep(0.3)

    # 4. Summary Table
    print("\n" + "-" * 75)
    print(f"{'Attempt':<10}{'HTTP Status':<15}{'X-Cache Header':<18}{'Booking ID':<30}")
    print("-" * 75)
    for r in responses:
        print(f"#{r['attempt']:<9}{r['status']:<15}{r['cache']:<18}{r['booking_id']}")
    print("-" * 75)

    # 5. Database Audit: Count total records in database
    audit_resp = requests.get(f"{BOOKING_URL}/bookings", timeout=3).json()
    all_bookings = audit_resp.get("bookings", [])
    matching_bookings = [b for b in all_bookings if b.get("idempotency_key") == fixed_key]

    print("\n[DATABASE AUDIT]")
    print(f"Total bookings created in database : {len(matching_bookings)} (Expected: exactly 1)")

    # 6. Evaluation Assertions
    att1 = responses[0]
    att2 = responses[1]
    att3 = responses[2]

    is_att1_created = att1["status"] in [200, 201] and att1["cache"] == "MISS"
    is_att2_cached  = att2["status"] in [200, 201] and att2["cache"] == "HIT" and att2["booking_id"] == att1["booking_id"]
    is_att3_cached  = att3["status"] in [200, 201] and att3["cache"] == "HIT" and att3["booking_id"] == att1["booking_id"]
    is_db_single    = len(matching_bookings) == 1

    if is_att1_created and is_att2_cached and is_att3_cached and is_db_single:
        print("\n\033[92m[TEST PASSED] Idempotency Strictly Guaranteed!\033[0m")
        print("Duplicate network retries were suppressed. Zero redundant database rows created.")
        return True
    else:
        print("\n\033[91m[TEST FAILED] Idempotency anomaly detected.\033[0m")
        return False

if __name__ == "__main__":
    passed = run_test()
    sys.exit(0 if passed else 1)
