# Script to manually set a user's role by email
# Usage: .\set-role-by-email.ps1

Write-Host "🔧 HOMEase AI - Manual Role Setter" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script sets a user's role (for development when Cloud Functions aren't deployed)" -ForegroundColor Gray
Write-Host ""

# Get email
$email = Read-Host "Enter user email"

if ([string]::IsNullOrWhiteSpace($email)) {
    Write-Host "❌ Email is required" -ForegroundColor Red
    exit 1
}

# Select role
Write-Host ""
Write-Host "Select role:" -ForegroundColor Yellow
Write-Host "  1. Homeowner" -ForegroundColor White
Write-Host "  2. Contractor" -ForegroundColor White
Write-Host "  3. Admin" -ForegroundColor White
Write-Host ""
$roleChoice = Read-Host "Enter choice (1-3)"

$role = switch ($roleChoice) {
    "1" { "homeowner" }
    "2" { "contractor" }
    "3" { "admin" }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Setting role '$role' for $email..." -ForegroundColor Yellow

# Make API call
try {
    $body = @{
        email = $email
        role = $role
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/set-role-by-email" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host ""
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Role '$role' has been set for $email" -ForegroundColor White
    Write-Host "   User ID: $($response.userId)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
    Write-Host "   The user must SIGN OUT and SIGN IN again for the role to take effect" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor White
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. The dev server is running (npm run dev)" -ForegroundColor White
    Write-Host "  2. The email address is correct" -ForegroundColor White
    Write-Host "  3. The user has signed up already" -ForegroundColor White
    Write-Host ""
    exit 1
}

