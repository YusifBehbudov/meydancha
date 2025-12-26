# Database Setup Script for MEYDANCHA
# Run this script from the project root directory

Write-Host "Setting up database..." -ForegroundColor Green

# Navigate to project directory
$projectPath = Join-Path $PSScriptRoot "Meydancha(1)"
if (-not (Test-Path $projectPath)) {
    Write-Host "Error: Project directory not found at: $projectPath" -ForegroundColor Red
    Write-Host "Please run this script from the MEYDANCHA directory" -ForegroundColor Yellow
    exit 1
}

Push-Location $projectPath
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Step 1: Generate Prisma Client
Write-Host "`nStep 1: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma client" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 2: Run Migrations
Write-Host "`nStep 2: Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error running migrations" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 3: Seed Database
Write-Host "`nStep 3: Seeding database..." -ForegroundColor Yellow
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error seeding database" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "`nDatabase setup completed successfully!" -ForegroundColor Green
Pop-Location

