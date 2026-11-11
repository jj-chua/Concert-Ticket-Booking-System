"""
Live concurrency test (Allen, Member 1).

Fires N requests for the SAME seat at the same instant, over the network,
against the running services. Exactly one may win; the rest must get 409.

  python tests/concurrency_test.py                       # 10 requests -> Availability Service
  python tests/concurrency_test.py --via booking --n 8   # through the Booking Service
  python tests/concurrency_test.py --seat F7 --n 25
"""

import argparse
import threading
import time
import uuid
from datetime import datetime

import httpx

HTTP = httpx.Client(trust_env=False)  # shared, thread-safe

AVAILABILITY = "http://127.0.0.1:5002"
BOOKING = "http://127.0.0.1:5001"
SERVICE_KEY = "dev-only-change-me"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--seat", default="C4")
    ap.add_argument("--showtime", type=int, default=1)
    ap.add_argument("--via", choices=["availability", "booking"], default="availability")
    args = ap.parse_args()

    barrier = threading.Barrier(args.n)
    results = [None] * args.n

    def worker(i):
        rid = f"race-{i:02d}"
        if args.via == "availability":
            url = f"{AVAILABILITY}/seats/hold"
            body = {"showtime_id": args.showtime, "seats": [args.seat], "booking_id": str(uuid.uuid4())}
            headers = {"X-Service-Key": SERVICE_KEY, "X-Request-ID": rid}
        else:
            url = f"{BOOKING}/bookings"
            body = {"showtime_id": args.showtime, "seats": [args.seat], "email": f"user{i}@example.com"}
            headers = {"Idempotency-Key": str(uuid.uuid4()), "X-Request-ID": rid}
        barrier.wait()                      # all threads start together
        t0 = time.perf_counter()
        r = HTTP.post(url, json=body, headers=headers, timeout=20)
        results[i] = (rid, r.status_code, (time.perf_counter() - t0) * 1000, r.json())

    print(f"[{datetime.now():%H:%M:%S}] {args.n} concurrent POSTs for seat {args.seat} "
          f"(showtime {args.showtime}) via the {args.via} service\n")
    threads = [threading.Thread(target=worker, args=(i,)) for i in range(args.n)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print(f"{'request':<10}{'HTTP':<6}{'latency':>10}   result")
    print("-" * 64)
    for rid, code, ms, body in sorted(results, key=lambda x: x[2]):
        if code in (200, 201):
            what = f"WON  -> {body.get('status')} booking {body.get('booking_id', '')[:8]}"
        else:
            what = f"LOST -> {body.get('title')} {body.get('unavailable_seats', '')}"
        print(f"{rid:<10}{code:<6}{ms:>8.1f} ms   {what}")

    wins = sum(1 for r in results if r[1] in (200, 201))
    conflicts = sum(1 for r in results if r[1] == 409)
    seat = next(s for s in HTTP.get(f"{AVAILABILITY}/showtimes/{args.showtime}/seats").json()["seats"]
                if s["seat"] == args.seat)
    print("-" * 64)
    print(f"successful: {wins}   rejected with 409: {conflicts}   other: {args.n - wins - conflicts}")
    print(f"final state of {args.seat}: {seat['status']}")
    print("RESULT:", "PASS - no double booking" if wins == 1 and conflicts == args.n - 1 else "FAIL")


if __name__ == "__main__":
    main()
