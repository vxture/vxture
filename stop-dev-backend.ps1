<#
.SYNOPSIS
    Vxture backend development environment stop script (PowerShell)
.DESCRIPTION
    一键停止 FastAPI 后端开发服务
    - 读取 .vxture_backend.pid
    - 终止对应进程
    - 如无 PID 文件，尝试按端口和进程名兜底查杀
.EXAMPLE
    .\stop-dev-backend.ps1
#>

$pidFile = Join-Path $PSScriptRoot '.vxture_backend.pid'
$backendPort = 8000

Write-Host "====================================="
Write-Host "  Stop Vxture Backend Dev Service"
Write-Host "====================================="
Write-Host ""

if (Test-Path $pidFile) {
    $backendPid = Get-Content $pidFile | Select-Object -First 1
    if ($backendPid -and ($backendPid -match '^\d+$')) {
        Write-Host "Killing backend PID $backendPid from PID file..."
        try {
            Stop-Process -Id $backendPid -Force
            Write-Host "✅ Backend process $backendPid stopped."
        }
        catch {
            Write-Host "⚠️  Failed to stop process $backendPid. It may already be stopped."
        }
        Remove-Item $pidFile
        Write-Host ""
        Write-Host "====================================="
        Write-Host "  Backend service stopped."
        Write-Host "====================================="
        exit 0
    }
}

Write-Host "No valid PID file found. Trying to kill backend by port $backendPort..."
$backendPids = netstat -ano | Select-String ":$backendPort\s" | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Where-Object { $_ -match '^\d+$' } | Select-Object -Unique

foreach ($backendPid in $backendPids) {
    Write-Host "Killing backend PID $backendPid by port..."
    try {
        Stop-Process -Id $backendPid -Force
        Write-Host "✅ Backend process $backendPid stopped."
    }
    catch {
        Write-Host "⚠️  Failed to stop process $backendPid. It may already be stopped."
    }
}

Write-Host "Trying to kill python processes running start_dev.py or uvicorn..."
Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -match "start_dev.py" -or $_.CommandLine -match "uvicorn"
} | ForEach-Object {
    Write-Host "Killing PID $($_.ProcessId): $($_.CommandLine)"
    try {
        Stop-Process -Id $_.ProcessId -Force
    }
    catch {
        Write-Host "⚠️  Failed to stop process $($_.ProcessId)."
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "  Backend service stopped."
Write-Host "====================================="