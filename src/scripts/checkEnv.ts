/**
 * Environment Variables Checker
 * Validates that all required Firebase environment variables are set
 */

export const requiredEnvVars = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN', 
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID'
]

const optionalEnvVars = [
  'VITE_MEASUREMENT_ID'
]

console.log('🔍 Environment Variables Check\n')

let allRequiredSet = true

// Check required variables
console.log('📋 Required Variables:')
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  const isSet = value && value !== 'undefined' && value.trim() !== ''
  
  if (isSet) {
    // Mask sensitive values for logging
    const maskedValue = envVar === 'VITE_API_KEY' 
      ? `${value.substring(0, 10)}...` 
      : value
    console.log(`  ✅ ${envVar}: ${maskedValue}`)
  } else {
    console.log(`  ❌ ${envVar}: Missing or empty`)
    allRequiredSet = false
  }
}

// Check optional variables
console.log('\n📋 Optional Variables:')
for (const envVar of optionalEnvVars) {
  const value = process.env[envVar]
  const isSet = value && value !== 'undefined' && value.trim() !== ''
  
  if (isSet) {
    console.log(`  ✅ ${envVar}: ${value}`)
  } else {
    console.log(`  ⚠️  ${envVar}: Not set (optional)`)
  }
}

// Final status
console.log('\n' + '='.repeat(50))
if (allRequiredSet) {
  console.log('✅ All required environment variables are set!')
  console.log('🚀 Ready for deployment')
  process.exit(0)
} else {
  console.log('❌ Some required environment variables are missing')
  console.log('🛠️  Please set all required variables before deploying')
  console.log('\nRequired format:')
  requiredEnvVars.forEach(envVar => {
    console.log(`  ${envVar}=your_value_here`)
  })
  process.exit(1)
}
