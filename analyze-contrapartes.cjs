const fs = require('fs');
const path = require('path');

// Read the contracts files and extract contrapartes
function readContractsFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const contraparteMatches = content.match(/contraparte:\s*["']([^"']+)["']/g);
    
    if (!contraparteMatches) return [];
    
    return contraparteMatches.map(match => {
      const result = match.match(/contraparte:\s*["']([^"']+)["']/);
      return result ? result[1] : null;
    }).filter(Boolean);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Generate organization ID from name
function generateOrgId(nombre) {
  return 'org-' + nombre
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Determine industry from name
function determineIndustry(nombre) {
  const lowercaseName = nombre.toLowerCase();
  
  if (lowercaseName.includes('tech') || 
      lowercaseName.includes('software') || 
      lowercaseName.includes('digital') ||
      lowercaseName.includes('analytics')) {
    return 'Tecnología';
  }
  
  if (lowercaseName.includes('inmobiliaria') || 
      lowercaseName.includes('arquitectos') || 
      lowercaseName.includes('construccion')) {
    return 'Inmobiliario';
  }
  
  if (lowercaseName.includes('marketing') || 
      lowercaseName.includes('publicidad')) {
    return 'Marketing';
  }
  
  if (lowercaseName.includes('hr') || 
      lowercaseName.includes('consulting') || 
      lowercaseName.includes('consultoria')) {
    return 'Consultoría';
  }
  
  if (lowercaseName.includes('logistics') || 
      lowercaseName.includes('distribution') || 
      lowercaseName.includes('trade')) {
    return 'Logística';
  }
  
  if (lowercaseName.includes('seguros') || 
      lowercaseName.includes('insurance')) {
    return 'Seguros';
  }
  
  if (lowercaseName.includes('auditoria') || 
      lowercaseName.includes('audit')) {
    return 'Auditoría';
  }
  
  if (lowercaseName.includes('maintenance') || 
      lowercaseName.includes('support') || 
      lowercaseName.includes('service')) {
    return 'Servicios';
  }
  
  if (lowercaseName.includes('papeleria') || 
      lowercaseName.includes('suministros') || 
      lowercaseName.includes('corporativa')) {
    return 'Suministros';
  }
  
  return 'Otros';
}

// Determine organization type from name
function determineOrgType(nombre) {
  const lowercaseName = nombre.toLowerCase();
  
  if (lowercaseName.includes('spa') || 
      lowercaseName.includes('sa') || 
      lowercaseName.includes('ltda') || 
      lowercaseName.includes('inc') || 
      lowercaseName.includes('corp') ||
      lowercaseName.includes('gmbh') ||
      lowercaseName.includes('solutions') ||
      lowercaseName.includes('pro') ||
      lowercaseName.includes('group')) {
    return 'empresa';
  }
  
  if (lowercaseName.includes('gobierno') || 
      lowercaseName.includes('ministerio') || 
      lowercaseName.includes('municipal')) {
    return 'gobierno';
  }
  
  if (lowercaseName.includes('fundacion') || 
      lowercaseName.includes('ong') || 
      lowercaseName.includes('asociacion')) {
    return 'ong';
  }
  
  return 'empresa'; // Default to empresa
}

// Main execution
console.log('🚀 Analyzing Contrapartes from Contract Files');
console.log('=============================================\n');

// Read contracts from both files
const contratosFile1 = path.join(__dirname, 'src', 'data', 'contratosEjemplo.ts');
const contratosFile2 = path.join(__dirname, 'src', 'data', 'contratosEjemplo_new.ts');

const contrapartes1 = readContractsFile(contratosFile1);
const contrapartes2 = readContractsFile(contratosFile2);

// Additional contrapartes to include
const additionalContrapartes = [
  "Papelería Corporativa Ltda"
];

// Combine and get unique contrapartes
const allContrapartes = [...contrapartes1, ...contrapartes2, ...additionalContrapartes];
const uniqueContrapartes = [...new Set(allContrapartes)].sort();

console.log(`📊 Analysis Results:`);
console.log(`  • File 1 (contratosEjemplo.ts): ${contrapartes1.length} contrapartes`);
console.log(`  • File 2 (contratosEjemplo_new.ts): ${contrapartes2.length} contrapartes`);
console.log(`  • Additional contrapartes: ${additionalContrapartes.length}`);
console.log(`  • Total unique contrapartes: ${uniqueContrapartes.length}\n`);

console.log('📋 Unique Contrapartes List:');
console.log('============================');

uniqueContrapartes.forEach((contraparte, index) => {
  const orgId = generateOrgId(contraparte);
  const industry = determineIndustry(contraparte);
  const type = determineOrgType(contraparte);
  
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${contraparte}`);
  console.log(`    ID: ${orgId}`);
  console.log(`    Type: ${type}`);
  console.log(`    Industry: ${industry}`);
  console.log('    ---');
});

console.log(`\n🎯 Summary: ${uniqueContrapartes.length} unique organizations to create\n`);

// Generate organization creation data
console.log('🏢 Organization Creation Data:');
console.log('==============================');

const organizationsData = uniqueContrapartes.map(contraparte => {
  const orgId = generateOrgId(contraparte);
  const industry = determineIndustry(contraparte);
  
  return {
    id: orgId,
    nombre: contraparte,
    descripcion: `Organización contraparte - ${industry}`,
    logo: null,
    activa: true,
    fechaCreacion: new Date().toISOString(),
    configuracion: {
      tiposContratoPermitidos: ['servicio', 'compra', 'venta', 'otro'],
      flujoAprobacion: false,
      notificacionesEmail: false,
      retencionDocumentos: 365,
      plantillasPersonalizadas: false
    }
  };
});

// Save to JSON file for easy import
const outputFile = path.join(__dirname, 'organizations-from-contrapartes.json');
fs.writeFileSync(outputFile, JSON.stringify(organizationsData, null, 2));

console.log(`📄 Organization data saved to: ${outputFile}`);
console.log(`\n✅ Analysis completed successfully!`);

// Show first few organizations as examples
console.log('\n📝 Sample Organization Data (first 3):');
console.log('=====================================');
organizationsData.slice(0, 3).forEach((org, index) => {
  console.log(`${index + 1}. ${org.nombre}:`);
  console.log(`   ID: ${org.id}`);
  console.log(`   Description: ${org.descripcion}`);
  console.log(`   Active: ${org.activa}`);
  console.log('   ---');
});

if (organizationsData.length > 3) {
  console.log(`   ... and ${organizationsData.length - 3} more organizations`);
}
