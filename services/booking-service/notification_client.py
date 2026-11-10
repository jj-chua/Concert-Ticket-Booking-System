import os
import httpx
import logging

NOTIFICATION_SERVICE_URL = os.environ.get("NOTIFICATION_SERVICE_URL", "http://localhost:5003")

async def dispatch_notification(booking_id: str, email: str, seats: list, event_type: str = "CONFIRMED"):
    """
    Asynchronously dispatches booking confirmation or cancellation to Notification Service (Port 5003).
    Enforces a 2.0-second timeout with graceful degradation: downstream notification failure
    never rolls back or fails the primary booking transaction.
    """
    url = f"{NOTIFICATION_SERVICE_URL.rstrip('/')}/notifications"
    payload = {
        "booking_id": booking_id,
        "user_email": email,
        "seat_ids": seats,
        "event_type": event_type
    }
    try:
        # Set 2.0s timeout to prevent notification service latency from blocking the booking process
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            logging.info(f"Notification delivered for booking {booking_id} ({event_type})")
            return True
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError) as e:
        # Graceful degradation: catch and log error, ensuring the booking succeeds for the client
        logging.warning(f"[WARN] Notification service unavailable or timed out: {e}. Queuing for retry or marking pending.")
        return False
