import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc } from 'firebase/firestore';
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

async function createContrapartesForMeikLabs() {
  try {
    console.log('🔍 Analyzing MEIK LABS contracts to extract contrapartes...\n');

    // Get all contracts for MEIK LABS
    const contratosQuery = query(
      collection(db, 'contratos'),
      where('organizacionId', '==', 'MEIK LABS')
    );
    
    const contratosSnapshot = await getDocs(contratosQuery);
    console.log(`Found ${contratosSnapshot.size} contracts for MEIK LABS`);

    // Extract unique contrapartes from contracts
    const contrapartesMap = new Map();
    const contractsByContraparte = new Map();

    contratosSnapshot.forEach(doc => {
      const data = doc.data();
      const contraparte = data.contraparte;
      
      if (contraparte && contraparte.trim() !== '') {
        if (!contrapartesMap.has(contraparte)) {
          contrapartesMap.set(contraparte, {
            nombre: contraparte,
            contracts: []
          });
          contractsByContraparte.set(contraparte, []);
        }
        
        contractsByContraparte.get(contraparte).push({
          id: doc.id,
          titulo: data.titulo,
          monto: data.monto,
          categoria: data.categoria,
          proyecto: data.proyecto,
          fechaInicio: data.fechaInicio,
          fechaTermino: data.fechaTermino
        });
      }
    });

    console.log(`\n📊 Found ${contrapartesMap.size} unique contrapartes:\n`);
    
    // Display contrapartes with their contract count
    for (const [nombre, info] of contrapartesMap.entries()) {
      const contractCount = contractsByContraparte.get(nombre).length;
      console.log(`  - ${nombre} (${contractCount} contracts)`);
    }

    console.log('\n🚀 Creating contraparte records...\n');

    // Check if contrapartes collection exists and what's already there
    const existingContrapartesQuery = query(
      collection(db, 'contrapartes'),
      where('organizacionAsociadaId', '==', 'MEIK LABS')
    );
    const existingSnapshot = await getDocs(existingContrapartesQuery);
    
    const existingNames = new Set();
    existingSnapshot.forEach(doc => {
      existingNames.add(doc.data().nombre);
    });

    console.log(`Found ${existingSnapshot.size} existing contraparte records for MEIK LABS`);

    let createdCount = 0;
    let skippedCount = 0;

    // Create contraparte records
    for (const [nombreContraparte] of contrapartesMap.entries()) {
      if (existingNames.has(nombreContraparte)) {
        console.log(`⏭️  Skipping "${nombreContraparte}" - already exists`);
        skippedCount++;
        continue;
      }

      const contracts = contractsByContraparte.get(nombreContraparte);
      const totalContracts = contracts.length;
      const totalValue = contracts.reduce((sum, contract) => sum + (contract.monto || 0), 0);
      
      // Determine contraparte type based on contract analysis
      const hasServiciosContracts = contracts.some(c => c.categoria === 'servicios');
      const hasLaboralContracts = contracts.some(c => c.categoria === 'laboral');
      const hasComprasContracts = contracts.some(c => c.categoria === 'compras');
      const hasVentasContracts = contracts.some(c => c.categoria === 'ventas');
      
      let tipo = 'empresa';
      if (hasLaboralContracts && totalContracts === 1) {
        tipo = 'persona'; // Individual employment contracts
      } else if (hasServiciosContracts || hasComprasContracts) {
        tipo = 'proveedor';
      } else if (hasVentasContracts) {
        tipo = 'cliente';
      }

      // Determine industry/sector based on contract categories and names
      let sector = 'otros';
      if (nombreContraparte.toLowerCase().includes('tech') || nombreContraparte.toLowerCase().includes('software')) {
        sector = 'tecnologia';
      } else if (nombreContraparte.toLowerCase().includes('inmobiliaria') || nombreContraparte.toLowerCase().includes('arrendamiento')) {
        sector = 'inmobiliario';
      } else if (nombreContraparte.toLowerCase().includes('consulting') || nombreContraparte.toLowerCase().includes('consultoria')) {
        sector = 'consultoria';
      } else if (nombreContraparte.toLowerCase().includes('hr') || hasLaboralContracts) {
        sector = 'recursos_humanos';
      } else if (nombreContraparte.toLowerCase().includes('papeleria') || nombreContraparte.toLowerCase().includes('suministro')) {
        sector = 'suministros';
      } else if (nombreContraparte.toLowerCase().includes('muebles') || nombreContraparte.toLowerCase().includes('mobiliario')) {
        sector = 'mobiliario';
      } else if (nombreContraparte.toLowerCase().includes('audit') || nombreContraparte.toLowerCase().includes('auditoria')) {
        sector = 'auditoria';
      } else if (nombreContraparte.toLowerCase().includes('agencia') || nombreContraparte.toLowerCase().includes('digital') || nombreContraparte.toLowerCase().includes('creative')) {
        sector = 'marketing';
      }

      // Create the contraparte record
      const contraparteData = {
        nombre: nombreContraparte,
        tipo: tipo,
        sector: sector,
        organizacionAsociadaId: 'MEIK LABS',
        
        // Contact information (placeholder - would need to be filled manually)
        contacto: {
          email: '',
          telefono: '',
          direccion: '',
          sitioWeb: ''
        },
        
        // Relationship metrics
        relacionComercial: {
          fechaInicioRelacion: contracts[0]?.fechaInicio || new Date(),
          totalContratos: totalContracts,
          valorTotalContratos: totalValue,
          estadoRelacion: 'activa',
          calificacionDesempeño: 3, // Default neutral rating
          notas: `Contraparte creada automáticamente basada en ${totalContracts} contrato${totalContracts > 1 ? 's' : ''} existente${totalContracts > 1 ? 's' : ''}.`
        },
        
        // Metadata
        fechaCreacion: new Date(),
        fechaUltimaModificacion: new Date(),
        creadoPor: 'system-migration',
        activo: true,
        
        // Tags based on contract analysis
        etiquetas: [
          ...new Set([
            tipo,
            sector,
            ...contracts.map(c => c.categoria).filter(Boolean),
            ...contracts.map(c => c.proyecto).filter(Boolean).map(p => p.toLowerCase().replace(/\s+/g, '_'))
          ])
        ],
        
        // Contract IDs for reference
        contratosAsociados: contracts.map(c => c.id)
      };

      try {
        const docRef = await addDoc(collection(db, 'contrapartes'), contraparteData);
        console.log(`✅ Created contraparte: "${nombreContraparte}" (ID: ${docRef.id})`);
        console.log(`   - Tipo: ${tipo}, Sector: ${sector}`);
        console.log(`   - ${totalContracts} contracts, Total value: $${totalValue.toLocaleString()}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creating contraparte "${nombreContraparte}":`, error);
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Created: ${createdCount} new contraparte records`);
    console.log(`⏭️  Skipped: ${skippedCount} existing records`);
    console.log(`📈 Total contrapartes for MEIK LABS: ${createdCount + skippedCount}`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Review the created contrapartes in the application');
    console.log('2. Update contact information manually as needed');
    console.log('3. Adjust performance ratings and relationship status');
    console.log('4. Add additional notes or documentation');

  } catch (error) {
    console.error('Error creating contrapartes:', error);
  }
}

createContrapartesForMeikLabs();
