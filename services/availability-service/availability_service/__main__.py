"""Run with:  python -m availability_service   (from services/availability-service/)"""
import os

import uvicorn

if __name__ == "__main__":
    # PORT is what docker-compose.yml sets; AVAILABILITY_PORT is kept for local runs.
    uvicorn.run("availability_service.app:app",
                host=os.getenv("HOST", "127.0.0.1"),
                port=int(os.getenv("PORT", os.getenv("AVAILABILITY_PORT", "5002"))))
