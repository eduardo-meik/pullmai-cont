// Serverless function for setting custom claims
// Deploy this to Vercel, Netlify, or similar serverless platform
// Or use it as a Cloud Function

const admin = require('firebase-admin');

// Initialize Firebase Admin (use environment variables in production)
if (!admin.apps.length) {
  const serviceAccount = require('../pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, organizacionId = 'MEIK LABS', org_admin = false } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      organizacionId,
      org_admin,
      name: 'User Name' // You can customize this
    });

    console.log(`Custom claims set for user ${uid}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Claims set successfully' 
    });

  } catch (error) {
    console.error('Error setting custom claims:', error);
    return res.status(500).json({ 
      error: 'Failed to set custom claims',
      details: error.message 
    });
  }
};
