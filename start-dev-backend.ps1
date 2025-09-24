<#
.SYNOPSIS
    Vxture backend development environment startup script (PowerShell)
.DESCRIPTION
    一键启动 FastAPI 后端开发服务
    - 后台启动服务
    - 记录进程 PID 到 .vxture_backend.pid
    - 输出服务信息
.EXAMPLE
    .\start-dev-backend.ps1
#>

$apiDir = Join-Path $PSScriptRoot 'packages\api'
$venvPython = Join-Path $apiDir '.venv\Scripts\python.exe'
$startScript = Join-Path $apiDir 'start_dev.py'
$pidFile = Join-Path $PSScriptRoot '.vxture_backend.pid'

Write-Host "====================================="
Write-Host "  Start Vxture Backend Dev Env"
Write-Host "====================================="
Write-Host ""

if (!(Test-Path $venvPython)) {
    Write-Host "❌ Python virtual environment not found: $venvPython"
    Write-Host "Please run: python -m venv .venv"
    exit 1
}
if (!(Test-Path $startScript)) {
    Write-Host "❌ Backend start script not found: $startScript"
    exit 1
}

Write-Host "Starting backend..."
try {
    $p = Start-Process -FilePath $venvPython -ArgumentList "`"$startScript`"" -WindowStyle Hidden -PassThru
    $p.Id | Out-File -Encoding ascii $pidFile
    Write-Host "✅ Backend process started. PID: $($p.Id)"
    Write-Host "Backend is starting at: http://localhost:8000"
    Write-Host "API docs: http://localhost:8000/docs"
}
catch {
    Write-Host "❌ Failed to start backend: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "====================================="
Write-Host "  Startup process completed!"
Write-Host "  You can safely close this window."
Write-Host "====================================="