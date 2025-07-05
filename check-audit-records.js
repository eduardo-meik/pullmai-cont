import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxRS0A5Q2_r7v7I5qp-QU7b2AAOV7GdmQ",
  authDomain: "pullmai-cont.firebaseapp.com",
  projectId: "pullmai-cont",
  storageBucket: "pullmai-cont.firebasestorage.app",
  messagingSenderId: "1056000924066",
  appId: "1:1056000924066:web:26ff77b34fa4ecb3e91a9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAuditRecords() {
  try {
    console.log('🔍 Checking audit records in registros_auditoria collection...');
    
    // Get all audit records
    const auditQuery = query(collection(db, 'registros_auditoria'), limit(20));
    const auditSnapshot = await getDocs(auditQuery);
    
    console.log(`\n📊 Found ${auditSnapshot.size} audit records:`);
    
    if (auditSnapshot.empty) {
      console.log('❌ No audit records found in the database');
      return;
    }
    
    auditSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Record ID: ${doc.id}`);
      console.log(`   - Acción: ${data.accion}`);
      console.log(`   - Usuario ID: ${data.usuarioId}`);
      console.log(`   - Contrato ID: ${data.contratoId}`);
      console.log(`   - Descripción: ${data.descripcion}`);
      console.log(`   - Fecha: ${data.fecha?.toDate ? data.fecha.toDate() : data.fecha}`);
      console.log(`   - Metadatos: ${JSON.stringify(data.metadatos || {})}`);
    });
    
    // Also check contratos collection to see organization links
    console.log('\n🔍 Checking contracts in contratos collection...');
    const contractsQuery = query(collection(db, 'contratos'), limit(10));
    const contractsSnapshot = await getDocs(contractsQuery);
    
    console.log(`\n📊 Found ${contractsSnapshot.size} contracts:`);
    
    contractsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Contract ID: ${doc.id}`);
      console.log(`   - Título: ${data.titulo}`);
      console.log(`   - Organización ID: ${data.organizacionId}`);
      console.log(`   - Proyecto: ${data.proyecto}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking audit records:', error);
  }
}

checkAuditRecords();
