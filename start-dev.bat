@echo off
chcp 65001 > nul

set "API_DIR=%~dp0packages\api"
set "WEB_DIR=%~dp0packages\web"
set "BACKEND_PID_FILE=%~dp0.vxture_backend.pid"
set "FRONTEND_PID_FILE=%~dp0.vxture_frontend.pid"

echo ====================================
echo   Start Vxture Full Stack Dev Env
echo ====================================
echo.

echo Starting backend...
REM Start backend and record PID for safe stop
powershell -Command ^
    "$p = Start-Process -FilePath '%API_DIR%\.venv\Scripts\python.exe' -ArgumentList '\"%API_DIR%\start_dev.py\"' -WindowStyle Hidden -PassThru; $p.Id | Out-File -Encoding ascii '%BACKEND_PID_FILE%'"

echo Backend is starting at: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo.

echo Starting frontend...
REM Start frontend and record PID for safe stop
powershell -Command ^
    "cd '%WEB_DIR%'; $p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c pnpm dev' -WindowStyle Hidden -PassThru; $p.Id | Out-File -Encoding ascii '%FRONTEND_PID_FILE%'"

echo Frontend is starting at: http://localhost:3000
echo.

echo ====================================
echo   Both services are starting...
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:3000
echo   You can safely close this window.
echo ====================================

echo.
echo To stop all services, run: stop-dev.bat