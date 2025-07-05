import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
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

// Helper function to generate organization ID from name
function generateOrgId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to determine organization type and sector
function analyzeOrganization(name, contracts) {
  const hasServiciosContracts = contracts.some(c => c.categoria === 'servicios');
  const hasLaboralContracts = contracts.some(c => c.categoria === 'laboral');
  const hasComprasContracts = contracts.some(c => c.categoria === 'compras');
  const hasVentasContracts = contracts.some(c => c.categoria === 'ventas');
  
  let tipo = 'empresa';
  if (hasLaboralContracts && contracts.length === 1) {
    tipo = 'persona'; // Individual employment contracts
  } else if (hasServiciosContracts || hasComprasContracts) {
    tipo = 'proveedor';
  } else if (hasVentasContracts) {
    tipo = 'cliente';
  }

  // Determine industry/sector
  let sector = 'otros';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('tech') || lowerName.includes('software')) {
    sector = 'tecnologia';
  } else if (lowerName.includes('inmobiliaria') || lowerName.includes('arrendamiento')) {
    sector = 'inmobiliario';
  } else if (lowerName.includes('consulting') || lowerName.includes('consultoria')) {
    sector = 'consultoria';
  } else if (lowerName.includes('hr') || hasLaboralContracts) {
    sector = 'recursos_humanos';
  } else if (lowerName.includes('papeleria') || lowerName.includes('suministro')) {
    sector = 'suministros';
  } else if (lowerName.includes('muebles') || lowerName.includes('mobiliario')) {
    sector = 'mobiliario';
  } else if (lowerName.includes('audit') || lowerName.includes('auditoria')) {
    sector = 'auditoria';
  } else if (lowerName.includes('agencia') || lowerName.includes('digital') || lowerName.includes('creative')) {
    sector = 'marketing';
  } else if (lowerName.includes('translation') || lowerName.includes('traduccion')) {
    sector = 'servicios_linguisticos';
  } else if (lowerName.includes('trade') || lowerName.includes('partners')) {
    sector = 'comercio_internacional';
  } else if (lowerName.includes('support') || lowerName.includes('soporte')) {
    sector = 'soporte_tecnico';
  }

  return { tipo, sector };
}

async function createOrganizationsForMeikLabsContrapartes() {
  try {
    console.log('🏢 Creating organizations for MEIK LABS contrapartes...\n');

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
          monto: data.monto || 0,
          categoria: data.categoria,
          proyecto: data.proyecto,
          fechaInicio: data.fechaInicio,
          fechaTermino: data.fechaTermino
        });
      }
    });

    console.log(`📊 Found ${contrapartesMap.size} unique contrapartes\n`);

    // Check which organizations already exist
    const existingOrgsQuery = query(collection(db, 'organizaciones'));
    const existingOrgsSnapshot = await getDocs(existingOrgsQuery);
    const existingOrgNames = new Set();
    existingOrgsSnapshot.forEach(doc => {
      existingOrgNames.add(doc.data().nombre);
    });

    let createdCount = 0;
    let skippedCount = 0;
    const createdOrganizations = [];
    const batch = writeBatch(db);

    // Create organization records
    for (const [nombreContraparte] of contrapartesMap.entries()) {
      if (existingOrgNames.has(nombreContraparte)) {
        console.log(`⏭️  Skipping "${nombreContraparte}" - organization already exists`);
        skippedCount++;
        continue;
      }

      const contracts = contractsByContraparte.get(nombreContraparte);
      const totalContracts = contracts.length;
      const totalValue = contracts.reduce((sum, contract) => sum + contract.monto, 0);
      
      const { tipo, sector } = analyzeOrganization(nombreContraparte, contracts);
      const orgId = generateOrgId(nombreContraparte);

      // Create the organization record
      const organizacionData = {
        nombre: nombreContraparte,
        tipo: tipo,
        sector: sector,
        
        // Contact information (placeholder)
        contacto: {
          email: '',
          telefono: '',
          direccion: '',
          sitioWeb: ''
        },
        
        // Business information
        informacionComercial: {
          razonSocial: nombreContraparte,
          rut: '',
          giro: sector,
          pais: 'Chile',
          ciudad: '',
          direccionFiscal: ''
        },
        
        // Relationship metrics
        estadisticas: {
          totalContratos: totalContracts,
          montoTotal: totalValue,
          montoPromedio: totalContracts > 0 ? totalValue / totalContracts : 0,
          contratosActivos: contracts.filter(c => c.categoria === 'activo').length,
          ultimoContrato: contracts.length > 0 ? contracts[0].fechaInicio : new Date(),
          categoriasPrincipales: [...new Set(contracts.map(c => c.categoria).filter(Boolean))],
          proyectosInvolucrados: [...new Set(contracts.map(c => c.proyecto).filter(Boolean))]
        },
        
        // Metadata
        fechaCreacion: new Date(),
        fechaUltimaModificacion: new Date(),
        activo: true,
        
        // Tags
        etiquetas: [
          tipo,
          sector,
          'contraparte-meik-labs',
          ...new Set([
            ...contracts.map(c => c.categoria).filter(Boolean),
            ...contracts.map(c => c.proyecto).filter(Boolean).map(p => p.toLowerCase().replace(/\s+/g, '_'))
          ])
        ],
        
        // Notes
        notas: `Organización creada automáticamente como contraparte de MEIK LABS basada en ${totalContracts} contrato${totalContracts > 1 ? 's' : ''} existente${totalContracts > 1 ? 's' : ''}.`,
        
        // Contract references for quick lookup
        contratosAsociados: contracts.map(c => c.id)
      };

      try {
        const orgRef = doc(collection(db, 'organizaciones'), orgId);
        batch.set(orgRef, organizacionData);
        
        createdOrganizations.push({
          id: orgId,
          nombre: nombreContraparte,
          tipo,
          sector,
          contracts: contracts.length,
          totalValue
        });
        
        console.log(`✅ Prepared organization: "${nombreContraparte}" (ID: ${orgId})`);
        console.log(`   - Tipo: ${tipo}, Sector: ${sector}`);
        console.log(`   - ${totalContracts} contracts, Total value: $${totalValue.toLocaleString()}`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error preparing organization "${nombreContraparte}":`, error);
      }
    }

    // Commit the batch
    if (createdCount > 0) {
      console.log(`\n💾 Committing ${createdCount} organizations...`);
      await batch.commit();
      console.log('✅ All organizations created successfully!');
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Created: ${createdCount} new organization records`);
    console.log(`⏭️  Skipped: ${skippedCount} existing organizations`);
    console.log(`📈 Total organizations for MEIK LABS contrapartes: ${createdCount + skippedCount}`);
    
    if (createdOrganizations.length > 0) {
      console.log('\n📋 Created Organizations:');
      createdOrganizations.forEach(org => {
        console.log(`  - ${org.nombre} (${org.id}) - ${org.tipo}/${org.sector}`);
      });
      
      console.log('\n🔗 Next step: Update contracts to reference these organizations');
      console.log('   Run the contract update script to link contraparteOrganizacionId fields');
    }

  } catch (error) {
    console.error('Error creating organizations:', error);
  }
}

createOrganizationsForMeikLabsContrapartes();
