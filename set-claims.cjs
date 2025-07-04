const admin = require("firebase-admin");
require('dotenv').config();

// Firebase Admin configuration - SECURE VERSION
// Use environment variables instead of hardcoded service account file
if (!admin.apps.length) {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  } else {
    console.error('❌ Missing Firebase Admin SDK environment variables!');
    console.error('Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in your .env file');
    process.exit(1);
  }
}

// --- CONFIGURATION ---
// Replace this with the UID of the user you want to grant privileges to.
// You can find the UID in the Firebase Authentication console.
const uid = "sGcgoyn0GJcb5bbSKN6auhOsFaj1"; 

// The organization ID and role you want to assign.
const organizacionId = "MEIK LABS";
// ---------------------

// Set the custom claims for the specified user.
admin.auth().setCustomUserClaims(uid, { 
    organizacionId: organizacionId,
    org_admin: true
})
.then(() => {
  console.log(`Successfully set custom claims for user ${uid}: { organizacionId: '${organizacionId}', org_admin: true }`);
  console.log("The user must log out and log back in for the changes to take effect.");
  process.exit(0);
})
.catch(error => {
  console.error('Error setting custom claims:', error);
  process.exit(1);
});
