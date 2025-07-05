#!/bin/bash
# Script to deploy Firestore indexes

echo "🚀 Deploying Firestore indexes..."

# Deploy the indexes
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully!"
    echo ""
    echo "📝 Current indexes include:"
    echo "   - contract_templates: organizationId + isActive + name"
    echo "   - generated_contracts: organizationId + createdAt"
    echo "   - contratos: various combinations for projects and organizations"
    echo "   - contrapartes: organizationId + fechaCreacion"
    echo ""
    echo "🔍 You can check the indexes in the Firebase Console:"
    echo "   https://console.firebase.google.com/project/pullmai-e0bb0/firestore/indexes"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi
