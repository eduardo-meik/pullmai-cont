import { useEffect } from 'react'
import { db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

const FirebaseConnectionTest: React.FC = () => {
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Testing Firebase connection...')
        console.log('🔗 Database instance:', db)
        console.log('🆔 App instance:', db.app)
        console.log('📝 App options:', db.app.options)
        
        // Try to fetch a simple document
        const testDoc = doc(db, 'test', 'connection')
        console.log('📄 Attempting to fetch test document...')
        
        const docSnap = await getDoc(testDoc)
        console.log('✅ Connection test successful!')
        console.log('📄 Document exists:', docSnap.exists())
        
      } catch (error: any) {
        console.error('❌ Firebase connection test failed:', error)
        console.error('🔍 Error code:', error.code)
        console.error('🔍 Error message:', error.message)
        
        if (error.code === 'permission-denied') {
          console.log('🔐 This is likely a permissions issue. Check Firestore rules.')
        } else if (error.code === 'unavailable') {
          console.log('🌐 This is likely a network connectivity issue.')
        } else if (error.message.includes('404')) {
          console.log('🔍 This suggests the Firebase project or database does not exist.')
        }
      }
    }
    
    testConnection()
  }, [])

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-medium text-yellow-800">Firebase Connection Test</h3>
      <p className="text-sm text-yellow-600 mt-1">
        Check the browser console for connection test results.
      </p>
    </div>
  )
}

export default FirebaseConnectionTest
