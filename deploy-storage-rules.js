const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin (make sure the service account key file is in the root)
const serviceAccount = require('./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pullmai-e0bb0.appspot.com'
});

async function deployStorageRules() {
  try {
    // Read the storage rules file
    const rules = fs.readFileSync('./storage.rules', 'utf8');
    console.log('Storage rules content:');
    console.log(rules);
    
    console.log('\nTo deploy these storage rules:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project: pullmai-e0bb0');
    console.log('3. Go to Storage > Rules');
    console.log('4. Copy and paste the rules above');
    console.log('5. Click "Publish"');
    
  } catch (error) {
    console.error('Error reading storage rules:', error);
  }
}

deployStorageRules();
