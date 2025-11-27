# FocusLab Quick Setup Script
# Run this script to quickly set up your development environment

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  FocusLab - Quick Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if npm is available
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not available!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Step 1: Installing Dependencies" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Step 2: Environment Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: You need to configure Firebase!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Open FIREBASE_SETUP.md for detailed instructions" -ForegroundColor White
    Write-Host "2. Create a Firebase project at https://console.firebase.google.com/" -ForegroundColor White
    Write-Host "3. Enable Anonymous Authentication" -ForegroundColor White
    Write-Host "4. Create Firestore Database" -ForegroundColor White
    Write-Host "5. Copy your Firebase config values" -ForegroundColor White
    Write-Host "6. Edit .env file and replace placeholder values" -ForegroundColor White
    Write-Host ""
    Write-Host "After configuring .env, run: npm run dev" -ForegroundColor Cyan
    Write-Host ""
    
    # Ask if user wants to open .env file
    $openEnv = Read-Host "Do you want to open .env file now? (Y/N)"
    if ($openEnv -eq "Y" -or $openEnv -eq "y") {
        code .env
    }
    
    # Ask if user wants to open Firebase setup guide
    $openGuide = Read-Host "Do you want to open Firebase setup guide? (Y/N)"
    if ($openGuide -eq "Y" -or $openGuide -eq "y") {
        code FIREBASE_SETUP.md
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Configure Firebase (see FIREBASE_SETUP.md)" -ForegroundColor White
Write-Host "2. Edit .env file with your Firebase credentials" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- README.md          - Complete documentation" -ForegroundColor White
Write-Host "- QUICKSTART.md      - Quick start guide" -ForegroundColor White
Write-Host "- FIREBASE_SETUP.md  - Firebase configuration" -ForegroundColor White
Write-Host "- DEPLOYMENT.md      - Deployment instructions" -ForegroundColor White
Write-Host "- ARCHITECTURE.md    - Technical architecture" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
Write-Host ""
