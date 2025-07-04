// Firebase configuration debug script
console.log('🔍 Debugging Firebase Configuration...')

// Check environment variables
const envVars = {
  VITE_API_KEY: import.meta.env.VITE_API_KEY,
  VITE_AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
  VITE_PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
  VITE_STORAGE_BUCKET: import.meta.env.VITE_STORAGE_BUCKET,
  VITE_MESSAGING_SENDER_ID: import.meta.env.VITE_MESSAGING_SENDER_ID,
  VITE_APP_ID: import.meta.env.VITE_APP_ID,
}

console.log('📋 Environment Variables:')
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'} ${value ? `(${value.substring(0, 20)}...)` : ''}`)
})

// Test Firebase configuration
const firebaseConfig = {
  apiKey: envVars.VITE_API_KEY,
  authDomain: envVars.VITE_AUTH_DOMAIN,
  projectId: envVars.VITE_PROJECT_ID,
  storageBucket: envVars.VITE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_APP_ID,
}

console.log('🔧 Firebase Config Object:')
console.log(firebaseConfig)

// Check for common issues
if (!firebaseConfig.apiKey) {
  console.error('❌ API Key is missing!')
}

if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('AIza')) {
  console.error('❌ API Key format looks incorrect (should start with "AIza")')
}

if (!firebaseConfig.projectId) {
  console.error('❌ Project ID is missing!')
}

console.log('🔍 Debug complete. Check console for issues.')

export {}
