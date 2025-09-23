@echo off
chcp 65001 > nul

echo ====================================
echo   Stop Vxture Backend Dev Service
echo ====================================
echo.

REM Kill all uvicorn/start_dev.py related processes (including reload mode)
powershell -NoProfile -Command ^
    "Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -match 'uvicorn') -or ($_.CommandLine -match 'start_dev.py') } | ForEach-Object { Write-Host ('Killing PID ' + $_.ProcessId + ': ' + $_.CommandLine); Stop-Process -Id $_.ProcessId -Force }"

echo.
echo ====================================
echo   Backend service stopped.
echo ====================================
pause



