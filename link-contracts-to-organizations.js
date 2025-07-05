import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, writeBatch } from 'firebase/firestore';
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

// Helper function to generate organization ID from name (same as creation script)
function generateOrgId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

async function updateContractsWithOrganizationReferences() {
  try {
    console.log('🔗 Updating MEIK LABS contracts with organization references...\n');

    // Get all organizations to create a mapping
    const organizacionesSnapshot = await getDocs(collection(db, 'organizaciones'));
    const orgsByName = new Map();
    
    organizacionesSnapshot.forEach(doc => {
      const data = doc.data();
      orgsByName.set(data.nombre, {
        id: doc.id,
        nombre: data.nombre,
        tipo: data.tipo
      });
    });

    console.log(`📋 Found ${orgsByName.size} organizations in database`);

    // Get all contracts for MEIK LABS
    const contratosQuery = query(
      collection(db, 'contratos'),
      where('organizacionId', '==', 'MEIK LABS')
    );
    
    const contratosSnapshot = await getDocs(contratosQuery);
    console.log(`📄 Found ${contratosSnapshot.size} contracts for MEIK LABS\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    const batch = writeBatch(db);

    // Process each contract
    contratosSnapshot.forEach(contractDoc => {
      const contractData = contractDoc.data();
      const contraparteName = contractData.contraparte;
      
      if (!contraparteName || contraparteName.trim() === '') {
        console.log(`⏭️  Skipping contract "${contractData.titulo}" - no contraparte name`);
        skippedCount++;
        return;
      }

      // Check if contract already has contraparteOrganizacionId
      if (contractData.contraparteOrganizacionId) {
        console.log(`⏭️  Skipping contract "${contractData.titulo}" - already has contraparteOrganizacionId: ${contractData.contraparteOrganizacionId}`);
        skippedCount++;
        return;
      }

      // Find matching organization
      const organization = orgsByName.get(contraparteName);
      
      if (!organization) {
        console.log(`❌ No organization found for contraparte: "${contraparteName}" in contract "${contractData.titulo}"`);
        notFoundCount++;
        return;
      }

      // Update contract with organization reference
      const contractRef = doc(db, 'contratos', contractDoc.id);
      batch.update(contractRef, {
        contraparteOrganizacionId: organization.id,
        fechaUltimaModificacion: new Date()
      });

      console.log(`✅ Linking contract "${contractData.titulo}" to organization "${organization.nombre}" (${organization.id})`);
      updatedCount++;
    });

    // Commit the batch update
    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} contract updates...`);
      await batch.commit();
      console.log('✅ All contract updates committed successfully!');
    }

    console.log('\n📊 UPDATE SUMMARY:');
    console.log(`✅ Updated: ${updatedCount} contracts with organization references`);
    console.log(`⏭️  Skipped: ${skippedCount} contracts (already linked or no contraparte)`);
    console.log(`❌ Not found: ${notFoundCount} contracts with unmatched contrapartes`);
    console.log(`📈 Total processed: ${updatedCount + skippedCount + notFoundCount} contracts`);

    if (notFoundCount > 0) {
      console.log('\n⚠️  Some contracts have contrapartes that don\'t exist as organizations.');
      console.log('   You may need to create additional organizations or check the contraparte names.');
    }

    if (updatedCount > 0) {
      console.log('\n🎉 Success! MEIK LABS contracts are now linked to their contraparte organizations.');
      console.log('   The ContraparteOrganizacionService should now be able to show these relationships.');
    }

    // Verification: Check the results
    console.log('\n🔍 VERIFICATION:');
    const verificationQuery = query(
      collection(db, 'contratos'),
      where('organizacionId', '==', 'MEIK LABS')
    );
    
    const verificationSnapshot = await getDocs(verificationQuery);
    let linkedCount = 0;
    let unlinkedCount = 0;
    
    verificationSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.contraparteOrganizacionId) {
        linkedCount++;
      } else {
        unlinkedCount++;
        console.log(`  🔗 Unlinked: "${data.titulo}" - contraparte: "${data.contraparte}"`);
      }
    });

    console.log(`✅ ${linkedCount} contracts have contraparteOrganizacionId`);
    console.log(`❌ ${unlinkedCount} contracts still missing contraparteOrganizacionId`);

  } catch (error) {
    console.error('Error updating contracts:', error);
  }
}

updateContractsWithOrganizationReferences();
