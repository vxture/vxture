<#
.SYNOPSIS
    Vxture frontend development environment startup script (PowerShell)
.DESCRIPTION
    一键启动 Next.js 前端开发服务
    - 后台启动服务
    - 记录进程 PID 到 .vxture_frontend.pid
    - 输出服务信息
.EXAMPLE
    .\start-dev-frontend.ps1
#>

$webDir = Join-Path $PSScriptRoot 'packages\web'
$pidFile = Join-Path $PSScriptRoot '.vxture_frontend.pid'

Write-Host "====================================="
Write-Host "  Start Vxture Frontend Dev Env"
Write-Host "====================================="
Write-Host ""

if (!(Test-Path $webDir)) {
    Write-Host "❌ Frontend directory not found: $webDir"
    exit 1
}

Write-Host "Starting frontend..."
try {
    $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c pnpm dev" -WorkingDirectory $webDir -WindowStyle Hidden -PassThru
    $p.Id | Out-File -Encoding ascii $pidFile
    Write-Host "✅ Frontend process started. PID: $($p.Id)"
    Write-Host "Frontend is starting at: http://localhost:3000"
}
catch {
    Write-Host "❌ Failed to start frontend: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "====================================="
Write-Host "  Startup process completed!"
Write-Host "  You can safely close this window."
Write-Host "====================================="