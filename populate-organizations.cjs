const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
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
      databaseURL: `https://${process.env.VITE_PROJECT_ID}-default-rtdb.firebaseio.com`
    });
  } else {
    console.error('❌ Missing Firebase Admin SDK environment variables!');
    console.error('Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in your .env file');
    process.exit(1);
  }
}

const db = admin.firestore();

async function populateOrganizations() {
  try {
    console.log('🚀 Starting Organizations Population from Contrapartes');
    console.log('===================================================\n');

    // Read the generated organizations data
    const organizationsFile = path.join(__dirname, 'organizations-from-contrapartes.json');
    const organizationsData = JSON.parse(fs.readFileSync(organizationsFile, 'utf8'));

    console.log(`📋 Found ${organizationsData.length} organizations to process\n`);

    // Check existing organizations to avoid duplicates
    console.log('🔍 Checking existing organizations...');
    const existingOrgs = await db.collection('organizaciones').get();
    const existingNames = new Set();
    const existingIds = new Set();

    existingOrgs.forEach(doc => {
      const org = doc.data();
      existingNames.add(org.nombre);
      existingIds.add(doc.id);
    });

    console.log(`📊 Found ${existingOrgs.size} existing organizations\n`);

    let created = 0;
    let skipped = 0;
    let updated = 0;

    // Process each organization
    for (const orgData of organizationsData) {
      try {
        // Convert fechaCreacion string back to Firestore Timestamp
        const orgWithTimestamp = {
          ...orgData,
          fechaCreacion: admin.firestore.Timestamp.fromDate(new Date(orgData.fechaCreacion))
        };

        // Check if organization already exists by name or ID
        if (existingNames.has(orgData.nombre)) {
          console.log(`  ⏭️  Skipping ${orgData.nombre} (already exists by name)`);
          skipped++;
          continue;
        }

        if (existingIds.has(orgData.id)) {
          console.log(`  🔄 Updating ${orgData.nombre} (ID exists)`);
          await db.collection('organizaciones').doc(orgData.id).set(orgWithTimestamp, { merge: true });
          updated++;
        } else {
          console.log(`  ✅ Creating ${orgData.nombre} (ID: ${orgData.id})`);
          await db.collection('organizaciones').doc(orgData.id).set(orgWithTimestamp);
          created++;
        }

        // Small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`  ❌ Error processing ${orgData.nombre}:`, error.message);
      }
    }

    console.log('\n📊 Population Summary:');
    console.log('=====================');
    console.log(`  • Created: ${created} organizations`);
    console.log(`  • Updated: ${updated} organizations`);
    console.log(`  • Skipped: ${skipped} organizations (already existed)`);
    console.log(`  • Total processed: ${organizationsData.length} organizations`);

    // Verify the population
    console.log('\n🔍 Verifying population...');
    const finalCount = await db.collection('organizaciones').get();
    console.log(`📊 Total organizations in database: ${finalCount.size}`);

    console.log('\n🎉 Organizations population completed successfully!');

  } catch (error) {
    console.error('❌ Error populating organizations:', error);
    throw error;
  }
}

// Function to list all organizations (for verification)
async function listAllOrganizations() {
  try {
    console.log('📋 Current Organizations in Database:');
    console.log('===================================');

    const orgs = await db.collection('organizaciones').orderBy('nombre').get();
    
    orgs.forEach((doc, index) => {
      const org = doc.data();
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${org.nombre}`);
      console.log(`    ID: ${doc.id}`);
      console.log(`    Description: ${org.descripcion || 'No description'}`);
      console.log(`    Active: ${org.activa}`);
      console.log(`    Created: ${org.fechaCreacion?.toDate?.()?.toISOString?.()?.split('T')[0] || 'Unknown'}`);
      console.log('    ---');
    });

    console.log(`\n📊 Total: ${orgs.size} organizations`);

  } catch (error) {
    console.error('❌ Error listing organizations:', error);
  }
}

// Main execution
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--list') || args.includes('-l')) {
      await listAllOrganizations();
    } else if (args.includes('--populate') || args.includes('-p')) {
      await populateOrganizations();
    } else {
      console.log('🏢 Organization Management Script');
      console.log('=================================');
      console.log('');
      console.log('Usage:');
      console.log('  node populate-organizations.cjs --populate  # Populate organizations from contrapartes');
      console.log('  node populate-organizations.cjs --list      # List all existing organizations');
      console.log('');
      console.log('Options:');
      console.log('  -p, --populate    Populate organizations into Firebase');
      console.log('  -l, --list        List all organizations in Firebase');
      console.log('');
      
      // Show summary of what would be populated
      const organizationsFile = path.join(__dirname, 'organizations-from-contrapartes.json');
      if (fs.existsSync(organizationsFile)) {
        const organizationsData = JSON.parse(fs.readFileSync(organizationsFile, 'utf8'));
        console.log(`📋 Ready to populate ${organizationsData.length} organizations from contrapartes`);
        console.log('   Run with --populate to proceed');
      } else {
        console.log('❌ organizations-from-contrapartes.json not found');
        console.log('   Run analyze-contrapartes.cjs first');
      }
    }

  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    admin.app().delete();
  }
}

main();
