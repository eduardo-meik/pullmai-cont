// Utility to clear cached auth data and force fresh user data fetch
// This should be run in the browser console or as a temporary fix

console.log('🔧 Clearing cached authentication data...')

// Clear localStorage auth data
const authStorageKey = 'auth-storage'
if (localStorage.getItem(authStorageKey)) {
  localStorage.removeItem(authStorageKey)
  console.log('✅ Cleared auth-storage from localStorage')
}

// Clear any other potential cache keys
const potentialKeys = ['auth-storage', 'usuario', 'pullmai-auth', 'firebase-auth']
potentialKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key)
    console.log(`✅ Cleared ${key} from localStorage`)
  }
})

// Clear sessionStorage as well
potentialKeys.forEach(key => {
  if (sessionStorage.getItem(key)) {
    sessionStorage.removeItem(key)
    console.log(`✅ Cleared ${key} from sessionStorage`)
  }
})

console.log('🔄 Cache cleared! Please refresh the page and log in again.')
console.log('📝 Note: The user organization has been updated in the database.')

// Optional: Force reload the page
// window.location.reload()
