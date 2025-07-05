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

async function checkContracts() {
  try {
    // Get all contracts
    const snapshot = await getDocs(collection(db, 'contratos'));
    console.log('Total contracts:', snapshot.size);

    const contractsByOrg = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const org = data.organizacionId || 'NO_ORG';
      if (!contractsByOrg[org]) contractsByOrg[org] = [];
      contractsByOrg[org].push({
        titulo: data.titulo,
        proyecto: data.proyecto,
        contraparte: data.contraparte
      });
    });

    console.log('\nContracts by organization:');
    Object.entries(contractsByOrg).forEach(([org, contracts]) => {
      console.log(`\n${org}: ${contracts.length} contracts`);
      contracts.forEach(c => console.log(`  - ${c.titulo} (Proyecto: ${c.proyecto}, Contraparte: ${c.contraparte})`));
    });

    // Check for potential cross-organization data leakage
    console.log('\n=== CHECKING FOR CROSS-ORGANIZATION PROJECT NAMES ===');
    const projectsByOrg = {};
    
    Object.entries(contractsByOrg).forEach(([org, contracts]) => {
      contracts.forEach(contract => {
        const proyecto = contract.proyecto;
        if (!projectsByOrg[proyecto]) projectsByOrg[proyecto] = [];
        projectsByOrg[proyecto].push(org);
      });
    });

    const crossOrgProjects = Object.entries(projectsByOrg).filter(([project, orgs]) => orgs.length > 1);
    
    if (crossOrgProjects.length > 0) {
      console.log('\n⚠️  POTENTIAL DATA LEAKAGE DETECTED:');
      console.log('Projects that appear in multiple organizations:');
      crossOrgProjects.forEach(([project, orgs]) => {
        console.log(`  - "${project}" appears in organizations: ${orgs.join(', ')}`);
      });
    } else {
      console.log('\n✅ No cross-organization project sharing detected.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkContracts();
