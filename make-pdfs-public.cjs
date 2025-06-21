const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pullmai-e0bb0.appspot.com'
});

const bucket = admin.storage().bucket();

async function makeContractPDFsPublic() {
  try {
    console.log('Making contract PDFs publicly accessible...\n');
    
    // Get all files in the contracts folder
    const [files] = await bucket.getFiles({
      prefix: 'contracts/'
    });
    
    const pdfFiles = files.filter(file => 
      file.name.endsWith('.pdf') || file.name.includes('contract_')
    );
    
    console.log(`Found ${pdfFiles.length} PDF files to make public:`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of pdfFiles) {
      try {
        // Make file publicly readable
        await file.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        
        console.log(`✅ ${file.name}`);
        console.log(`   Public URL: ${publicUrl}\n`);
        
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to make ${file.name} public:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Successfully made public: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 PDFs are now publicly accessible!`);
      console.log(`You can test by opening any of the URLs above in your browser.`);
    }
    
  } catch (error) {
    console.error('Error making PDFs public:', error);
  }
}

makeContractPDFsPublic()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
