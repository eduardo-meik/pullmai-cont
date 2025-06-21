const admin = require("firebase-admin");

// IMPORTANT: Make sure you have downloaded your service account key and placed it in the root
// Also, ensure you have run 'npm install firebase-admin'
const serviceAccount = require("./pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
