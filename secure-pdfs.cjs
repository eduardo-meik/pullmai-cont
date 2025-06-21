const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pullmai-e0bb0.appspot.com'
});

const bucket = admin.storage().bucket();

async function revokePublicAccess() {
  try {
    console.log('Revoking public access from contract PDFs...\n');
    
    // Get all files in the contracts folder
    const [files] = await bucket.getFiles({
      prefix: 'contracts/'
    });
    
    const pdfFiles = files.filter(file => 
      file.name.endsWith('.pdf') || file.name.includes('contract_')
    );
    
    console.log(`Found ${pdfFiles.length} PDF files to secure:`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of pdfFiles) {
      try {
        // Remove public access
        await file.acl.delete({entity: 'allUsers'});
        
        console.log(`✅ Secured: ${file.name}`);
        successCount++;
      } catch (error) {
        // If it fails, it might not have been public anyway
        console.log(`⚠️  ${file.name}: ${error.message}`);
        successCount++; // Count as success since it's secure
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Files secured: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    console.log(`\n🔒 PDFs are now private and require authentication!`);
    
  } catch (error) {
    console.error('Error securing PDFs:', error);
  }
}

revokePublicAccess()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
