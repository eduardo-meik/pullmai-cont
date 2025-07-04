const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin configuration - SECURE VERSION
// Use environment variables instead of hardcoded service account file
let adminApp;

if (!admin.apps.length) {
  // Check if we have service account environment variables
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.VITE_STORAGE_BUCKET
    });
  } else {
    console.error('❌ Missing Firebase Admin SDK environment variables!');
    console.error('Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in your .env file');
    process.exit(1);
  }
} else {
  adminApp = admin.app();
}

const db = admin.firestore();

async function verifyContractPDFs() {
  try {
    console.log('Verifying contract PDF updates...\n');
    
    const contractsSnapshot = await db.collection('contratos').get();
    
    let updatedCount = 0;
    let totalCount = 0;
    
    contractsSnapshot.forEach(doc => {
      const data = doc.data();
      totalCount++;
      
      if (data.pdfUrl && data.pdfUrl.trim() !== '') {
        updatedCount++;
        console.log(`✅ ${data.titulo}`);
        console.log(`   PDF: ${data.pdfUrl}`);
        console.log(`   Document: ${data.documentoNombre || 'N/A'}`);
        console.log('');
      } else {
        console.log(`❌ ${data.titulo} - No PDF URL`);
      }
    });
    
    console.log(`Summary: ${updatedCount}/${totalCount} contracts have PDF URLs assigned.`);
    
  } catch (error) {
    console.error('Error verifying contracts:', error);
  }
}

verifyContractPDFs()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
