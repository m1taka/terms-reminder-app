# Setup script for Terms Reminder App
Write-Host "Terms Reminder App - Setup Script" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Create backend .env if it doesn't exist
if (-not (Test-Path "api\.env")) {
    Write-Host "Creating backend environment file..." -ForegroundColor Yellow
    Copy-Item "api\.env.example" "api\.env"
    Write-Host "✓ Created api\.env (please edit with your MongoDB URI)" -ForegroundColor Green
} else {
    Write-Host "✓ Backend .env already exists" -ForegroundColor Green
}

# Create frontend .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating frontend environment file..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✓ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend .env.local already exists" -ForegroundColor Green
}

# Create uploads directory
if (-not (Test-Path "api\uploads")) {
    Write-Host "Creating uploads directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "api\uploads" | Out-Null
    Write-Host "✓ Created api\uploads directory" -ForegroundColor Green
} else {
    Write-Host "✓ Uploads directory already exists" -ForegroundColor Green
}

Write-Host "`n==================================`n" -ForegroundColor Cyan
Write-Host "Setup complete! Next steps:`n" -ForegroundColor Green
Write-Host "1. Edit api\.env and add your MongoDB connection string" -ForegroundColor White
Write-Host "2. Install backend dependencies: cd api; npm install" -ForegroundColor White
Write-Host "3. Install frontend dependencies: cd ..; npm install" -ForegroundColor White
Write-Host "4. Start backend: cd api; npm run dev" -ForegroundColor White
Write-Host "5. Start frontend (new terminal): npm run dev" -ForegroundColor White
Write-Host "`nSee QUICKSTART.md for detailed instructions." -ForegroundColor Cyan
