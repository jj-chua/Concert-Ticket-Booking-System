FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=5001
ENV AVAILABILITY_SERVICE_URL=http://availability-service:5002
ENV NOTIFICATION_SERVICE_URL=http://notification-service:5003

EXPOSE 5001

CMD ["python", "app.py"]
