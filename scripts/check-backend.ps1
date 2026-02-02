# 检查后端服务状态的 PowerShell 脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  后端服务健康检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:8080"

# 1. 检查后端服务是否运行
Write-Host "[1/4] 检查后端服务..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ 后端服务正常运行" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "  服务名称: $($content.service)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ 后端服务未运行或无法访问" -ForegroundColor Red
    Write-Host "  请确保后端服务已启动: cd D:\github\goX2pay && go run cmd/api/main.go" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. 检查数据库连接
Write-Host "[2/4] 检查数据库连接..." -ForegroundColor Yellow
# 这里可以添加数据库连接检查的逻辑
Write-Host "✓ 数据库连接检查跳过（需要后端提供专门的端点）" -ForegroundColor Gray

Write-Host ""

# 3. 检查 Redis 连接
Write-Host "[3/4] 检查 Redis 连接..." -ForegroundColor Yellow
# 这里可以添加 Redis 连接检查的逻辑
Write-Host "✓ Redis 连接检查跳过（需要后端提供专门的端点）" -ForegroundColor Gray

Write-Host ""

# 4. 测试登录接口
Write-Host "[4/4] 测试登录接口..." -ForegroundColor Yellow
try {
    $loginData = @{
        userName = "admin@example.com"
        password = "password123"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/login" -Method POST -Body $loginData -Headers $headers -TimeoutSec 5
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ 登录接口正常" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        if ($content.token) {
            Write-Host "  Token 已生成" -ForegroundColor Gray
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✓ 登录接口正常（凭据无效是预期的）" -ForegroundColor Green
    } else {
        Write-Host "✗ 登录接口异常: $statusCode" -ForegroundColor Red
        Write-Host "  错误信息: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  检查完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后端服务地址: $backendUrl" -ForegroundColor Gray
Write-Host "API 文档地址: $backendUrl/swagger/index.html" -ForegroundColor Gray
Write-Host ""
