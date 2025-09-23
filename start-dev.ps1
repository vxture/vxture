<#
.SYNOPSIS
    Vxture backend development environment startup script
.DESCRIPTION
    仅启动 FastAPI 后端开发服务
    - 检查 Python 依赖
    - 清理端口冲突
    - 后台启动服务
    - 记录进程信息
.PARAMETER BackendPort
    后端服务端口，默认 8000
.PARAMETER SkipDependencyCheck
    跳过依赖检查（加速启动）
.EXAMPLE
    .\start-dev.ps1
    .\start-dev.ps1 -BackendPort 8001
    .\start-dev.ps1 -SkipDependencyCheck
#>

param(
    [int]$BackendPort = 8000,
    [switch]$SkipDependencyCheck
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root '.vxture_pids.json'
$apiDir = Join-Path $root 'packages\api'

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $colors = @{
        "Red"     = [ConsoleColor]::Red
        "Green"   = [ConsoleColor]::Green
        "Yellow"  = [ConsoleColor]::Yellow
        "Cyan"    = [ConsoleColor]::Cyan
        "Magenta" = [ConsoleColor]::Magenta
        "White"   = [ConsoleColor]::White
    }
    $colorValue = $colors[$Color]
    if ($null -eq $colorValue) { $colorValue = [ConsoleColor]::White }
    Write-Host $Message -ForegroundColor $colorValue
}

function Write-JsonFile {
    param(
        [string]$path,
        [object]$obj
    )
    try {
        $json = $obj | ConvertTo-Json -Depth 5
        Set-Content -Path $path -Value $json -Encoding UTF8
        return $true
    }
    catch {
        Write-ColorOutput "Warning: Cannot write to $path - $($_.Exception.Message)" "Yellow"
        return $false
    }
}

function Get-PidsByPort {
    param([int]$port)
    try {
        $pids = @()
        $netstatOutput = netstat -ano | Select-String ":$port\s"
        foreach ($line in $netstatOutput) {
            $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
            if ($parts.Length -ge 5) {
                $pidStr = $parts[-1]
                if ($pidStr -match '^\d+$') {
                    $pids += [int]$pidStr
                }
            }
        }
        return $pids | Select-Object -Unique
    }
    catch {
        Write-ColorOutput "Warning: Cannot check port $port - $($_.Exception.Message)" "Yellow"
        return @()
    }
}

function Stop-ProcessByPid {
    param([int]$pid)
    try {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            $processName = $process.ProcessName
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-ColorOutput "Stopped process: $processName (PID: $pid)" "Green"
            return $true
        }
        else {
            Write-ColorOutput "Process PID $pid does not exist" "Yellow"
            return $false
        }
    }
    catch {
        Write-ColorOutput "Cannot stop process PID $pid - $($_.Exception.Message)" "Red"
        return $false
    }
}

function Clear-Port {
    param(
        [int]$port,
        [string]$serviceName
    )
    Write-ColorOutput "Checking $serviceName port $port..." "Cyan"
    $pids = Get-PidsByPort -port $port
    if ($pids.Count -gt 0) {
        Write-ColorOutput "Port $port is occupied by processes: $($pids -join ', ')" "Yellow"
        Write-ColorOutput "Stopping conflicting processes..." "Yellow"
        foreach ($pid in $pids) { Stop-ProcessByPid -pid $pid | Out-Null }
        Start-Sleep -Seconds 3
        $remainingPids = Get-PidsByPort -port $port
        if ($remainingPids.Count -eq 0) {
            Write-ColorOutput "Port $port cleared successfully" "Green"
            return $true
        }
        else {
            Write-ColorOutput "Port $port still occupied by: $($remainingPids -join ', ')" "Yellow"
            return $false
        }
    }
    else {
        Write-ColorOutput "Port $port is available" "Green"
        return $true
    }
}

function Test-Dependencies {
    Write-ColorOutput "Checking backend development environment dependencies..." "Cyan"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-ColorOutput "Refreshed PATH environment variable for current session." "Green"
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            Write-ColorOutput "Python: $pythonVersion" "Green"
        }
        else {
            throw "Python not installed"
        }
    }
    catch {
        Write-ColorOutput "Python not found, please install Python 3.11+ first" "Red"
        return $false
    }
    if (-not (Test-Path $apiDir)) {
        Write-ColorOutput "Backend directory does not exist: $apiDir" "Red"
        return $false
    }
    Write-ColorOutput "Backend environment check passed" "Green"
    return $true
}

