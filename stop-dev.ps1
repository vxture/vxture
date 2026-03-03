# Vxture 开发环境停止脚本

Write-Host "==========================================" -ForegroundColor Red
Write-Host "  Vxture 开发环境停止脚本" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""

# 函数：检查端口是否被占用
function Test-Port {
    param($Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new($Port)
        $listener.Start()
        return $false
    } catch {
        return $true
    } finally {
        if ($listener) {
            $listener.Stop()
        }
    }
}

# 函数：终止占用指定端口的进程
function Stop-ProcessByPort {
    param($Port)

    $processes = netstat -ano | findstr ":$Port"
    if ($processes) {
        $processIds = @()

        foreach ($line in $processes.Split("`n")) {
            if ($line.Trim()) {
                $parts = $line.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
                if ($parts.Length -ge 5) {
                    $processIds += $parts[-1]
                }
            }
        }

        $uniqueProcessIds = $processIds | Sort-Object -Unique

        foreach ($pid in $uniqueProcessIds) {
            if ($pid -and $pid -ne "0") {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "终止进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force
                    }
                } catch {
                    Write-Host "无法终止进程 PID: $pid" -ForegroundColor Red
                }
            }
        }
    }
}

# 检查并终止占用 3000 端口的进程（前端）
Write-Host "检查前端服务端口 (3000)..." -ForegroundColor Cyan
if (Test-Port 3000) {
    Write-Host "发现占用 3000 端口的进程，正在终止..." -ForegroundColor Yellow
    Stop-ProcessByPort 3000
    Start-Sleep -Seconds 2

    if (Test-Port 3000) {
        Write-Host "警告: 无法完全终止占用 3000 端口的进程" -ForegroundColor Yellow
    } else {
        Write-Host "前端服务已停止" -ForegroundColor Green
    }
} else {
    Write-Host "前端服务未运行" -ForegroundColor Gray
}

# 检查并终止占用 8000 端口的进程（后端）
Write-Host "`n检查后端服务端口 (8000)..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "发现占用 8000 端口的进程，正在终止..." -ForegroundColor Yellow
    Stop-ProcessByPort 8000
    Start-Sleep -Seconds 2

    if (Test-Port 8000) {
        Write-Host "警告: 无法完全终止占用 8000 端口的进程" -ForegroundColor Yellow
    } else {
        Write-Host "后端服务已停止" -ForegroundColor Green
    }
} else {
    Write-Host "后端服务未运行" -ForegroundColor Gray
}

# 检查并终止 Node.js 进程
Write-Host "`n检查 Node.js 进程..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "发现 Node.js 进程，正在终止..." -ForegroundColor Yellow
    foreach ($process in $nodeProcesses) {
        try {
            Write-Host "终止进程: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force
        } catch {
            Write-Host "无法终止进程 PID: $($process.Id)" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "未发现 Node.js 进程" -ForegroundColor Gray
}

Write-Host "`n==========================================" -ForegroundColor Red
Write-Host "  开发环境停止完成！" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red