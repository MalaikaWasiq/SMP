# =====================================================================
# Smart Travel Planner - Local / Wi-Fi Launcher (No ngrok)
# =====================================================================

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [START] Starting Smart Travel Planner (Local Mode)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Start MongoDB
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -ne 'Running') {
    Write-Host "Starting MongoDB Service..." -ForegroundColor Cyan
    Start-Service MongoDB
}

# 2. Local Wi-Fi IP
$wifiIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '169\.254' -and ($_.InterfaceAlias -match 'Wi-Fi|Wireless|Ethernet') } | Select-Object -First 1).IPAddress
if (-not $wifiIp) { $wifiIp = "localhost" }

# 3. Launch ML Service
Write-Host "Launching ML Recommender on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'STP - ML Service (8000)'; Set-Location '$projectRoot\ml'; python -m uvicorn app:app --host 127.0.0.1 --port 8000"

# 4. Launch Node.js Backend & Web Host
Write-Host "Launching Node Backend on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'STP - Backend & Web (5000)'; Set-Location '$projectRoot\backend'; node src/server.js"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SERVICES RUNNING LOCALLY!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Browser (This PC):    http://localhost:5000" -ForegroundColor Cyan
Write-Host " Mobile (Same Wi-Fi):  http://$wifiIp:5000" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
