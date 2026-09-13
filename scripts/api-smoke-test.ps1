$ErrorActionPreference = 'Stop'

if (-not $env:API_BASE_URL) { throw 'Set API_BASE_URL to the deployed app URL before running this script.' }
$baseUrl = $env:API_BASE_URL.TrimEnd('/')
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "smoke+$timestamp@example.com"
$password = if ($env:SMOKE_TEST_PASSWORD) { $env:SMOKE_TEST_PASSWORD } else { 'TestPass123!' }

function Invoke-CurlJson {
  param(
    [Parameter(Mandatory)] [ValidateSet('GET', 'POST', 'PATCH', 'DELETE')] [string] $Method,
    [Parameter(Mandatory)] [string] $Path,
    [string] $Body,
    [string] $Token
  )

  $headers = @('-H', 'Content-Type: application/json')
  if ($Token) { $headers += @('-H', "Authorization: Bearer $Token") }
  $arguments = @('-sS', '-w', "`nHTTP_STATUS:%{http_code}", '-X', $Method, "$baseUrl$Path") + $headers
  $bodyFile = $null
  if ($Body) {
    $bodyFile = Join-Path ([IO.Path]::GetTempPath()) "grandmas-lunchbox-$([Guid]::NewGuid()).json"
    [IO.File]::WriteAllText($bodyFile, $Body)
    $arguments += @('--data-binary', "@$bodyFile")
  }

  try {
    $raw = & curl.exe @arguments
  } finally {
    if ($bodyFile) { Remove-Item $bodyFile -Force -ErrorAction SilentlyContinue }
  }
  $statusLine = $raw | Select-String -Pattern 'HTTP_STATUS:\d+$' | Select-Object -Last 1
  $status = [int](($statusLine.Line -split ':')[1])
  $jsonText = ($raw -join "`n") -replace "`r?`nHTTP_STATUS:\d+$", ''

  Write-Host "$Method $Path -> HTTP $status"
  if ($status -ge 400) { Write-Host $jsonText; throw "Request failed: $Method $Path" }
  if ($jsonText) { return ($jsonText | ConvertFrom-Json) }
}

$signupBody = @{
  email = $email
  name = 'API Smoke User'
  phone = '9876543210'
  password = $password
} | ConvertTo-Json -Compress

$signup = Invoke-CurlJson -Method POST -Path '/api/auth/signup' -Body $signupBody
$token = $signup.token
if (-not $token) { throw 'Signup did not return a token' }

$loginBody = @{ email = $email; password = $password } | ConvertTo-Json -Compress
$login = Invoke-CurlJson -Method POST -Path '/api/auth/login' -Body $loginBody
$token = $login.token

Invoke-CurlJson -Method GET -Path '/api/auth/me' -Token $token | Out-Null
$bookingBody = @{
  mealType = 'veg'
  planType = 'trial'
  name = 'API Smoke User'
  phone = '9876543210'
  email = $email
  pickupPoint = 'Main Gate'
} | ConvertTo-Json -Compress

$bookingResponse = Invoke-CurlJson -Method POST -Path '/api/bookings' -Body $bookingBody -Token $token
$booking = $bookingResponse.booking
$bookingsResponse = Invoke-CurlJson -Method GET -Path '/api/bookings' -Token $token
$booking = $bookingsResponse.bookings | Where-Object { $_.orderId -eq $booking.orderId } | Select-Object -First 1

if ($booking._id) {
  Invoke-CurlJson -Method GET -Path "/api/bookings/$($booking._id)" -Token $token | Out-Null
  $updateBody = @{ paymentStatus = 'paid' } | ConvertTo-Json -Compress
  Invoke-CurlJson -Method PATCH -Path "/api/bookings/$($booking._id)" -Body $updateBody -Token $token | Out-Null
  Invoke-CurlJson -Method DELETE -Path "/api/bookings/$($booking._id)" -Token $token | Out-Null
}

Invoke-CurlJson -Method GET -Path '/api/menu?days=7' | Out-Null

if ($env:ADMIN_EMAIL -and $env:ADMIN_PASSWORD) {
  $adminBody = @{ username = $env:ADMIN_EMAIL; password = $env:ADMIN_PASSWORD } | ConvertTo-Json -Compress
  $adminLogin = Invoke-CurlJson -Method POST -Path '/api/auth/login' -Body $adminBody
  Invoke-CurlJson -Method GET -Path '/api/admin/dashboard' -Token $adminLogin.token | Out-Null
  Invoke-CurlJson -Method GET -Path '/api/admin/bookings' -Token $adminLogin.token | Out-Null
  Invoke-CurlJson -Method GET -Path '/api/admin/customers' -Token $adminLogin.token | Out-Null
}

Write-Output "Smoke test completed for $email"