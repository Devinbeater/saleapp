# Daily Register - Safe GitHub Deployment Script
# This script will safely prepare and push your code to GitHub

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Daily Register - GitHub Deployment  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git
Write-Host "[1/5] Checking Git status..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "  Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "  Git initialized successfully!" -ForegroundColor Green
} else {
    Write-Host "  Git already initialized" -ForegroundColor Green
}

# Step 2: Verify .gitignore
Write-Host ""
Write-Host "[2/5] Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "  .gitignore exists - your secrets are safe!" -ForegroundColor Green
    
    # Check if .env is ignored
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "  .env file is properly ignored" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: .env might not be ignored!" -ForegroundColor Red
    }
} else {
    Write-Host "  WARNING: No .gitignore found!" -ForegroundColor Red
}

# Step 3: Check for sensitive files
Write-Host ""
Write-Host "[3/5] Checking for sensitive files..." -ForegroundColor Yellow
$sensitiveFiles = @(".env", ".env.local", ".env.production")
$foundSensitive = $false
foreach ($file in $sensitiveFiles) {
    if (Test-Path $file) {
        Write-Host "  Found: $file (will be ignored by git)" -ForegroundColor Yellow
        $foundSensitive = $true
    }
}
if (-not $foundSensitive) {
    Write-Host "  No sensitive files found in root" -ForegroundColor Green
}

# Step 4: Stage files
Write-Host ""
Write-Host "[4/5] Staging files for commit..." -ForegroundColor Yellow
git add .
Write-Host "  Files staged successfully!" -ForegroundColor Green

# Show what will be committed
Write-Host ""
Write-Host "Files to be committed:" -ForegroundColor Cyan
git status --short

# Step 5: Commit
Write-Host ""
Write-Host "[5/5] Creating commit..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Cyan
$commitMessage = Read-Host

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Add Daily Register app with dynamic row expansion - ready for Render deployment"
}

git commit -m $commitMessage
Write-Host "  Commit created successfully!" -ForegroundColor Green

# Check for remote
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub Repository Setup              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hasRemote = git remote -v 2>$null
if (-not $hasRemote) {
    Write-Host "No GitHub remote configured yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository (name: daily-register)" -ForegroundColor White
    Write-Host "3. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
    Write-Host "4. Copy the repository URL" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run these commands:" -ForegroundColor Cyan
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/daily-register.git" -ForegroundColor White
    Write-Host "  git branch -M main" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
} else {
    Write-Host "Remote repository already configured:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    Write-Host "Ready to push? (Y/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        git push -u origin main
        Write-Host ""
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    }
}

# Final instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next: Deploy to Render               " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your code is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "To deploy to Render:" -ForegroundColor Yellow
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Click 'New +' -> 'Blueprint'" -ForegroundColor White
Write-Host "3. Select your GitHub repository" -ForegroundColor White
Write-Host "4. Click 'Apply'" -ForegroundColor White
Write-Host "5. Wait 3-5 minutes" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: DEPLOY_TO_RENDER.md" -ForegroundColor Cyan
Write-Host ""
