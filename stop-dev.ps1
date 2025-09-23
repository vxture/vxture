Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -match "uvicorn" -or $_.CommandLine -match "start_dev.py"
} | ForEach-Object {
    Write-Host "Killing PID $($_.ProcessId): $($_.CommandLine)"
    Stop-Process -Id $_.ProcessId -Force
}