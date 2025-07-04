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

// Production-ready configuration with proper fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "AIzaSyDAg1XbyB55RDNEQGkYDnot7epo94tadhA",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "pullmai-e0bb0.firebaseapp.com",
  projectId: import.meta.env.VITE_PROJECT_ID || "pullmai-e0bb0",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "pullmai-e0bb0.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "14877592509",
  appId: import.meta.env.VITE_APP_ID || "1:14877592509:web:5ad44fb6413d0e5f9ae0d4",
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
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
