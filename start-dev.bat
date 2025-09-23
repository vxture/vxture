@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
set ROOT_DIR=%~dp0
set FRONT_PORT=3000
set BACK_PORT=8000

echo ====================================
echo   启动 Vxture 全栈开发环境
echo ====================================
echo.

REM 检查并清理端口占用
for %%P in (%FRONT_PORT% %BACK_PORT%) do (
	netstat -ano | findstr ":%%P" >nul
	if !errorlevel! equ 0 (
		echo ⚠️  端口 %%P 已被占用，尝试自动清理...
		for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P"') do (
			echo   -> 终止 PID %%a
			taskkill /F /PID %%a >nul 2>&1
		)
		timeout /t 1 >nul
	)
)

REM 检查前端是否已运行
set FRONT_RUNNING=0
netstat -ano | findstr ":%FRONT_PORT%" >nul && set FRONT_RUNNING=1
if %FRONT_RUNNING%==1 (
	echo ⚠️  前端服务已在运行 (端口 %FRONT_PORT%)，跳过启动。
) else (
	echo 🚀 启动 Next.js 前端服务...
	start "Vxture Frontend" cmd /k "cd /d "%ROOT_DIR%" && pnpm dev"
	echo ✅ 前端服务正在启动于: http://localhost:%FRONT_PORT%
)

REM 检查后端是否已运行
set BACK_RUNNING=0
netstat -ano | findstr ":%BACK_PORT%" >nul && set BACK_RUNNING=1
if %BACK_RUNNING%==1 (
	echo ⚠️  后端服务已在运行 (端口 %BACK_PORT%)，跳过启动。
) else (
	echo 🚀 启动 FastAPI 后端服务...
	start "Vxture Backend" cmd /k "cd /d "%ROOT_DIR%" && pnpm dev:api"
	echo ✅ 后端服务正在启动于: http://localhost:%BACK_PORT%
	echo 📚 API 文档: http://localhost:%BACK_PORT%/docs
)

echo.
echo ====================================
echo   启动流程已完成！ 
echo   如需停止服务请运行 stop-dev.bat
echo   按任意键关闭本窗口...
echo ====================================
pause > nul