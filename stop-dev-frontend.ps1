# 仅停止前端服务，风格与 start-dev-frontend.ps1 保持一致

$pidFile = Join-Path $PSScriptRoot ".vxture_frontend.pid"

Write-Host ""
Write-Host "====================================="
Write-Host "  Stop Vxture Frontend Dev Service"
Write-Host "====================================="
Write-Host ""

if (Test-Path $pidFile) {
    $frontendPid = Get-Content $pidFile | Select-Object -First 1
    if ($frontendPid -and ($frontendPid -match '^\d+$')) {
        Write-Host "Killing frontend PID $frontendPid from PID file..." -ForegroundColor Cyan
        try {
            Stop-Process -Id $frontendPid -Force
            Write-Host "OK: Frontend process $frontendPid stopped." -ForegroundColor Green
        }
        catch {
            Write-Host "ERROR: Failed to stop process $frontendPid. It may already be stopped." -ForegroundColor Yellow
        }
        Remove-Item $pidFile
    }
    else {
        Write-Host "ERROR: PID file exists but no valid PID found." -ForegroundColor Yellow
    }
}
else {
    Write-Host "No PID file found. Trying to kill pnpm dev processes by name..." -ForegroundColor Yellow
    Get-CimInstance Win32_Process | Where-Object {
        $_.CommandLine -match "pnpm dev"
    } | ForEach-Object {
        Write-Host "Killing PID $($_.ProcessId): $($_.CommandLine)" -ForegroundColor Cyan
        try {
            Stop-Process -Id $_.ProcessId -Force
            Write-Host "OK: Process $($_.ProcessId) stopped." -ForegroundColor Green
        }
        catch {
            Write-Host "ERROR: Failed to stop process $($_.ProcessId)." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "  Frontend service stopped."
Write-Host "  You can safely close this window."
Write-Host "====================================="
Write-Host ""
