# 核心：仅后台启动前端服务，保留完整提示样式
$webDir = Join-Path $PSScriptRoot "packages\web"
$pidFile = Join-Path $PSScriptRoot ".vxture_frontend.pid"

# 1. 前端目录校验 + 错误提示
if (-not (Test-Path $webDir)) {
    Write-Host "❌ 前端目录不存在：$webDir" -ForegroundColor Red
    exit 1
}

# 2. 启动前端服务
try {
    Write-Host ""
    Write-Host "====================================="
    Write-Host "  Start Vxture Frontend Dev Env"
    Write-Host "====================================="
    Write-Host ""
    Write-Host "Starting frontend in background..." -ForegroundColor Cyan

    # 后台启动服务并获取PID
    $proc = Start-Process "cmd.exe" "/c pnpm dev" `
        -WorkingDirectory $webDir `
        -WindowStyle Hidden `
        -PassThru `
        -ErrorAction Stop

    # 记录PID
    $proc.Id | Out-File $pidFile -Encoding ascii -Force

    # 启动成功提示
    Write-Host "✅ Frontend process started in background. PID: $($proc.Id)" -ForegroundColor Green
    Write-Host "Frontend is starting at: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    # 保留你需要的启动完成分割线提示
    Write-Host "====================================="
    Write-Host "  Startup process completed!"
    Write-Host "  You can safely close this window."
    Write-Host "====================================="
    Write-Host ""
}
catch {
    # 失败提示
    Write-Host "❌ Failed to start frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
