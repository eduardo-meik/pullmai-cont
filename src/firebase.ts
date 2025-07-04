import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

// Debug environment variables
console.log('🔍 Firebase Environment Variables Debug:')
console.log('API_KEY:', import.meta.env.VITE_API_KEY ? '✅ Set' : '❌ Missing')
console.log('AUTH_DOMAIN:', import.meta.env.VITE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing')
console.log('PROJECT_ID:', import.meta.env.VITE_PROJECT_ID ? '✅ Set' : '❌ Missing')
console.log('STORAGE_BUCKET:', import.meta.env.VITE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing')
console.log('MESSAGING_SENDER_ID:', import.meta.env.VITE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing')
console.log('APP_ID:', import.meta.env.VITE_APP_ID ? '✅ Set' : '❌ Missing')

// Production-ready configuration with environment variables only
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
}

// Validate required Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration error: Missing required environment variables!')
  console.error('Please ensure your .env file contains all required VITE_* variables.')
  console.error('Check .env.template for the complete list of required variables.')
}

// Validate critical configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  console.error('🚨 Firebase API Key is missing or undefined!')
  console.error('Available env vars:', Object.keys(import.meta.env))
}

if (!firebaseConfig.apiKey.startsWith('AIza')) {
  console.error('🚨 Firebase API Key format is incorrect!')
}

console.log('🔧 Final Firebase Config:')
console.log('API Key:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING')
console.log('Project ID:', firebaseConfig.projectId)
console.log('Auth Domain:', firebaseConfig.authDomain)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export default app
