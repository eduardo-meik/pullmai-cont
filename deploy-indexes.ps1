# PowerShell script to deploy Firestore indexes

Write-Host "🚀 Deploying Firestore indexes..." -ForegroundColor Yellow

# Deploy the indexes
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firestore indexes deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Current indexes include:" -ForegroundColor Cyan
    Write-Host "   - contract_templates: organizationId + isActive + name" -ForegroundColor White
    Write-Host "   - generated_contracts: organizationId + createdAt" -ForegroundColor White
    Write-Host "   - contratos: various combinations for projects and organizations" -ForegroundColor White
    Write-Host "   - contrapartes: organizationId + fechaCreacion" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 You can check the indexes in the Firebase Console:" -ForegroundColor Cyan
    Write-Host "   https://console.firebase.google.com/project/pullmai-e0bb0/firestore/indexes" -ForegroundColor Blue
} else {
    Write-Host "❌ Failed to deploy Firestore indexes" -ForegroundColor Red
    exit 1
}
