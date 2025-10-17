# Quick script to set user role
# Usage: .\set-role.ps1 -email "user@example.com" -role "homeowner"

param(
    [Parameter(Mandatory=$true)]
    [string]$email,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet('homeowner', 'contractor', 'admin')]
    [string]$role
)

$body = @{
    email = $email
    role = $role
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/set-role" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Role set to '$role' for $email" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can sign in at: http://localhost:3001/auth/signin" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

