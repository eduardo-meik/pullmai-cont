const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing connection if available)
if (admin.apps.length === 0) {
  const serviceAccount = require('./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'pullmai-e0bb0.appspot.com'
  });
}

const db = admin.firestore();

async function showPDFDistribution() {
  try {
    console.log('📊 PDF Distribution Summary\n');
    
    const contractsSnapshot = await db.collection('contratos').get();
    const pdfUsage = {};
    
    contractsSnapshot.forEach(doc => {
      const data = doc.data();
      const pdfUrl = data.pdfUrl || 'No PDF';
      const pdfName = pdfUrl.includes('/') ? pdfUrl.split('/').pop() : pdfUrl;
      
      if (!pdfUsage[pdfName]) {
        pdfUsage[pdfName] = [];
      }
      pdfUsage[pdfName].push(data.titulo);
    });
    
    console.log('PDF File Usage:');
    console.log('===============\n');
    
    Object.keys(pdfUsage).forEach(pdfName => {
      console.log(`📄 ${pdfName}`);
      console.log(`   Used by ${pdfUsage[pdfName].length} contract(s):`);
      pdfUsage[pdfName].forEach(title => {
        console.log(`   • ${title}`);
      });
      console.log('');
    });
    
    const totalContracts = contractsSnapshot.size;
    const contractsWithPDFs = Object.values(pdfUsage).flat().length;
    const uniquePDFs = Object.keys(pdfUsage).filter(key => key !== 'No PDF').length;
    
    console.log('📈 Statistics:');
    console.log(`   Total contracts: ${totalContracts}`);
    console.log(`   Contracts with PDFs: ${contractsWithPDFs}`);
    console.log(`   Unique PDFs available: ${uniquePDFs}`);
    console.log(`   Average contracts per PDF: ${(contractsWithPDFs / uniquePDFs).toFixed(1)}`);
    
  } catch (error) {
    console.error('Error analyzing PDF distribution:', error);
  }
}

showPDFDistribution()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
