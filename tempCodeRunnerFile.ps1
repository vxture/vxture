# 等待服务启动并检测端口
function Wait-ForServices {
    Write-ColorOutput "⏳ 等待服务启动..." "Cyan"
    
    $maxWaitTime = 60  # 最大等待 60 秒
    $waitInterval = 2   # 每 2 秒检查一次
    $elapsed = 0
    
    while ($elapsed -lt $maxWaitTime) {
        Start-Sleep -Seconds $waitInterval
        $elapsed += $waitInterval
        
        $frontendPids = Get-PidsByPort -port $FrontendPort
        $backendPids = Get-PidsByPort -port $BackendPort
        
        $frontendReady = $frontendPids.Count -gt 0
        $backendReady = $backendPids.Count -gt 0
        
        Write-ColorOutput "检查服务状态... 前端: $(if($frontendReady){'✓'}else{'⏳'}) 后端: $(if($backendReady){'✓'}else{'⏳'}) ($elapsed/${maxWaitTime}s)" "Cyan"
        
        if ($frontendReady -and $backendReady) {
            return @{
                frontend = $frontendPids
                backend  = $backendPids
                success  = $true
            }
        }
    }
    
    Write-ColorOutput "⚠️  服务启动超时，但进程可能仍在启动中" "Yellow"
    return @{
        frontend = (Get-PidsByPort -port $FrontendPort)
        backend  = (Get-PidsByPort -port $BackendPort)
        success  = $false
    }
}