# Login and Wizard Fixes

## Issues Fixed:

### 1. Double Login Issue ✅
**Problem**: Users had to login twice to reach the dashboard due to unnecessary Promise waiting in the login function.

**Solution**: Simplified the login function to directly return the Firebase authentication result without waiting for auth state changes (which are already handled by the useEffect in AuthContext).

**Change in `src/contexts/AuthContext.tsx`**:
```typescript
// Before (causing double login)
async function login(email: string, password: string): Promise<any> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
  // This was causing the issue - unnecessary wait
  await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === userCredential.user.uid) {
        unsubscribe()
        resolve(void 0)
      }
    })
  })
  
  return userCredential
}

// After (single login)
async function login(email: string, password: string): Promise<any> {
  return signInWithEmailAndPassword(auth, email, password)
}
```

### 2. Persistent Wizard Popup Issue ✅
**Problem**: The "Configuración inicial" wizard was showing for all users, even those with established organizations and complete profiles.

**Solution**: Improved the wizard detection logic to only show for truly new users who need onboarding.

**Changes in `src/hooks/useFirstTimeWizard.ts`**:

**Better Detection Logic**:
- Check if user has a complete profile (name, surname, organization, role)
- Check if user account is established (more than 24 hours old)
- Separate "completed" vs "dismissed" states
- Don't show for users with proper profile data

**New Logic**:
```typescript
// Check if user profile seems complete
const hasCompleteProfile = usuario.nombre && 
                          usuario.nombre !== 'Usuario' && 
                          usuario.apellido &&
                          usuario.organizacionId && 
                          usuario.rol

// Check if user account seems established
const isEstablishedUser = userCreationTime && 
                         (Date.now() - userCreationTime.getTime()) > 24 * 60 * 60 * 1000

// Only show for truly new users
const shouldShowWizard = !wizardCompleted && 
                        !wizardDismissed &&
                        !hasCompleteProfile &&
                        !isEstablishedUser
```

**Dismiss vs Complete**:
- `closeWizard()` → Sets `wizardDismissed` (user closed without completing)
- `completeWizard()` → Sets `wizardCompleted` (user finished the wizard)

## Testing:

✅ **Build**: Project builds successfully  
✅ **TypeScript**: No type errors  
✅ **Login Flow**: Simplified authentication flow  
✅ **Wizard Logic**: Improved detection for new vs existing users  

## Manual Override (if needed):

If you need to manually control the wizard state:

```javascript
// In browser console - Force hide wizard
localStorage.setItem('wizardDismissed', 'true')

// Or mark as completed
localStorage.setItem('wizardCompleted', 'true')

// Reset wizard (show again)
localStorage.removeItem('wizardDismissed')
localStorage.removeItem('wizardCompleted')
```

## Expected Results:

1. **Single Login**: Users should now login once and immediately reach the dashboard
2. **No Wizard for Existing Users**: Users with complete profiles won't see the wizard popup
3. **Wizard for New Users Only**: Only truly new users without established profiles will see the onboarding wizard
