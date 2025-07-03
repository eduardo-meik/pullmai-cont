# Wizard Testing Guide

## Quick Test Instructions

### Test the "Configurar más tarde" Fix

1. **Open the application**: 
   ```bash
   npm run dev
   ```
   Navigate to: http://localhost:5180

2. **Create a new user account**:
   - Go to `/signup`
   - Fill out the form and create account
   - After successful signup, you should be redirected to dashboard

3. **Test the wizard**:
   - The wizard should appear automatically for new users
   - Click through the steps or click "Configurar más tarde"
   - **Expected Result**: Wizard closes and does NOT reappear
   - User should be assigned to "MEIK LABS" organization

4. **Verify fix persistence**:
   - Refresh the page
   - Navigate to different routes
   - **Expected Result**: Wizard does NOT reappear

5. **Reset wizard (for testing)**:
   - Open browser developer tools (F12)
   - Go to Console tab
   - Run: `localStorage.removeItem('wizardCompleted')`
   - Refresh page
   - **Expected Result**: Wizard appears again

### Test Complete Wizard Flow

1. **Reset wizard**: `localStorage.removeItem('wizardCompleted')`
2. **Go through all steps**:
   - Welcome → Click "Comenzar configuración"
   - Organization → Choose option and click "Siguiente"
   - Preferences → Set preferences and click "Completar"
   - Completion → Wait for automatic redirect

3. **Verify organization setup**:
   - Check navbar for organization name
   - User should be assigned to chosen/created organization

## Expected Behaviors

### "Configurar más tarde" Button
- ✅ Closes wizard immediately
- ✅ Sets user to MEIK LABS organization
- ✅ Marks wizard as completed in localStorage
- ✅ Wizard doesn't reappear on refresh/navigation

### Complete Wizard Flow
- ✅ Can create new organization or use default
- ✅ Can set user preferences
- ✅ Shows completion message
- ✅ Automatically redirects to dashboard
- ✅ Wizard doesn't reappear

### Edge Cases
- ✅ Works on all authenticated routes
- ✅ Doesn't show for users who completed wizard
- ✅ Handles errors gracefully
- ✅ Can be closed by clicking backdrop (triggers skip)

## Troubleshooting

### Wizard not appearing
- Check if user is authenticated
- Verify localStorage: `localStorage.getItem('wizardCompleted')`
- Clear if needed: `localStorage.removeItem('wizardCompleted')`

### Wizard keeps reappearing
- This was the original bug - should be fixed now
- Check console for any JavaScript errors
- Verify localStorage is being set correctly

### Build errors
- All TypeScript compilation errors have been resolved
- Run `npm run build` to verify
