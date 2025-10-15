# 安装 .vscode/extensions-list.txt 中列出的 VS Code 扩展（Windows PowerShell）
# 用法：在项目根运行：powershell -ExecutionPolicy Bypass -File .\scripts\install-vscode-extensions.ps1

$extensions = Get-Content -Path ".vscode/extensions-list.txt" | Where-Object { $_ -and $_ -ne "" }
foreach ($ext in $extensions) {
    Write-Host "Installing extension: $ext"
    code --install-extension $ext --force
}

Write-Host "All extensions installed."
