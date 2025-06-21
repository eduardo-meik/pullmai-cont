const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pullmai-e0bb0.appspot.com'
});

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
