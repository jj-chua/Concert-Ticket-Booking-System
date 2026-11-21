# PowerShell script to cleanly stop all ECHO LIVE services
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = "$RepoRoot\.running_services.json"

Write-Host "Stopping all ECHO LIVE services..." -ForegroundColor Cyan

if (Test-Path $pidFile) {
    $pids = Get-Content $pidFile | ConvertFrom-Json
    foreach ($name in @('notification', 'availability', 'booking', 'client')) {
        $procId = $pids.$name
        if ($procId) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "  Stopped $name service (PID: $procId)" -ForegroundColor Green
            } catch {
                Write-Host "  Could not stop $name (PID: $procId)" -ForegroundColor Gray
            }
        }
    }
    Remove-Item $pidFile -ErrorAction SilentlyContinue
}

# Also ensure any lingering processes on ports 3000, 5001, 5002, 5003 are stopped
foreach ($port in @(3000, 5001, 5002, 5003)) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $owningPids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $owningPids) {
            if ($pidToKill -gt 0) {
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                Write-Host "  Freed port $port (PID: $pidToKill)" -ForegroundColor Green
            }
        }
    }
}

Write-Host "All ECHO LIVE services stopped." -ForegroundColor Green
