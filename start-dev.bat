@echo off
chcp 65001 > nul

set "TARGET_DIR=%~dp0packages\api"
set "PID_FILE=%~dp0.vxture_backend.pid"

echo ====================================
echo   Start Vxture Backend Dev Env
echo ====================================
echo.

REM Start backend and record PID for safe stop
powershell -Command ^
    "$p = Start-Process -FilePath '%TARGET_DIR%\.venv\Scripts\python.exe' -ArgumentList '\"%TARGET_DIR%\start_dev.py\"' -WindowStyle Hidden -PassThru; $p.Id | Out-File -Encoding ascii '%PID_FILE%'"

echo Backend is starting at: http://localhost:8000
echo API docs: http://localhost:8000/docs

echo.
echo ====================================
echo   Startup process completed!
echo   You can safely close this window.
echo ====================================