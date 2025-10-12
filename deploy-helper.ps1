# Daily Register - Render Deployment Helper Script
# Run this script to prepare your app for deployment

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Daily Register - Render Deployment Helper               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
Write-Host "🔍 Checking Git status..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "   ⚠️  Git not initialized. Initializing now..." -ForegroundColor Yellow
    git init
    Write-Host "   ✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "   ✅ Git already initialized" -ForegroundColor Green
}

# Check for required files
Write-Host ""
Write-Host "🔍 Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "render.yaml",
    "database-schema.sql",
    ".env.example",
    "server/package.json",
    "server/index.js",
    "client/index.html"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (MISSING!)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some required files are missing. Please check your project structure." -ForegroundColor Red
    exit 1
}

# Check git status
Write-Host ""
Write-Host "🔍 Checking for uncommitted changes..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   📝 You have uncommitted changes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would you like to commit all changes now? (Y/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        git add .
        Write-Host ""
        Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Cyan
        $commitMsg = Read-Host
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Ready for Render deployment"
        }
        git commit -m $commitMsg
        Write-Host "   ✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
}

# Check for remote
Write-Host ""
Write-Host "🔍 Checking Git remote..." -ForegroundColor Yellow
$remote = git remote -v
if (-not $remote) {
    Write-Host "   ⚠️  No Git remote configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a repository on GitHub, then enter the repository URL:" -ForegroundColor Cyan
    Write-Host "Example: https://github.com/YOUR_USERNAME/daily-register.git" -ForegroundColor Gray
    $repoUrl = Read-Host
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        git branch -M main
        Write-Host "   ✅ Remote configured" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ Remote already configured" -ForegroundColor Green
}

# Offer to push
Write-Host ""
Write-Host "Would you like to push to GitHub now? (Y/N)" -ForegroundColor Cyan
$pushResponse = Read-Host

if ($pushResponse -eq "Y" -or $pushResponse -eq "y") {
    Write-Host ""
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "   ✅ Pushed to GitHub" -ForegroundColor Green
}

# Display next steps
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✅ PREPARATION COMPLETE                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to https://render.com and sign in" -ForegroundColor White
Write-Host "2. Click 'New +' → 'Blueprint'" -ForegroundColor White
Write-Host "3. Select your GitHub repository" -ForegroundColor White
Write-Host "4. Click 'Apply' and wait 3-5 minutes" -ForegroundColor White
Write-Host "5. Initialize database (see QUICK_DEPLOY.md)" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "   - DEPLOY_NOW.txt (quick reference)" -ForegroundColor Gray
Write-Host "   - QUICK_DEPLOY.md (5-minute guide)" -ForegroundColor Gray
Write-Host "   - DEPLOY_TO_RENDER.md (complete guide)" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Good luck with your deployment!" -ForegroundColor Green
Write-Host ""
