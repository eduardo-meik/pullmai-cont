import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore'
import { db } from './src/firebase'
import { contratosEjemplo } from './src/data/contratosEjemplo'
import { contratosEjemplo as contratosEjemploNew } from './src/data/contratosEjemplo_new'
import { Organizacion, TipoContrato } from './src/types'

/**
 * Script to extract unique contrapartes from contracts and create organizations
 * This will review all existing contracts and create organizations from contraparte fields
 */

// Additional contrapartes that should be included
const additionalContrapartes = [
  "Papelería Corporativa Ltda"
]

// Function to generate organization ID from name
function generateOrgId(nombre: string): string {
  return 'org-' + nombre
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Function to determine organization type from name
function determineOrgType(nombre: string): 'empresa' | 'gobierno' | 'ong' | 'persona' {
  const lowercaseName = nombre.toLowerCase()
  
  if (lowercaseName.includes('spa') || 
      lowercaseName.includes('sa') || 
      lowercaseName.includes('ltda') || 
      lowercaseName.includes('inc') || 
      lowercaseName.includes('corp') ||
      lowercaseName.includes('gmbh') ||
      lowercaseName.includes('solutions') ||
      lowercaseName.includes('pro') ||
      lowercaseName.includes('group')) {
    return 'empresa'
  }
  
  if (lowercaseName.includes('gobierno') || 
      lowercaseName.includes('ministerio') || 
      lowercaseName.includes('municipal')) {
    return 'gobierno'
  }
  
  if (lowercaseName.includes('fundacion') || 
      lowercaseName.includes('ong') || 
      lowercaseName.includes('asociacion')) {
    return 'ong'
  }
  
  return 'empresa' // Default to empresa
}

// Function to determine industry from name
function determineIndustry(nombre: string): string {
  const lowercaseName = nombre.toLowerCase()
  
  if (lowercaseName.includes('tech') || 
      lowercaseName.includes('software') || 
      lowercaseName.includes('digital') ||
      lowercaseName.includes('analytics')) {
    return 'Tecnología'
  }
  
  if (lowercaseName.includes('inmobiliaria') || 
      lowercaseName.includes('arquitectos') || 
      lowercaseName.includes('construccion')) {
    return 'Inmobiliario'
  }
  
  if (lowercaseName.includes('marketing') || 
      lowercaseName.includes('publicidad')) {
    return 'Marketing'
  }
  
  if (lowercaseName.includes('hr') || 
      lowercaseName.includes('consulting') || 
      lowercaseName.includes('consultoria')) {
    return 'Consultoría'
  }
  
  if (lowercaseName.includes('logistics') || 
      lowercaseName.includes('distribution') || 
      lowercaseName.includes('trade')) {
    return 'Logística'
  }
  
  if (lowercaseName.includes('seguros') || 
      lowercaseName.includes('insurance')) {
    return 'Seguros'
  }
  
  if (lowercaseName.includes('auditoria') || 
      lowercaseName.includes('audit')) {
    return 'Auditoría'
  }
  
  if (lowercaseName.includes('maintenance') || 
      lowercaseName.includes('support') || 
      lowercaseName.includes('service')) {
    return 'Servicios'
  }
  
  if (lowercaseName.includes('papeleria') || 
      lowercaseName.includes('suministros') || 
      lowercaseName.includes('corporativa')) {
    return 'Suministros'
  }
  
  return 'Otros'
}

// Extract unique contrapartes from contracts
function extractUniqueContrapartes(): string[] {
  const allContracts = [...contratosEjemplo, ...contratosEjemploNew]
  const contrapartes = new Set<string>()
  
  // Extract from existing contracts
  allContracts.forEach(contrato => {
    if (contrato.contraparte) {
      contrapartes.add(contrato.contraparte)
    }
  })
  
  // Add additional contrapartes
  additionalContrapartes.forEach(contraparte => {
    contrapartes.add(contraparte)
  })
  
  return Array.from(contrapartes).sort()
}

// Create organization data from contraparte name
function createOrganizationData(nombre: string): Omit<Organizacion, 'id' | 'fechaCreacion'> {
  const industry = determineIndustry(nombre)
  
  return {
    nombre,
    descripcion: `Organización contraparte - ${industry}`,
    logo: undefined,
    activa: true,
    configuracion: {
      tiposContratoPermitidos: [
        TipoContrato.SERVICIO,
        TipoContrato.COMPRA,
        TipoContrato.VENTA,
        TipoContrato.OTRO
      ],
      flujoAprobacion: false,
      notificacionesEmail: false,
      retencionDocumentos: 365,
      plantillasPersonalizadas: false
    }
  }
}

// Main function to create organizations from contrapartes
export async function createOrganizationsFromContrapartes(): Promise<void> {
  try {
    console.log('🔍 Extracting unique contrapartes from contracts...')
    
    const uniqueContrapartes = extractUniqueContrapartes()
    console.log(`📋 Found ${uniqueContrapartes.length} unique contrapartes:`)
    uniqueContrapartes.forEach((contraparte, index) => {
      console.log(`  ${index + 1}. ${contraparte}`)
    })
    
    console.log('\n🏢 Creating organizations...')
    
    // Check existing organizations to avoid duplicates
    const organizacionesRef = collection(db, 'organizaciones')
    const existingOrgs = await getDocs(organizacionesRef)
    const existingNames = new Set<string>()
    
    existingOrgs.forEach(doc => {
      const org = doc.data() as Organizacion
      existingNames.add(org.nombre)
    })
    
    let created = 0
    let skipped = 0
    
    for (const contraparte of uniqueContrapartes) {
      const orgId = generateOrgId(contraparte)
      
      // Check if organization already exists
      if (existingNames.has(contraparte)) {
        console.log(`  ⏭️  Skipping ${contraparte} (already exists)`)
        skipped++
        continue
      }
      
      // Create organization data
      const orgData = createOrganizationData(contraparte)
      const organizacion: Organizacion = {
        id: orgId,
        ...orgData,
        fechaCreacion: new Date()
      }
      
      // Save to Firestore
      await setDoc(doc(db, 'organizaciones', orgId), organizacion)
      
      console.log(`  ✅ Created: ${contraparte} (ID: ${orgId})`)
      created++
    }
    
    console.log('\n📊 Summary:')
    console.log(`  • Created: ${created} organizations`)
    console.log(`  • Skipped: ${skipped} organizations (already existed)`)
    console.log(`  • Total contrapartes processed: ${uniqueContrapartes.length}`)
    
    console.log('\n🎉 Organizations created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating organizations:', error)
    throw error
  }
}

// Function to list all contrapartes for review
export function listAllContrapartes(): void {
  console.log('📋 All Contrapartes from Contracts:')
  console.log('=====================================')
  
  const uniqueContrapartes = extractUniqueContrapartes()
  
  uniqueContrapartes.forEach((contraparte, index) => {
    const orgId = generateOrgId(contraparte)
    const industry = determineIndustry(contraparte)
    const type = determineOrgType(contraparte)
    
    console.log(`${index + 1}. ${contraparte}`)
    console.log(`   ID: ${orgId}`)
    console.log(`   Type: ${type}`)
    console.log(`   Industry: ${industry}`)
    console.log('   ---')
  })
  
  console.log(`\nTotal: ${uniqueContrapartes.length} unique contrapartes`)
}

// Function to add "Papelería Corporativa Ltda" to contracts data
export function addPapeleriaCorporativaContract() {
  console.log('📝 Adding sample contract for Papelería Corporativa Ltda')
  
  const papeleriaContract = {
    titulo: "Suministro de Material de Oficina",
    descripcion: "Contrato de suministro mensual de material de oficina, papelería y consumibles para la organización",
    contraparte: "Papelería Corporativa Ltda",
    contraparteId: "org-papeleria-corporativa-ltda",
    fechaInicio: new Date('2024-03-01'),
    fechaTermino: new Date('2025-02-28'),
    monto: 2400000,
    moneda: 'CLP',
    pdfUrl: 'https://example.com/contratos/papeleria-suministro.pdf',
    categoria: 'compras' as const,
    periodicidad: 'mensual' as const,
    tipo: 'egreso' as const,
    proyecto: 'Operaciones Generales',
    proyectoId: 'proj-operaciones',
    estado: 'activo' as const,
    organizacionId: 'org-001',
    departamento: 'Administración',
    responsableId: 'user-admin',
    documentoNombre: 'contrato-papeleria-suministro.pdf',
    documentoTamaño: 1500000,
    etiquetas: ['suministros', 'papeleria', 'oficina', 'mensual']
  }
  
  console.log('Contract details:', papeleriaContract)
  return papeleriaContract
}

// Run immediately if this script is executed directly
if (require.main === module) {
  console.log('🚀 Starting Contrapartes to Organizations Migration Script')
  console.log('=========================================================')
  
  // First, list all contrapartes for review
  listAllContrapartes()
  
  // Then create organizations (uncomment to run)
  // createOrganizationsFromContrapartes()
  //   .then(() => {
  //     console.log('✨ Migration completed successfully!')
  //     process.exit(0)
  //   })
  //   .catch((error) => {
  //     console.error('💥 Migration failed:', error)
  //     process.exit(1)
  //   })
}
