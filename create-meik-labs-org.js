import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

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

async function createMeikLabsOrganization() {
  try {
    console.log('🏢 Creating MEIK LABS organization...');
    
    const meikLabsOrg = {
      nombre: "MEIK LABS",
      descripcion: "Laboratorio principal de desarrollo e innovación",
      logo: null,
      activa: true,
      fechaCreacion: new Date(),
      configuracion: {
        tiposContratoPermitidos: [
          "servicio",
          "compra", 
          "venta",
          "arrendamiento",
          "software",
          "mantenimiento",
          "consultoria",
          "otro"
        ],
        flujoAprobacion: true,
        notificacionesEmail: true,
        retencionDocumentos: 2555, // 7 años
        plantillasPersonalizadas: true
      },
      contacto: {
        email: "info@meiklabs.com",
        telefono: "+1-800-MEIK-LAB",
        direccion: "Innovation Hub, Tech District"
      },
      metadatos: {
        tipo: "principal",
        sector: "tecnologia",
        tamano: "mediana"
      }
    };

    // Create organization with specific ID "MEIK LABS"
    await setDoc(doc(db, 'organizaciones', 'MEIK LABS'), meikLabsOrg);
    
    console.log('✅ MEIK LABS organization created successfully with ID: "MEIK LABS"');
    
  } catch (error) {
    console.error('❌ Error creating MEIK LABS organization:', error);
  }
}

createMeikLabsOrganization();
