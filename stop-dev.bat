@echo off
rem Vxture 一键停止（BAT） - 通过端口查找并终止进程
set ROOT_DIR=%~dp0
set FRONT_PORT=3000
set BACK_PORT=8000

echo Stopping services by port lookup...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONT_PORT% "') do (
    echo Killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACK_PORT% "') do (
    echo Killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Also attempting to kill helper windows named 'Vxture Frontend' and 'Vxture Backend'
taskkill /FI "WINDOWTITLE eq Vxture Frontend" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Vxture Backend" /T /F >nul 2>&1

echo Cleanup complete.
@echo off
echo ==============================================
echo 🛑 Vxture 开发环境一键停止
echo ==============================================

echo 🔍 检查运行中的服务...

echo 📱 停止前端服务器 (Node.js进程)...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ 前端服务器已停止
) else (
    echo ℹ️  未发现运行中的前端服务器
)

echo 🚀 停止后端API服务器 (Python进程)...
taskkill /F /IM python.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ 后端API服务器已停止
) else (
    echo ℹ️  未发现运行中的后端服务器
)

echo 🧹 清理相关进程...
taskkill /F /FI "WINDOWTITLE eq Vxture-Frontend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Vxture-Backend*" 2>nul

echo 🔌 检查端口占用状态...
echo 端口 3000:
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口3000仍有占用
    netstat -ano | findstr ":3000"
) else (
    echo ✅ 端口3000已释放
)

echo 端口 8000:
netstat -ano | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口8000仍有占用
    netstat -ano | findstr ":8000"
) else (
    echo ✅ 端口8000已释放
)

echo.
echo ✅ 清理完成！所有开发服务已停止
echo 💡 使用 start-dev.bat 来启动所有服务
echo ==============================================
pause
