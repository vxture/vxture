<#
package-offline.ps1

在 Windows/PowerShell 下将仓库打包为 zip，默认排除 .git 目录。
用法：
  .\scripts\package-offline.ps1 -OutFile ..\vxture-offline.zip -ExcludeNodeModules
#>

param(
  [string]$OutFile = "..\vxture-offline.zip",
  [switch]$ExcludeNodeModules
)

$root = (Resolve-Path ".." ).Path
Write-Host "打包目录: $root"

$temp = Join-Path $env:TEMP "vxture-package"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $temp
New-Item -ItemType Directory -Path $temp | Out-Null

# 复制文件（排除 .git）
Write-Host "复制仓库文件到临时目录（排除 .git）..."
robocopy $root $temp *.* /E /XD "$root\.git" | Out-Null

if ($ExcludeNodeModules) {
  Write-Host "从临时目录中移除 node_modules（如果存在）"
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $temp 'packages\web\node_modules')
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $temp 'node_modules')
}

Write-Host "创建 Zip: $OutFile"
if (Test-Path $OutFile) { Remove-Item $OutFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($temp, (Resolve-Path $OutFile).Path)

Write-Host "打包完成：$(Resolve-Path $OutFile)"

Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $temp
