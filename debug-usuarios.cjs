const admin = require('firebase-admin');
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
      }),
      databaseURL: `https://${process.env.VITE_PROJECT_ID}-default-rtdb.firebaseio.com/`
    });
  } else {
    console.error('❌ Missing Firebase Admin SDK environment variables!');
    console.error('Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in your .env file');
    process.exit(1);
  }
}

const db = admin.firestore();

async function debugUsuarios() {
  console.log('🔍 Debugging usuarios collection...\n');
  
  try {
    // Get all usuarios
    const usuariosSnapshot = await db.collection('usuarios').get();
    
    if (usuariosSnapshot.empty) {
      console.log('❌ No usuarios found in the collection');
      return;
    }
    
    console.log(`📊 Found ${usuariosSnapshot.size} usuarios:\n`);
    
    const organizationGroups = {};
    
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      const orgId = data.organizacionId || 'No organization';
      
      if (!organizationGroups[orgId]) {
        organizationGroups[orgId] = [];
      }
      
      organizationGroups[orgId].push({
        id: doc.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        activo: data.activo
      });
      
      console.log(`👤 User ID: ${doc.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Nombre: ${data.nombre || 'N/A'}`);
      console.log(`   Rol: ${data.rol || 'N/A'}`);
      console.log(`   OrganizacionId: ${data.organizacionId || 'N/A'}`);
      console.log(`   Activo: ${data.activo !== false ? 'Sí' : 'No'}`);
      console.log('   ---');
    });
    
    console.log('\n📈 Users by Organization:');
    Object.keys(organizationGroups).forEach(orgId => {
      console.log(`\n🏢 ${orgId}: ${organizationGroups[orgId].length} users`);
      organizationGroups[orgId].forEach(user => {
        console.log(`   • ${user.email} (${user.rol || 'No role'})`);
      });
    });
    
    // Test a specific organization query
    console.log('\n🔎 Testing organization query for "MEIK LABS":');
    const meikLabsQuery = await db.collection('usuarios')
      .where('organizacionId', '==', 'MEIK LABS')
      .get();
    
    console.log(`Found ${meikLabsQuery.size} users for MEIK LABS`);
    meikLabsQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   • ${data.email} (${data.rol || 'No role'})`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging usuarios:', error);
  }
}

debugUsuarios()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
