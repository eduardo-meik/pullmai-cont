import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function analyzeContrapartesAndOrganizations() {
  try {
    console.log('🔍 Analyzing contrapartes and organizations collections...\n');

    // Check contrapartes collection
    console.log('📄 CONTRAPARTES Collection:');
    const contrapartesSnapshot = await getDocs(collection(db, 'contrapartes'));
    console.log(`Found ${contrapartesSnapshot.size} documents in contrapartes collection`);
    
    if (contrapartesSnapshot.size > 0) {
      console.log('\nSample contrapartes:');
      contrapartesSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.nombre} (${data.tipo}, ${data.sector}) - ${data.organizacionAsociadaId}`);
      });
    }

    // Check organizaciones collection
    console.log('\n📄 ORGANIZACIONES Collection:');
    const organizacionesSnapshot = await getDocs(collection(db, 'organizaciones'));
    console.log(`Found ${organizacionesSnapshot.size} documents in organizaciones collection`);
    
    if (organizacionesSnapshot.size > 0) {
      console.log('\nAll organizations:');
      organizacionesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${doc.id}: ${data.nombre} (${data.tipo || 'no-type'})`);
      });
    }

    // Get MEIK LABS contracts to see what contrapartes they reference
    console.log('\n📊 MEIK LABS Contracts Analysis:');
    const contratosQuery = query(
      collection(db, 'contratos'),
      where('organizacionId', '==', 'MEIK LABS')
    );
    
    const contratosSnapshot = await getDocs(contratosQuery);
    console.log(`Found ${contratosSnapshot.size} contracts for MEIK LABS`);
    
    const contraparteNames = new Set();
    const contraparteOrganizacionIds = new Set();
    
    contratosSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contraparte) contraparteNames.add(data.contraparte);
      if (data.contraparteOrganizacionId) contraparteOrganizacionIds.add(data.contraparteOrganizacionId);
    });

    console.log('\nUnique contraparte names in contracts:');
    contraparteNames.forEach(name => console.log(`  - "${name}"`));
    
    console.log('\nUnique contraparteOrganizacionId references:');
    contraparteOrganizacionIds.forEach(id => console.log(`  - ${id}`));

    // Check if the contraparte names exist as organizations
    console.log('\n🔗 Checking if contraparte names exist as organizations:');
    for (const name of contraparteNames) {
      const orgQuery = query(
        collection(db, 'organizaciones'),
        where('nombre', '==', name)
      );
      const orgSnapshot = await getDocs(orgQuery);
      if (orgSnapshot.size > 0) {
        console.log(`  ✅ "${name}" exists as organization`);
      } else {
        console.log(`  ❌ "${name}" does NOT exist as organization`);
      }
    }

    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. The system uses ContraparteOrganizacionService which expects organizations, not a separate contrapartes collection');
    console.log('2. You should create organizations for each contraparte name that doesn\'t already exist');
    console.log('3. Then update contracts to reference the correct contraparteOrganizacionId');
    console.log('4. The contrapartes collection created earlier may not be used by the current system');

  } catch (error) {
    console.error('Error analyzing collections:', error);
  }
}

analyzeContrapartesAndOrganizations();
