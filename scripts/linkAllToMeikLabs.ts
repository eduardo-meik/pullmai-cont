import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { db } from './firebaseNode'

const ORGANIZACION_ID = 'MEIK LABS' // Set this to the correct org ID if it's a UID

async function linkAllToMeikLabs() {
  // Update proyectos
  const proyectosRef = collection(db, 'proyectos')
  const proyectosSnap = await getDocs(proyectosRef)
  const proyectosBatch = writeBatch(db)
  proyectosSnap.forEach((proy) => {
    proyectosBatch.update(doc(db, 'proyectos', proy.id), { organizacionId: ORGANIZACION_ID })
  })
  await proyectosBatch.commit()
  console.log(`Updated ${proyectosSnap.size} proyectos to MEIK LABS`)

  // Update contratos
  const contratosRef = collection(db, 'contratos')
  const contratosSnap = await getDocs(contratosRef)
  const contratosBatch = writeBatch(db)
  contratosSnap.forEach((cont) => {
    contratosBatch.update(doc(db, 'contratos', cont.id), { organizacionId: ORGANIZACION_ID })
  })
  await contratosBatch.commit()
  console.log(`Updated ${contratosSnap.size} contratos to MEIK LABS`)
}

linkAllToMeikLabs().catch(console.error)
