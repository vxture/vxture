# Vxture 开发环境启动脚本

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Vxture 开发环境启动脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 检查 Node.js 是否安装
Write-Host "检查 Node.js 环境..." -ForegroundColor Cyan
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 未找到 Node.js，请先安装 Node.js 22+ 版本" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查 pnpm 是否安装
Write-Host "`n检查 pnpm 环境..." -ForegroundColor Cyan
$pnpmVersion = pnpm -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 未找到 pnpm，请先安装 pnpm 10+ 版本" -ForegroundColor Red
    exit 1
}
Write-Host "pnpm 版本: $pnpmVersion" -ForegroundColor Green

# 检查 Python 是否安装（用于后端）
Write-Host "`n检查 Python 环境..." -ForegroundColor Cyan
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    $pythonVersion = python3 --version
    if ($LASTEXITCODE -ne 0) {
        Write-Host "警告: 未找到 Python 环境，后端服务将无法启动" -ForegroundColor Yellow
        $pythonAvailable = $false
    } else {
        $pythonAvailable = $true
    }
} else {
    $pythonAvailable = $true
}

if ($pythonAvailable) {
    Write-Host "Python 版本: $pythonVersion" -ForegroundColor Green
}

# 检查依赖是否已安装
Write-Host "`n检查项目依赖..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "依赖未安装，正在安装..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "依赖已安装" -ForegroundColor Green

# 启动开发环境
Write-Host "`n启动开发环境..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray

# 启动后端服务（如果 Python 可用）
if ($pythonAvailable) {
    Write-Host "启动后端 API 服务..." -ForegroundColor Yellow
    Start-Process -FilePath "pnpm" -ArgumentList "dev:api" -NoNewWindow
} else {
    Write-Host "跳过后端服务（Python 不可用）" -ForegroundColor Yellow
}

# 等待后端服务启动
Write-Host "`n等待后端服务启动..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# 启动前端服务
Write-Host "`n启动前端 Web 服务..." -ForegroundColor Yellow
Start-Process -FilePath "pnpm" -ArgumentList "dev" -NoNewWindow

Write-Host "`n==========================================" -ForegroundColor Gray
Write-Host "  开发环境启动完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
if ($pythonAvailable) {
    Write-Host "后端地址: http://localhost:8000" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "按 Ctrl+C 停止脚本" -ForegroundColor Gray