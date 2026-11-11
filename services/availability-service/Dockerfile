FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY availability_service ./availability_service

# Listen on all interfaces inside the container; docker-compose maps 5002.
ENV HOST=0.0.0.0 \
    PORT=5002 \
    AVAILABILITY_DB=/app/data/availability.db \
    LOG_DIR=/app/logs
RUN mkdir -p /app/data /app/logs

EXPOSE 5002
CMD ["python", "-m", "availability_service"]
