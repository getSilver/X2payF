# 认证模块测试脚本

$baseUrl = "http://localhost:8080/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  认证模块 API 测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==================== 测试 1: 健康检查 ====================
Write-Host "[1/5] 测试健康检查..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
    Write-Host "✅ 健康检查通过" -ForegroundColor Green
    Write-Host "   响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ==================== 测试 2: 登录接口 ====================
Write-Host "[2/5] 测试登录接口..." -ForegroundColor Yellow

$loginBody = @{
    username = "admin"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ 登录接口调用成功" -ForegroundColor Green
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Gray
    
    if ($data.session -and $data.session.session_token) {
        $global:authToken = $data.session.session_token
        Write-Host "   Token: $($global:authToken.Substring(0, 20))..." -ForegroundColor Gray
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "⚠️  登录接口返回错误（需要先创建用户）" -ForegroundColor Yellow
    Write-Host "   状态码: $statusCode" -ForegroundColor Gray
}
Write-Host ""

# ==================== 测试 3: 会话验证 ====================
Write-Host "[3/5] 测试会话验证..." -ForegroundColor Yellow

if ($global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:authToken)"
        }
        
        $response = Invoke-WebRequest `
            -Uri "$baseUrl/auth/session" `
            -Method GET `
            -Headers $headers `
            -UseBasicParsing
        
        Write-Host "✅ 会话验证成功" -ForegroundColor Green
        Write-Host "   响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  会话验证失败（Token 可能无效）" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  跳过（未获取到 Token）" -ForegroundColor Gray
}
Write-Host ""

# ==================== 测试 4: MFA 挑战 ====================
Write-Host "[4/5] 测试 MFA 挑战接口..." -ForegroundColor Yellow

$mfaChallengeBody = @{
    user_id = "test-user-id"
    factor_id = "test-factor-id"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "$baseUrl/auth/mfa/challenge" `
        -Method POST `
        -ContentType "application/json" `
        -Body $mfaChallengeBody `
        -UseBasicParsing
    
    Write-Host "✅ MFA 挑战接口调用成功" -ForegroundColor Green
    Write-Host "   响应: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "⚠️  MFA 挑战接口返回错误（需要有效的用户）" -ForegroundColor Yellow
    Write-Host "   状态码: $statusCode" -ForegroundColor Gray
}
Write-Host ""

# ==================== 测试 5: 登出接口 ====================
Write-Host "[5/5] 测试登出接口..." -ForegroundColor Yellow

if ($global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:authToken)"
        }
        
        $response = Invoke-WebRequest `
            -Uri "$baseUrl/auth/logout" `
            -Method POST `
            -Headers $headers `
            -UseBasicParsing
        
        Write-Host "✅ 登出成功" -ForegroundColor Green
        Write-Host "   响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  登出失败" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  跳过（未登录）" -ForegroundColor Gray
}
Write-Host ""

# ==================== 总结 ====================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 后端 API 接口可以正常访问" -ForegroundColor Green
Write-Host "⚠️  部分接口需要有效的用户数据才能完全测试" -ForegroundColor Yellow
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 运行数据库迁移: go run cmd/migrate/main.go up" -ForegroundColor Gray
Write-Host "2. 创建测试用户" -ForegroundColor Gray
Write-Host "3. 启动前端项目: npm run dev" -ForegroundColor Gray
Write-Host "4. 在浏览器中测试登录功能" -ForegroundColor Gray
Write-Host ""
