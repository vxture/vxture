<#
setup-dev.ps1

一键初始化开发环境（Windows/PowerShell）

用途：
    - 为新开发者或 CI 环境尽可能自动化准备项目运行所需的本地工具与依赖。
    - 该脚本优先使用 Volta 管理 Node 与 pnpm（更安全、可重复），在不可用时退回到全局安装策略。

主要步骤（顺序执行）：
    1. 安装 / 验证 Volta（可选，优先推荐）
    2. 使用 Volta 安装 Node@18 与 pnpm（或在无 Volta 时尝试全局安装 pnpm）
    3. 运行 `pnpm install` 安装前端依赖（可通过 -SkipPackages 跳过）
    4. 创建 Python 虚拟环境 `.venv` 并安装 `requirements.txt`
    5. 可选：调用 `scripts/install-vscode-extensions.ps1` 批量安装 VS Code 扩展

用法示例：
    # 在仓库根目录执行（PowerShell）
    .\scripts\setup-dev.ps1

参数：
    -SkipExtensions  : 跳过 VS Code 扩展安装步骤
    -SkipPackages    : 跳过 pnpm install（仅设置运行时/venv）

注意事项：
    - 部分操作（如全局 npm 安装）可能需要管理员权限。
    - 在受限网络或组织策略下自动安装可能失败；脚本将以警告提示并尽量继续其他步骤。
#>

param(
    [switch]$SkipExtensions,
    [switch]$SkipPackages
)

Write-Host "== vxture: 初始化开发环境脚本 (Windows) =="

function Install-Volta {
        <#
        Install-Volta

        功能：检测并尝试安装 Volta（Node 版本管理器）。
        - 如果 Volta 已存在，函数直接返回。
        - 如果未安装，尝试从官方脚本加载并执行安装。
        副作用：可能会修改用户 PATH（取决于 Volta 安装行为）。
        #>

        [CmdletBinding()]
        param()

        # 如果 Volta 可用，直接退出（保持幂等）
        if (Get-Command volta -ErrorAction SilentlyContinue) {
                Write-Host "Volta 已存在：$(volta --version)"
                return
        }

        Write-Host "检测到未安装 Volta，正在安装..."

        # 尝试从官方地址获取安装脚本：优先使用 Invoke-RestMethod（更适合获取纯文本），
        # 若失败再退回到 Invoke-WebRequest。
        $scriptContent = $null
        try {
                $scriptContent = Invoke-RestMethod -Uri 'https://get.volta.sh' -ErrorAction Stop
        } catch {
                try {
                        $resp = Invoke-WebRequest -Uri 'https://get.volta.sh' -ErrorAction Stop
                        $scriptContent = $resp.Content
                } catch {
                        # 网络或策略限制导致下载失败，记录警告并返回
                        Write-Warning "无法下载 Volta 安装脚本，请手动访问 https://volta.sh/ 安装。错误：$($_.Exception.Message)"
                        return
                }
        }

        # 若成功获取脚本内容，则执行安装（使用 Invoke-Expression，避免别名 iex）
        if ($null -ne $scriptContent -and $scriptContent.ToString().Trim().Length -gt 0) {
                try {
                        Invoke-Expression -Command $scriptContent
                        # 安装后尝试刷新 PATH（合并 Machine/User PATH），以便在当前会话中尽可能立即可用
                        $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
                } catch {
                        Write-Warning "执行 Volta 安装脚本失败：$($_.Exception.Message)"
                }
        } else {
                Write-Warning "未取得有效的安装脚本内容，跳过自动安装。"
        }

        # 最后验证 Volta 是否已正确安装
        if (Get-Command volta -ErrorAction SilentlyContinue) {
                Write-Host "Volta 安装成功：$(volta --version)"
        } else {
                Write-Warning "Volta 似乎未成功安装。请手动安装：https://volta.sh/"
        }
}

