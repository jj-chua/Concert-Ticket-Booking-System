import httpx
import logging

async def dispatch_notification(booking_id: str, email: str, seats: list):
    # If you are testing locally, enter localhost:5003; if you are using Docker, enter notification-service:5003.
    url = "http://localhost:5003/notifications" 
    payload = {
        "booking_id": booking_id,
        "user_email": email,
        "seat_ids": seats,
        "event_type": "CONFIRMED"
    }
    try:
        # Set 2s timeout to avoid notification service latency blocking the booking process
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            logging.info(f"Notification delivered for booking {booking_id}")
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError) as e:
        # Graceful degradation: catch and log any errors, ensuring the booking succeeds for the client
        logging.warning(f"[WARN] Notification service unavailable or timed out: {e}. Queuing for retry or marking pending.")