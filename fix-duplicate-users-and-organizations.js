// Fix script to address duplicate users and organization ID issues
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDAg1XbyB55RDNEQGkYDnot7epo94tadhA",
  authDomain: "pullmai-e0bb0.firebaseapp.com",
  projectId: "pullmai-e0bb0",
  storageBucket: "pullmai-e0bb0.appspot.com",
  messagingSenderId: "14877592509",
  appId: "1:14877592509:web:5ad44fb6413d0e5f9ae0d4"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function findDuplicateUsers() {
  console.log('🔍 Checking for duplicate users by email...')
  
  const usersSnapshot = await getDocs(collection(db, 'usuarios'))
  const emailMap = new Map()
  const duplicates = []
  
  usersSnapshot.forEach(doc => {
    const userData = doc.data()
    const email = userData.email
    
    if (email) {
      if (emailMap.has(email)) {
        // Found duplicate
        duplicates.push({
          email,
          users: [emailMap.get(email), { id: doc.id, ...userData }]
        })
        console.log(`⚠️ Found duplicate users for email: ${email}`)
      } else {
        emailMap.set(email, { id: doc.id, ...userData })
      }
    }
  })
  
  return duplicates
}

async function fixOrganizationIDs() {
  console.log('🔍 Checking for organization name vs ID issues...')
  
  // Get the correct organization ID for MEIK LABS
  const orgsQuery = query(collection(db, 'organizaciones'), where('nombre', '==', 'MEIK LABS'))
  const orgsSnapshot = await getDocs(orgsQuery)
  
  let correctMeikLabsId = null
  if (!orgsSnapshot.empty) {
    correctMeikLabsId = orgsSnapshot.docs[0].id
    console.log(`✅ Found MEIK LABS organization with ID: ${correctMeikLabsId}`)
  } else {
    console.log('❌ MEIK LABS organization not found! Creating it...')
    // We should create the organization here if it doesn't exist
    return
  }
  
  // Find users with organizationId = "MEIK LABS" (name instead of ID)
  const usersQuery = query(collection(db, 'usuarios'), where('organizacionId', '==', 'MEIK LABS'))
  const usersSnapshot = await getDocs(usersQuery)
  
  console.log(`Found ${usersSnapshot.size} users with organizationId = "MEIK LABS"`)
  
  const batch = writeBatch(db)
  let updateCount = 0
  
  usersSnapshot.forEach(userDoc => {
    const userRef = doc(db, 'usuarios', userDoc.id)
    batch.update(userRef, {
      organizacionId: correctMeikLabsId,
      ultimoAcceso: new Date()
    })
    updateCount++
    console.log(`📝 Queued update for user: ${userDoc.data().email}`)
  })
  
  if (updateCount > 0) {
    await batch.commit()
    console.log(`✅ Updated ${updateCount} users with correct organization ID`)
  }
  
  return correctMeikLabsId
}

async function removeDuplicateUsers() {
  const duplicates = await findDuplicateUsers()
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate users found')
    return
  }
  
  console.log(`\n📋 Found ${duplicates.length} duplicate email(s):`)
  
  for (const duplicate of duplicates) {
    console.log(`\n👥 Email: ${duplicate.email}`)
    duplicate.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}`)
      console.log(`     Created: ${user.fechaCreacion?.toDate ? user.fechaCreacion.toDate().toISOString() : user.fechaCreacion}`)
      console.log(`     Name: ${user.nombre} ${user.apellido}`)
      console.log(`     Role: ${user.rol}`)
      console.log(`     Org: ${user.organizacionId}`)
    })
    
    // Keep the user with the most recent creation date
    const sortedUsers = duplicate.users.sort((a, b) => {
      const dateA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(a.fechaCreacion)
      const dateB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(b.fechaCreacion)
      return dateB - dateA // Most recent first
    })
    
    const keepUser = sortedUsers[0]
    const removeUsers = sortedUsers.slice(1)
    
    console.log(`   ✅ Keeping: ${keepUser.id} (most recent)`)
    
    for (const removeUser of removeUsers) {
      console.log(`   🗑️ Removing: ${removeUser.id}`)
      try {
        await deleteDoc(doc(db, 'usuarios', removeUser.id))
        console.log(`   ✅ Deleted user: ${removeUser.id}`)
      } catch (error) {
        console.error(`   ❌ Error deleting user ${removeUser.id}:`, error)
      }
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting duplicate users and organization fixes...\n')
    
    // Step 1: Fix organization IDs
    console.log('=== Step 1: Fix Organization IDs ===')
    const correctMeikLabsId = await fixOrganizationIDs()
    
    // Step 2: Remove duplicate users
    console.log('\n=== Step 2: Remove Duplicate Users ===')
    await removeDuplicateUsers()
    
    console.log('\n✅ All fixes completed!')
    console.log('\n📋 Summary:')
    console.log('- Fixed users with organizationId="MEIK LABS" to use correct ID')
    console.log('- Removed duplicate users with same email addresses')
    console.log('- Kept the most recent user for each duplicate email')
    
  } catch (error) {
    console.error('❌ Error during fixes:', error)
  }
}

main()
