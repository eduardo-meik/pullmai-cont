@echo off
REM Deploy CORS configuration to Firebase Storage
REM Run this script with: deploy-cors.bat

echo 🔧 Deploying CORS configuration to Firebase Storage...

REM Check if gsutil is installed
where gsutil >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ gsutil is not installed.
    echo 📦 Please install Google Cloud SDK to use gsutil:
    echo    https://cloud.google.com/sdk/docs/install
    echo.
    echo 🔄 Alternative: Deploy via Google Cloud Console:
    echo    1. Go to: https://console.cloud.google.com/storage/browser
    echo    2. Select your bucket: pullmai-e0bb0.appspot.com
    echo    3. Click 'Permissions' tab
    echo    4. Click 'CORS' tab
    echo    5. Upload the cors.json file from this directory
    pause
    exit /b 1
)

REM Deploy CORS configuration
echo 📡 Setting CORS configuration...
gsutil cors set cors.json gs://pullmai-e0bb0.appspot.com

if %ERRORLEVEL% EQU 0 (
    echo ✅ CORS configuration deployed successfully!
    echo 🔄 It may take a few minutes for the changes to take effect.
) else (
    echo ❌ Failed to deploy CORS configuration.
    echo 🔒 Make sure you're authenticated with: gcloud auth login
)

pause
