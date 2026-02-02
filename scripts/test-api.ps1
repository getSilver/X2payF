# API 测试脚本

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Username = "admin@example.com",
    [string]$Password = "password123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API 接口测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$token = $null

# 辅助函数：发送 API 请求
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$RequireAuth = $false
    )

    $uri = "$BaseUrl$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }

    if ($RequireAuth -and $token) {
        $headers["Authorization"] = "Bearer $token"
    }

    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }

        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Data = ($response.Content | ConvertFrom-Json)
        }
    } catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
    }
}

# 测试 1: 健康检查
Write-Host "[测试 1] 健康检查" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/health"
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "  响应: $($result.Data | ConvertTo-Json -Compress)" -ForegroundColor Gray
} else {
    Write-Host "✗ 失败: $($result.Error)" -ForegroundColor Red
}
Write-Host ""

# 测试 2: 登录
Write-Host "[测试 2] 用户登录" -ForegroundColor Yellow
$loginData = @{
    userName = $Username
    password = $Password
}
$result = Invoke-ApiRequest -Method POST -Endpoint "/api/v1/auth/login" -Body $loginData
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
    $token = $result.Data.token
    Write-Host "  Token: $($token.Substring(0, [Math]::Min(20, $token.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "✗ 失败 (状态码: $($result.StatusCode))" -ForegroundColor Red
    Write-Host "  错误: $($result.Error)" -ForegroundColor Yellow
}
Write-Host ""

# 如果登录失败，后续测试跳过
if (-not $token) {
    Write-Host "登录失败，跳过需要认证的测试" -ForegroundColor Yellow
    exit 1
}

# 测试 3: 获取支付列表
Write-Host "[测试 3] 获取支付列表" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/api/v1/payments?page=1&page_size=10" -RequireAuth $true
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
    if ($result.Data.items) {
        Write-Host "  记录数: $($result.Data.items.Count)" -ForegroundColor Gray
        Write-Host "  总数: $($result.Data.total)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ 失败 (状态码: $($result.StatusCode))" -ForegroundColor Red
    Write-Host "  错误: $($result.Error)" -ForegroundColor Yellow
}
Write-Host ""

# 测试 4: 获取渠道列表
Write-Host "[测试 4] 获取渠道列表" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/api/v1/channels?page=1&page_size=10" -RequireAuth $true
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
    if ($result.Data.items) {
        Write-Host "  记录数: $($result.Data.items.Count)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ 失败 (状态码: $($result.StatusCode))" -ForegroundColor Red
    Write-Host "  错误: $($result.Error)" -ForegroundColor Yellow
}
Write-Host ""

# 测试 5: 获取商户列表
Write-Host "[测试 5] 获取商户列表" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/api/v1/merchants?page=1&page_size=10" -RequireAuth $true
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
    if ($result.Data.items) {
        Write-Host "  记录数: $($result.Data.items.Count)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ 失败 (状态码: $($result.StatusCode))" -ForegroundColor Red
    Write-Host "  错误: $($result.Error)" -ForegroundColor Yellow
}
Write-Host ""

# 测试 6: 获取 MFA 因子列表
Write-Host "[测试 6] 获取 MFA 因子列表" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method GET -Endpoint "/api/v1/mfa/factors" -RequireAuth $true
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
    if ($result.Data) {
        Write-Host "  因子数: $($result.Data.Count)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ 失败 (状态码: $($result.StatusCode))" -ForegroundColor Red
    Write-Host "  错误: $($result.Error)" -ForegroundColor Yellow
}
Write-Host ""

# 测试 7: 登出
Write-Host "[测试 7] 用户登出" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method POST -Endpoint "/api/v1/auth/logout" -RequireAuth $true
if ($result.Success) {
    Write-Host "✓ 通过 (状态码: $($result.StatusCode))" -ForegroundColor Green
} else {
    Write-Host "✗ 失败 (状态码: $($result.StatusCode))" -ForegroundColor Red
    Write-Host "  错误: $($result.Error)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
