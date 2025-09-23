param(
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 8000
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root '.vxture_pids.json'

function KillPid([int]$procId) {
    if (-not $procId) { return }
    Write-Host "Attempting to stop PID $procId"
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "Found process object: $($proc.Id) $($proc.ProcessName) - trying Stop-Process"
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "Stop-Process succeeded for $procId"
        } catch {
            Write-Host "Stop-Process failed for $procId"
            Write-Host "Exception:" $_
        }
    } else {
        Write-Host "No process object for PID $procId (Get-Process returned nothing)"
    }

    # Aggressive fallback: always run taskkill and print its output for diagnostics
    try {
        $cmd = "taskkill /PID {0} /F" -f $procId
        Write-Host "Running: $cmd"
        $tkOut = & cmd /c $cmd 2>&1
        if ($tkOut) { $tkOut | ForEach-Object { Write-Host $_ } }
    } catch {
        Write-Host "taskkill invocation failed: $_"
    }
}

function PidsByPort([int]$port) {
    $out = @()
    # 1) Try Get-NetTCPConnection
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
        foreach ($c in $conns) { if ($c.OwningProcess) { $out += [int]$c.OwningProcess } }
    } catch {
        # ignore
    }

    # 2) Fallback to netstat parsing if still empty - capture any netstat line referencing the port
    if (-not $out) {
        netstat -ano | ForEach-Object {
            $line = $_.ToString().Trim()
            if ($line -match ":$port\b") {
                $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
                $pidStr = $parts[-1]
                if ($pidStr -match '^\d+$') { $out += [int]$pidStr }
            }
        }
    }

    return $out | Select-Object -Unique
}

if (Test-Path $pidFile) {
    try {
        $j = Get-Content $pidFile -Raw | ConvertFrom-Json
        if ($j.frontend -and $j.frontend.pids) { foreach ($p in $j.frontend.pids) { KillPid $p } }
        if ($j.backend -and $j.backend.pids)  { foreach ($p in $j.backend.pids)  { KillPid $p } }
    } catch { Write-Host "Warning: cannot read pid file, continuing" }
} else {
    Write-Host "No pid file found, attempting port-based cleanup"
}

$frontendPids = PidsByPort $FrontendPort
$backendPids  = PidsByPort $BackendPort

if ($frontendPids) { Write-Host "Found frontend PIDs: $($frontendPids -join ', ')" } else { Write-Host "No frontend PIDs found." }
if ($backendPids)  { Write-Host "Found backend PIDs: $($backendPids -join ', ')" }  else { Write-Host "No backend PIDs found." }

foreach ($p in $frontendPids) { KillPid $p }
foreach ($p in $backendPids)  { KillPid $p }

if (Test-Path $pidFile) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue }

Write-Host "Cleanup complete."
