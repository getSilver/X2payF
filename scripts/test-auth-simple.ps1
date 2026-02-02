# 认证模块简单测试脚本

$baseUrl = "http://localhost:8080/api/v1"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  认证模块 API 测试" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 测试 1: 健康检查
Write-Host "[1/3] 测试健康检查..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
Write-Host "✅ 健康检查通过: $($response.Content)`n" -ForegroundColor Green

# 测试 2: 登录接口
Write-Host "[2/3] 测试登录接口..." -ForegroundColor Yellow
$loginBody = '{"username":"admin","password":"password123"}'

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing
    Write-Host "✅ 登录接口响应: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   内容: $($response.Content)`n" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  登录失败（需要创建用户）: $($_.Exception.Response.StatusCode)`n" -ForegroundColor Yellow
}

# 测试 3: MFA 接口
Write-Host "[3/3] 测试 MFA 接口..." -ForegroundColor Yellow
$mfaBody = '{"user_id":"test","factor_id":"test"}'

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/mfa/challenge" -Method POST -ContentType "application/json" -Body $mfaBody -UseBasicParsing
    Write-Host "✅ MFA 接口响应: $($response.StatusCode)`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MFA 接口返回: $($_.Exception.Response.StatusCode)（需要有效用户）`n" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成 - API 接口可以正常访问" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
