<#
setup-dev.ps1

一键在 Windows (PowerShell) 上初始化开发环境：
- 检查并安装 Volta（可选）
- 安装 Node.js (通过 Volta) 和 pnpm
- 创建并激活 Python 虚拟环境并安装 requirements.txt
- 安装项目 VS Code 扩展（调用已有脚本）
- 运行 pnpm install

在 PowerShell（管理员或非管理员均可）中运行：
    .\scripts\setup-dev.ps1
#>

param(
    [switch]$SkipExtensions,
    [switch]$SkipPackages
)

Write-Host "== vxture: 初始化开发环境脚本 (Windows) =="

function Install-Volta {
    if (Get-Command volta -ErrorAction SilentlyContinue) {
        Write-Host "Volta 已存在：$(volta --version)"
        return
    }
    Write-Host "检测到未安装 Volta，正在安装..."
    $script = Invoke-WebRequest -Uri 'https://get.volta.sh' -UseBasicParsing
    if ($null -ne $script -and $null -ne $script.Content) {
        Invoke-Expression $script.Content
    } else {
        Write-Warning "无法下载 Volta 安装脚本，请手动访问 https://volta.sh/ 安装"
    }
    if (Get-Command volta -ErrorAction SilentlyContinue) {
        Write-Host "Volta 安装成功：$(volta --version)"
    } else {
        Write-Warning "Volta 似乎未成功安装。请手动安装：https://volta.sh/"
    }
}

function Install-NodeAndPnpm {
    param($nodeVersion = '18')
    if (Get-Command volta -ErrorAction SilentlyContinue) {
        Write-Host "通过 Volta 安装 Node 和 pnpm"
        volta install node@$nodeVersion
        volta install pnpm
    } else {
        Write-Warning "Volta 不可用，尝试全局安装 pnpm（可能需要管理员权限）"
        $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        if ($isAdmin) {
            Write-Host "以管理员权限安装 pnpm..."
            npm install -g pnpm
        } else {
            Write-Host "当前非管理员，尝试以提升权限运行 npm 安装（将弹出 UAC 提示）"
            try {
          Start-Process -FilePath "npm" -ArgumentList "install","-g","pnpm" -Verb RunAs -Wait
            } catch {
          Write-Warning "无法以管理员权限执行安装。请以管理员身份运行 PowerShell 然后手动执行：npm install -g pnpm"
            }
        }

        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            Write-Host "pnpm 已安装：$(pnpm --version)"
        } else {
            Write-Warning "pnpm 安装未成功。可考虑手动安装或使用 Volta：https://volta.sh/"
        }
    }
}

function Install-PythonVenv {
    $venvPath = Join-Path $PSScriptRoot '..' '.venv'
    $venvScripts = Join-Path $venvPath 'Scripts'
    if (-Not (Test-Path $venvPath)) {
        Write-Host "创建 Python 虚拟环境 (.venv)"
        python -m venv $venvPath
    } else {
        Write-Host "虚拟环境已存在：$venvPath"
    }
    $pip = Join-Path $venvScripts 'pip.exe'
    if (Test-Path $pip) {
        Write-Host "使用虚拟环境安装 Python 依赖 requirements.txt"
        & $pip install -r (Join-Path $PSScriptRoot '..' 'requirements.txt')
    } else {
        Write-Warning "未找到虚拟环境的 pip，可手动激活 venv 并安装依赖"
    }
}

# --- 执行区 ---
Push-Location $PSScriptRoot
Set-Location (Resolve-Path ..)

Install-Volta
Install-NodeAndPnpm -nodeVersion '18'

if (-not $SkipPackages) {
    Write-Host "运行 pnpm install..."
    pnpm install
}

Install-PythonVenv

if (-not $SkipExtensions) {
    $extScript = Join-Path $PSScriptRoot 'install-vscode-extensions.ps1'
    if (Test-Path $extScript) {
        Write-Host "安装 VS Code 扩展（可能需要稍长时间）"
        & $extScript
    } else {
        Write-Warning "扩展安装脚本不存在：$extScript"
    }
}

Write-Host "初始化完成。建议：重启你的终端以确保 Volta 生效，然后运行 pnpm dev 或 .\start-dev-frontend.ps1/.\start-dev-backend.ps1 启动服务。"

Pop-Location
