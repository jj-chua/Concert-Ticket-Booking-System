# PowerShell script to start all 4 ECHO LIVE distributed services natively
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Starting ECHO LIVE Distributed Architecture         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Notification Service (Port 5003) - Member 3
Write-Host "[1/4] Starting Notification Service on Port 5003..." -ForegroundColor Yellow
$notifProcess = Start-Process -FilePath "python" `
    -ArgumentList "app.py" `
    -WorkingDirectory "$RepoRoot\services\notification-service" `
    -PassThru -WindowStyle Hidden

# 2. Start Availability Service (Port 5002) - Member 1
Write-Host "[2/4] Starting Availability Service on Port 5002..." -ForegroundColor Yellow
$availProcess = Start-Process -FilePath "python" `
    -ArgumentList "-m", "availability_service" `
    -WorkingDirectory "$RepoRoot\services\availability-service" `
    -PassThru -WindowStyle Hidden

# 3. Start Booking Service (Port 5001) - Member 2 (JJ)
Write-Host "[3/4] Starting Booking Service on Port 5001..." -ForegroundColor Yellow
$bookingProcess = Start-Process -FilePath "python" `
    -ArgumentList "app.py" `
    -WorkingDirectory "$RepoRoot\services\booking-service" `
    -PassThru -WindowStyle Hidden

# 4. Start Client Web Server (Port 3000) - Member 4
Write-Host "[4/4] Starting Client Web Server on Port 3000..." -ForegroundColor Yellow
$clientProcess = Start-Process -FilePath "python" `
    -ArgumentList "-m", "http.server", "3000", "--directory", "$RepoRoot\client" `
    -WorkingDirectory "$RepoRoot" `
    -PassThru -WindowStyle Hidden

# Store PIDs in a tracking file for clean shutdown
$pids = @{
    notification = $notifProcess.Id
    availability = $availProcess.Id
    booking = $bookingProcess.Id
    client = $clientProcess.Id
}
$pids | ConvertTo-Json | Set-Content "$RepoRoot\.running_services.json"

Start-Sleep -Seconds 3

Write-Host "`nAll 4 distributed services running:" -ForegroundColor Green
Write-Host "  -> Client Web UI:        http://localhost:3000" -ForegroundColor White
Write-Host "  -> Booking Service:      http://localhost:5001  (Docs: /docs)" -ForegroundColor White
Write-Host "  -> Availability Service: http://localhost:5002  (Docs: /docs)" -ForegroundColor White
Write-Host "  -> Notification Service: http://localhost:5003" -ForegroundColor White
Write-Host "`nTo stop all services, run: .\stop-services.ps1" -ForegroundColor Gray
