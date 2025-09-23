# Vxture 一键启动（PowerShell）
# 功能：以不阻塞当前终端的方式启动前端与后端，并尝试记录 PID/端口信息到 .vxture_pids.json

param(
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 8000
)

function Write-JsonFile($path, $obj) {
    $json = $obj | ConvertTo-Json -Depth 5
    Set-Content -Path $path -Value $json -Encoding UTF8
}

function Get-PidsByPort($port) {
    $out = @()
    $lines = netstat -ano | Select-String ":$port\s"
    foreach ($l in $lines) {
        $parts = ($l -split '\s+') | Where-Object { $_ -ne '' }
        $pidStr = $parts[-1]
        if ($pidStr -match '^\d+$') { $out += [int]$pidStr }
    }
    return $out | Select-Object -Unique
}

function Stop-ProcessByPid($pid) {
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process PID: $pid"
        return $true
    } catch {
        Write-Host "Failed to stop process PID: $pid - $($_.Exception.Message)"
        return $false
    }
}

function Clear-Port($port) {
    Write-Host "Checking port $port..."
    $pids = Get-PidsByPort -port $port
    
    if ($pids.Count -gt 0) {
        Write-Host "Port $port is occupied by PIDs: $($pids -join ', '). Stopping processes..."
        foreach ($pid in $pids) {
            Stop-ProcessByPid -pid $pid
        }
        
        # 等待进程完全停止
        Start-Sleep -Seconds 2
        
        # 再次检查端口是否清理成功
        $remainingPids = Get-PidsByPort -port $port
        if ($remainingPids.Count -gt 0) {
            Write-Host "Warning: Port $port still occupied by PIDs: $($remainingPids -join ', ')"
            return $false
        } else {
            Write-Host "Port $port cleared successfully."
            return $true
        }
    } else {
        Write-Host "Port $port is available."
        return $true
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root '.vxture_pids.json'

Write-Host "Starting vxture development servers..."

Write-Host "Checking and clearing ports if necessary..."
$frontendCleared = Clear-Port -port $FrontendPort
$backendCleared = Clear-Port -port $BackendPort

if (-not $frontendCleared -or -not $backendCleared) {
    Write-Host "Warning: Some ports could not be cleared. Proceeding anyway..."
}

Write-Host "Launching services (detached) - recording to $pidFile"

# Launch frontend detached via cmd start (ensures no prompt blocks current shell)
$frontendCmdArg = ("cd `"{0}`"; pnpm dev" -f $root)

Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory $root -PassThru -WindowStyle Minimized

# 启动后端 (FastAPI) - 假设 dev:api 能正确激活.venv

Start-Sleep -Seconds 10

# Launch backend detached
$backendCmdArg = ("cd `"{0}`"; pnpm dev:api" -f $root)
Start-Process -FilePath "pnpm" -ArgumentList "dev:api" -WorkingDirectory $root -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 10

$frontendPids = Get-PidsByPort -port $FrontendPort
$backendPids = Get-PidsByPort -port $BackendPort

$data = [ordered]@{
    startedAt = (Get-Date).ToString('o')
    frontend = @{ pids = $frontendPids; requestedPort = $FrontendPort }
    backend = @{ pids = $backendPids; requestedPort = $BackendPort }
}

try { Write-JsonFile -path $pidFile -obj $data } catch { Write-Host ("Warning: failed writing {0}: {1}" -f $pidFile, $_) }

Write-Host "Started (detached). Frontend PIDs:$($data.frontend.pids -join ',') Backend PIDs:$($data.backend.pids -join ',')"
Write-Host "If ports are occupied, Next.js may use an alternate port. Use stop-dev.ps1 to cleanup."
Write-Host "Development servers are running in background. Check task manager or use stop-dev.ps1 to stop them."
