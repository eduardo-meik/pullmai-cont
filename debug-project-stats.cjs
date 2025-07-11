const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin configuration
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
    console.error('Firebase environment variables not found');
    process.exit(1);
  }
}

const db = admin.firestore();

async function debugProjectStats() {
  console.log('=== DEBUGGING PROJECT STATISTICS ===');
  
  // 1. Find the project 'Recurso humano' or similar
  const projectsRef = db.collection('proyectos');
  const projectsSnapshot = await projectsRef.where('nombre', '==', 'Recurso humano').get();
  
  if (projectsSnapshot.empty) {
    console.log('No project found with name "Recurso humano"');
    
    // Try to find similar projects
    const allProjectsSnapshot = await projectsRef.get();
    console.log('\nAvailable projects:');
    allProjectsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}, Name: "${data.nombre}", Org: ${data.organizacionId}`);
    });
  } else {
    projectsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Found project: ID=${doc.id}, Name="${data.nombre}", Org=${data.organizacionId}`);
    });
  }
  
  // 2. Find contracts with proyecto = 'Recurso humano'
  const contractsRef = db.collection('contratos');
  const contractsSnapshot = await contractsRef.where('proyecto', '==', 'Recurso humano').get();
  
  console.log(`\nContracts with proyecto="Recurso humano": ${contractsSnapshot.size}`);
  contractsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ID: ${doc.id}`);
    console.log(`    Title: "${data.titulo}"`);
    console.log(`    Estado: ${data.estado}`);
    console.log(`    Proyecto: "${data.proyecto}"`);
    console.log(`    ProyectoId: ${data.proyectoId}`);
    console.log(`    OrganizacionId: ${data.organizacionId}`);
    console.log('');
  });
  
  // 3. Check if there are contracts with 'Recursos Humanos' (plural)
  const contractsSnapshot2 = await contractsRef.where('proyecto', '==', 'Recursos Humanos').get();
  console.log(`\nContracts with proyecto="Recursos Humanos": ${contractsSnapshot2.size}`);
  contractsSnapshot2.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ID: ${doc.id}`);
    console.log(`    Title: "${data.titulo}"`);
    console.log(`    Estado: ${data.estado}`);
    console.log(`    Proyecto: "${data.proyecto}"`);
    console.log(`    ProyectoId: ${data.proyectoId}`);
    console.log(`    OrganizacionId: ${data.organizacionId}`);
    console.log('');
  });

  // 4. Search for "Contrato Gerente de Ventas" specifically
  const gerenteSnapshot = await contractsRef.where('titulo', '==', 'Contrato Gerente de Ventas').get();
  console.log(`\nContracts with titulo="Contrato Gerente de Ventas": ${gerenteSnapshot.size}`);
  gerenteSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ID: ${doc.id}`);
    console.log(`    Title: "${data.titulo}"`);
    console.log(`    Estado: ${data.estado}`);
    console.log(`    Proyecto: "${data.proyecto}"`);
    console.log(`    ProyectoId: ${data.proyectoId}`);
    console.log(`    OrganizacionId: ${data.organizacionId}`);
    console.log('');
  });

  // 5. Check organization info
  const orgsRef = db.collection('organizaciones');
  const orgsSnapshot = await orgsRef.get();
  console.log(`\nAvailable organizations:`);
  orgsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - ID: ${doc.id}, Name: "${data.nombre}"`);
  });
}

debugProjectStats().then(() => {
  console.log('Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
