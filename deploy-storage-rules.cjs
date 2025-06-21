const fs = require('fs');

async function deployStorageRules() {
  try {
    // Read the storage rules file
    const rules = fs.readFileSync('./storage.rules', 'utf8');
    console.log('=== STORAGE RULES TO DEPLOY ===');
    console.log(rules);
    
    console.log('\n=== DEPLOYMENT INSTRUCTIONS ===');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project: pullmai-e0bb0');
    console.log('3. Go to Storage > Rules');
    console.log('4. Copy and paste the rules above');
    console.log('5. Click "Publish"');
    console.log('\n=== OR USE FIREBASE CLI ===');
    console.log('firebase deploy --only storage');
    
  } catch (error) {
    console.error('Error reading storage rules:', error);
  }
}

deployStorageRules();
