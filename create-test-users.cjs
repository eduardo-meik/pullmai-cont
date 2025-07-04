const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://pullmai-e0bb0-default-rtdb.firebaseio.com/"
});

const db = admin.firestore();

async function createTestUsers() {
  console.log('🔍 Creating test users in usuarios collection...\n');
  
  const testUsers = [
    {
      id: 'test-org-admin-1',
      email: 'admin1@meiklabs.com',
      nombre: 'Admin',
      apellido: 'One',
      rol: 'org_admin',
      organizacionId: 'MEIK LABS',
      departamento: 'General',
      activo: true,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date(),
      permisos: [],
      asignaciones: []
    },
    {
      id: 'test-org-admin-2',
      email: 'admin2@meiklabs.com',
      nombre: 'Admin',
      apellido: 'Two',
      rol: 'org_admin',
      organizacionId: 'MEIK LABS',
      departamento: 'General',
      activo: true,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date(),
      permisos: [],
      asignaciones: []
    },
    {
      id: 'test-user-1',
      email: 'user1@meiklabs.com',
      nombre: 'User',
      apellido: 'One',
      rol: 'user',
      organizacionId: 'MEIK LABS',
      departamento: 'General',
      activo: true,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date(),
      permisos: [],
      asignaciones: []
    },
    {
      id: 'test-super-admin',
      email: 'superadmin@meiklabs.com',
      nombre: 'Super',
      apellido: 'Admin',
      rol: 'super_admin',
      organizacionId: 'MEIK LABS',
      departamento: 'General',
      activo: true,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date(),
      permisos: [],
      asignaciones: []
    }
  ];
  
  try {
    for (const user of testUsers) {
      await db.collection('usuarios').doc(user.id).set(user);
      console.log(`✅ Created user: ${user.email} (${user.rol})`);
    }
    
    console.log('\n📊 Verifying created users:');
    const snapshot = await db.collection('usuarios').get();
    console.log(`Total users in collection: ${snapshot.size}`);
    
    // Test organization query
    const meikLabsUsers = await db.collection('usuarios')
      .where('organizacionId', '==', 'MEIK LABS')
      .get();
    
    console.log(`MEIK LABS users: ${meikLabsUsers.size}`);
    meikLabsUsers.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.email} (${data.rol})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

createTestUsers()
  .then(() => {
    console.log('\n✅ Test users creation completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test users creation failed:', error);
    process.exit(1);
  });
