const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pullmai-e0bb0.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function updateContractPDFs() {
  try {
    console.log('Starting contract PDF update...');
    
    // Step 1: List all PDF files in the contracts folder
    console.log('Fetching available PDF files from Firebase Storage...');
    
    const [files] = await bucket.getFiles({
      prefix: 'contracts/'
    });
    
    const pdfFiles = files
      .filter(file => file.name.endsWith('.pdf') || file.name.includes('contract_'))
      .map(file => {
        // Get the download URL synchronously (we'll make it async in the actual update)
        return {
          name: file.name,
          path: file.name
        };
      });
    
    console.log(`Found ${pdfFiles.length} PDF files:`);
    pdfFiles.forEach(file => console.log(`  - ${file.path}`));
    
    if (pdfFiles.length === 0) {
      console.log('No PDF files found in Firebase Storage. Creating some example PDFs first...');
      return;
    }
    
    // Step 2: Get all contracts from Firestore
    console.log('\nFetching contracts from Firestore...');
    const contractsSnapshot = await db.collection('contratos').get();
    
    if (contractsSnapshot.empty) {
      console.log('No contracts found in Firestore.');
      return;
    }
    
    console.log(`Found ${contractsSnapshot.size} contracts to update.`);
    
    // Step 3: Update each contract with a random PDF URL
    const batch = db.batch();
    let updateCount = 0;
    
    for (const doc of contractsSnapshot.docs) {
      const contractData = doc.data();
      
      // Pick a random PDF file
      const randomPDF = pdfFiles[Math.floor(Math.random() * pdfFiles.length)];
      
      // Get the download URL for this file
      const file = bucket.file(randomPDF.path);
      let downloadURL;
      
      try {
        // Make the file publicly readable and get download URL
        await file.makePublic();
        downloadURL = `https://storage.googleapis.com/${bucket.name}/${randomPDF.path}`;
      } catch (error) {
        console.warn(`Could not get URL for ${randomPDF.path}, using gs:// URL instead`);
        downloadURL = `gs://${bucket.name}/${randomPDF.path}`;
      }
      
      // Update the contract with the PDF URL
      batch.update(doc.ref, {
        pdfUrl: downloadURL,
        documentoNombre: randomPDF.name.split('/').pop() || 'contract.pdf',
        documentoTamaño: 0, // We'll set this to 0 for now
        fechaUltimaModificacion: admin.firestore.Timestamp.now()
      });
      
      updateCount++;
      console.log(`  ${updateCount}. ${contractData.titulo} -> ${randomPDF.path}`);
    }
    
    // Commit the batch update
    console.log(`\nCommitting ${updateCount} contract updates...`);
    await batch.commit();
    
    console.log(`✅ Successfully updated ${updateCount} contracts with random PDF URLs!`);
    
  } catch (error) {
    console.error('Error updating contract PDFs:', error);
  }
}

// Run the update
updateContractPDFs()
  .then(() => {
    console.log('Update process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update process failed:', error);
    process.exit(1);
  });