function Start-Backend {
    Write-ColorOutput "Starting backend service (FastAPI)..." "Cyan"
    try {
        $envSetup = '$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")'
        $command = "$envSetup; cd '$root'; pnpm dev:api"
        $backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command", $command -PassThru
        if ($backendProcess) {
            Write-ColorOutput "Backend service starting... PID: $($backendProcess.Id)" "Green"
            return $backendProcess.Id
        }
        else {
            throw "Cannot start backend process"
        }
    }
    catch {
        Write-ColorOutput "Backend startup failed: $($_.Exception.Message)" "Red"
        return $null
    }
}

function Wait-ForBackend {
    Write-ColorOutput "Waiting for backend service to start..." "Cyan"
    $maxWaitTime = 60
    $waitInterval = 2
    $elapsed = 0
    while ($elapsed -lt $maxWaitTime) {
        Start-Sleep -Seconds $waitInterval
        $elapsed += $waitInterval
        $backendPids = Get-PidsByPort -port $BackendPort
        $backendReady = $backendPids.Count -gt 0
        $backendStatus = if ($backendReady) { "OK" } else { "STARTING" }
        Write-ColorOutput "Checking backend status... $backendStatus ($elapsed/${maxWaitTime}s)" "Cyan"
        if ($backendReady) {
            return @{
                backend = $backendPids
                success = $true
            }
        }
    }
    Write-ColorOutput "Backend startup timeout, but process may still be starting" "Yellow"
    return @{
        backend = (Get-PidsByPort -port $BackendPort)
        success = $false
    }
}

function Main {
    Write-ColorOutput "Vxture Backend Development Startup Script" "Magenta"
    Write-ColorOutput ("=" * 50) "Magenta"
    if (-not $SkipDependencyCheck) {
        if (-not (Test-Dependencies)) {
            Write-ColorOutput "Dependency check failed, please fix and retry" "Red"
            exit 1
        }
    }
    else {
        Write-ColorOutput "Skipping dependency check" "Yellow"
    }
    $backendPortClear = Clear-Port -port $BackendPort -serviceName "backend"
    if (-not $backendPortClear) {
        Write-ColorOutput "Backend port failed to clear, continuing startup..." "Yellow"
    }
    Write-ColorOutput ""
    Write-ColorOutput "Starting backend development service..." "Cyan"
    $backendPid = Start-Backend
    if (-not $backendPid) {
        Write-ColorOutput "Backend service failed to start" "Red"
        exit 1
    }
    $serviceStatus = Wait-ForBackend
    $data = [ordered]@{
        startedAt = (Get-Date).ToString('o')
        ports     = @{ backend = $BackendPort }
        processes = @{
            backend = @{
                initialPid = $backendPid
                activePids = $serviceStatus.backend
            }
        }
        status    = if ($serviceStatus.success) { "ready" } else { "starting" }
    }
    Write-JsonFile -path $pidFile -obj $data | Out-Null
    Write-ColorOutput ""
    Write-ColorOutput "Startup Complete!" "Green"
    Write-ColorOutput ("=" * 50) "Green"
    if ($serviceStatus.backend.Count -gt 0) {
        Write-ColorOutput "Backend service: http://localhost:$BackendPort (PID: $($serviceStatus.backend -join ', '))" "Green"
        Write-ColorOutput "API documentation: http://localhost:$BackendPort/docs" "Green"
    }
    else {
        Write-ColorOutput "Backend service: Starting... (check http://localhost:$BackendPort)" "Yellow"
    }
    Write-ColorOutput ""
    Write-ColorOutput "Usage tips:" "Cyan"
    Write-ColorOutput "   - Stop service: .\stop-dev.ps1" "White"
    Write-ColorOutput "   - View logs: Check terminal or Task Manager" "White"
    Write-ColorOutput "   - Process info: .vxture_pids.json" "White"
    if (-not $serviceStatus.success) {
        Write-ColorOutput ""
        Write-ColorOutput "Note: Service may still be starting, please wait a moment before accessing" "Yellow"
    }
}

try {
    Main
}
catch {
    Write-ColorOutput "Script execution failed: $($_.Exception.Message)" "Red"
    Write-ColorOutput "Please check error information and retry" "Red"
    exit 1
}