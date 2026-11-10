from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging

app = FastAPI(title="Notification Service")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class NotificationPayload(BaseModel):
    booking_id: str
    user_email: str
    seat_ids: list[str]
    event_type: str  # CONFIRMED or CANCELLED

@app.post("/notifications")
async def send_notification(payload: NotificationPayload):
   # Console output for simulating sending emails/SMS messages
    logging.info(f"[NOTIF WORKER] Successfully processed {payload.event_type} for {payload.user_email} | Booking ID: {payload.booking_id} | Seats: {payload.seat_ids}")
    return {"status": "SUCCESS", "message": "Notification dispatched"}

if __name__ == "__main__":
    import uvicorn
    # Bind to port 5003
    uvicorn.run(app, host="0.0.0.0", port=5003)