function Install-NodeAndPnpm {
    <#
    Install-NodeAndPnpm

    功能：安装 Node.js（通过 Volta）并确保 pnpm 可用。
    参数：$nodeVersion - 要安装的 Node 主要版本（默认 '18'）。
    行为：
      - 若 Volta 可用：使用 volta 安装指定的 node 版本与 pnpm（推荐）。
      - 若 Volta 不可用：尝试全局安装 pnpm（可能需管理员权限）。
    #>

    param($nodeVersion = '18')

    if (Get-Command volta -ErrorAction SilentlyContinue) {
        Write-Host "通过 Volta 安装 Node 和 pnpm"
        # 使用 Volta 来保证版本一致性并避免全局权限问题
        volta install node@$nodeVersion
        volta install pnpm
        return
    }

    # 没有 Volta 的情况下，尝试以全局方式安装 pnpm（谨慎执行）
    Write-Warning "Volta 不可用，尝试全局安装 pnpm（可能需要管理员权限）"
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if ($isAdmin) {
        Write-Host "以管理员权限安装 pnpm..."
        npm install -g pnpm
    } else {
        Write-Host "当前非管理员，尝试以提升权限运行 npm 安装（将弹出 UAC 提示）"
        try {
            # 使用 Start-Process -Verb RunAs 请求提升权限执行 npm 安装
            Start-Process -FilePath "npm" -ArgumentList "install","-g","pnpm" -Verb RunAs -Wait
        } catch {
            Write-Warning "无法以管理员权限执行安装。请以管理员身份运行 PowerShell 然后手动执行：npm install -g pnpm"
        }
    }

    # 验证 pnpm 是否安装成功
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        Write-Host "pnpm 已安装：$(pnpm --version)"
    } else {
        Write-Warning "pnpm 安装未成功。可考虑手动安装或使用 Volta：https://volta.sh/"
    }
}

function Install-PythonVenv {
    <#
    Install-PythonVenv

    功能：在仓库根创建或重用 `.venv` 虚拟环境，并使用其 pip 安装 requirements.txt 中的依赖。
    细节：Windows 下虚拟环境的 pip 路径通常为 `.venv\Scripts\pip.exe`，Unix 为 `.venv/bin/pip`，本函数以 Windows 为优先路径检测。
    #>

    $venvPath = Join-Path $PSScriptRoot '..' '.venv'
    $venvScripts = Join-Path $venvPath 'Scripts'

    if (-Not (Test-Path $venvPath)) {
        Write-Host "创建 Python 虚拟环境 (.venv)"
        try {
            python -m venv $venvPath
        } catch {
            Write-Warning "创建 Python 虚拟环境失败：$($_.Exception.Message)"
            return
        }
    } else {
        Write-Host "虚拟环境已存在：$venvPath"
    }

    # Windows 优先查找 pip.exe；若不存在，可提示用户在 Unix 下激活 venv 并使用 pip
    $pip = Join-Path $venvScripts 'pip.exe'
    if (Test-Path $pip) {
        Write-Host "使用虚拟环境安装 Python 依赖 requirements.txt"
        try {
            & $pip install -r (Join-Path $PSScriptRoot '..' 'requirements.txt')
        } catch {
            Write-Warning "安装 Python 依赖失败：$($_.Exception.Message)"
        }
    } else {
        Write-Warning "未找到虚拟环境的 pip，可手动激活 venv 并安装依赖"
    }
}

# --- 执行区 ---
<#
执行区：
  - 切换至脚本目录，再切换到仓库根执行各项安装/配置步骤。
  - 保持幂等性：重复运行不会重复破坏环境。
#>
Push-Location $PSScriptRoot
Set-Location (Resolve-Path ..)

# --- 尝试安装或验证 Volta（若网络/策略允许） ---
Install-Volta

# --- 确保 Node 与 pnpm 可用 ---
Install-NodeAndPnpm -nodeVersion '18'

# --- 可选：安装前端依赖（可通过 -SkipPackages 跳过） ---
if (-not $SkipPackages) {
    Write-Host "运行 pnpm install..."
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install
    } else {
        Write-Warning "pnpm 未安装，无法执行 pnpm install"
    }
}

# --- 创建并安装 Python 依赖 ---
Install-PythonVenv

# --- 可选：安装 VS Code 扩展 ---
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
