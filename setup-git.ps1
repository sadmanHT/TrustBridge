# TrustBridge Git Setup Script
# Run this script after installing Git from https://git-scm.com/download/windows

Write-Host "Setting up Git repository for TrustBridge..." -ForegroundColor Green

# Check if Git is installed
try {
    git --version
    Write-Host "Git is installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed. Please install Git first from https://git-scm.com/download/windows" -ForegroundColor Red
    exit 1
}

# Initialize Git repository
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
git init

# Add all files
Write-Host "Adding all files to Git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: TrustBridge blockchain credential system"

Write-Host "Git repository initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Run: git remote add origin <your-github-repo-url>" -ForegroundColor White
Write-Host "4. Run: git branch -M main" -ForegroundColor White
Write-Host "5. Run: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Example:" -ForegroundColor Cyan
Write-Host "git remote add origin https://github.com/yourusername/trustbridge.git" -ForegroundColor Gray
Write-Host "git branch -M main" -ForegroundColor Gray
Write-Host "git push -u origin main" -ForegroundColor Gray