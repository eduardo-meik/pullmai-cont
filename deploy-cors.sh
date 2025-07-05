#!/bin/bash

# Deploy CORS configuration to Firebase Storage
# Run this script with: ./deploy-cors.sh

echo "🔧 Deploying CORS configuration to Firebase Storage..."

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null
then
    echo "❌ gsutil is not installed."
    echo "📦 Please install Google Cloud SDK to use gsutil:"
    echo "   https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "🔄 Alternative: Deploy via Google Cloud Console:"
    echo "   1. Go to: https://console.cloud.google.com/storage/browser"
    echo "   2. Select your bucket: pullmai-e0bb0.appspot.com"
    echo "   3. Click 'Permissions' tab"
    echo "   4. Click 'CORS' tab"
    echo "   5. Upload the cors.json file from this directory"
    exit 1
fi

# Deploy CORS configuration
echo "📡 Setting CORS configuration..."
gsutil cors set cors.json gs://pullmai-e0bb0.appspot.com

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration deployed successfully!"
    echo "🔄 It may take a few minutes for the changes to take effect."
else
    echo "❌ Failed to deploy CORS configuration."
    echo "🔒 Make sure you're authenticated with: gcloud auth login"
fi
