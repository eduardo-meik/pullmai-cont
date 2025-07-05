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

async function verifyContraparteSetup() {
  try {
    console.log('🔍 CHECKING MEIK LABS CONTRAPARTE MODULE SETUP');
    console.log('=' .repeat(60));
    
    // Get all MEIK LABS contracts
    const contratosQuery = query(
      collection(db, 'contratos'),
      where('organizacionId', '==', 'MEIK LABS')
    );
    
    const contratosSnapshot = await getDocs(contratosQuery);
    console.log(`📄 Found ${contratosSnapshot.size} contracts for MEIK LABS\n`);

    const contractsWithOrg = [];
    const contractsWithoutOrg = [];

    contratosSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contraparteOrganizacionId) {
        contractsWithOrg.push({
          titulo: data.titulo,
          contraparte: data.contraparte,
          contraparteOrganizacionId: data.contraparteOrganizacionId
        });
      } else {
        contractsWithoutOrg.push({
          titulo: data.titulo,
          contraparte: data.contraparte
        });
      }
    });

    console.log('✅ CONTRACTS WITH CONTRAPARTE ORGANIZATION LINKS:');
    console.log('-' .repeat(50));
    contractsWithOrg.forEach(contract => {
      console.log(`  📋 ${contract.titulo}`);
      console.log(`     Contraparte: ${contract.contraparte}`);
      console.log(`     Organization ID: ${contract.contraparteOrganizacionId}`);
      console.log('');
    });

    if (contractsWithoutOrg.length > 0) {
      console.log('❌ CONTRACTS WITHOUT CONTRAPARTE ORGANIZATION LINKS:');
      console.log('-' .repeat(50));
      contractsWithoutOrg.forEach(contract => {
        console.log(`  📋 ${contract.titulo}`);
        console.log(`     Contraparte: ${contract.contraparte}`);
        console.log('');
      });
    }

    // Summary
    console.log('📊 SUMMARY:');
    console.log('=' .repeat(30));
    console.log(`✅ Contracts with org links: ${contractsWithOrg.length}`);
    console.log(`❌ Contracts without org links: ${contractsWithoutOrg.length}`);
    console.log(`📈 Total contracts: ${contratosSnapshot.size}`);
    
    const percentage = Math.round((contractsWithOrg.length / contratosSnapshot.size) * 100);
    console.log(`📊 Setup completion: ${percentage}%`);

    console.log('\n🎯 CONTRAPARTE MODULE STATUS:');
    if (contractsWithoutOrg.length === 0) {
      console.log('✅ READY! All contracts are properly linked to contraparte organizations');
      console.log('✅ The contraparte module should work perfectly');
      console.log('✅ Users will see organization-isolated contraparte data');
    } else {
      console.log('⚠️  NEEDS ATTENTION: Some contracts are not linked to organizations');
      console.log('⚠️  The contraparte module may not show complete data');
    }

    console.log('\n📱 NEXT STEPS:');
    console.log('1. Test the contrapartes module in the web application');
    console.log('2. Verify that MEIK LABS users can see their contrapartes');
    console.log('3. Check that contract statistics are displayed correctly');
    console.log('4. Update contraparte contact information if needed');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyContraparteSetup();
