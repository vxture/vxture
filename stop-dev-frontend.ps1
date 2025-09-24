$pidFile = "$PSScriptRoot\.vxture_frontend.pid"

Write-Host "====================================="
Write-Host "  Stop Vxture Frontend Dev Service"
Write-Host "====================================="
Write-Host ""

if (Test-Path $pidFile) {
    $pid = Get-Content $pidFile | Select-Object -First 1
    if ($pid -and ($pid -match '^\d+$')) {
        Write-Host "Killing frontend PID $pid from PID file..."
        try {
            Stop-Process -Id $pid -Force
            Write-Host "✅ Frontend process $pid stopped."
        }
        catch {
            Write-Host "⚠️  Failed to stop process $pid. It may already be stopped."
        }
        Remove-Item $pidFile
    }
    else {
        Write-Host "⚠️  PID file exists but no valid PID found."
    }
}
else {
    Write-Host "No PID file found. Trying to kill pnpm dev processes by name..."
    Get-CimInstance Win32_Process | Where-Object {
        $_.CommandLine -match "pnpm dev"
    } | ForEach-Object {
        Write-Host "Killing PID $($_.ProcessId): $($_.CommandLine)"
        Stop-Process -Id $_.ProcessId -Force
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "  Frontend service stopped."
Write-Host "====================================="