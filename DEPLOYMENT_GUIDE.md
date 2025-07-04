# Firebase Environment Variables Deployment Guide

This document provides instructions for deploying the Pullmai application with proper Firebase environment variables across different hosting platforms.

## Environment Variables Required

All hosting platforms need these environment variables set:

```
VITE_API_KEY=AIzaSyDAg1XbyB55RDNEQGkYDnot7epo94tadhA
VITE_AUTH_DOMAIN=pullmai-e0bb0.firebaseapp.com
VITE_PROJECT_ID=pullmai-e0bb0
VITE_STORAGE_BUCKET=pullmai-e0bb0.appspot.com
VITE_MESSAGING_SENDER_ID=14877592509
VITE_APP_ID=1:14877592509:web:5ad44fb6413d0e5f9ae0d4
VITE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Platform-Specific Instructions

### Vercel
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - Name: `VITE_API_KEY`, Value: `AIzaSyDAg1XbyB55RDNEQGkYDnot7epo94tadhA`
   - Name: `VITE_AUTH_DOMAIN`, Value: `pullmai-e0bb0.firebaseapp.com`
   - Name: `VITE_PROJECT_ID`, Value: `pullmai-e0bb0`
   - Name: `VITE_STORAGE_BUCKET`, Value: `pullmai-e0bb0.appspot.com`
   - Name: `VITE_MESSAGING_SENDER_ID`, Value: `14877592509`
   - Name: `VITE_APP_ID`, Value: `1:14877592509:web:5ad44fb6413d0e5f9ae0d4`
4. Redeploy your application

### Netlify
1. Go to Site settings → Environment variables
2. Click "Add a variable" for each environment variable
3. Enter the same key-value pairs as above
4. Trigger a new deploy

### Firebase Hosting
1. Use the `.env.production` file in your project root
2. Build command: `npm run build`
3. The environment variables will be included in the build

### GitHub Pages (with GitHub Actions)
Add to your repository secrets:
1. Go to Settings → Secrets and variables → Actions
2. Add each environment variable as a repository secret
3. Update your workflow file to use these secrets

Example GitHub Actions workflow:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
          VITE_AUTH_DOMAIN: ${{ secrets.VITE_AUTH_DOMAIN }}
          VITE_PROJECT_ID: ${{ secrets.VITE_PROJECT_ID }}
          VITE_STORAGE_BUCKET: ${{ secrets.VITE_STORAGE_BUCKET }}
          VITE_MESSAGING_SENDER_ID: ${{ secrets.VITE_MESSAGING_SENDER_ID }}
          VITE_APP_ID: ${{ secrets.VITE_APP_ID }}
          
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Local Development

For local development, the application will use:
1. `.env.local` (highest priority, ignored by git)
2. `.env.production` (for production builds)
3. Hardcoded fallbacks in `firebase.ts`

## Troubleshooting

### Error: `auth/invalid-api-key`
1. Check browser console for debug messages
2. Verify all environment variables are set correctly
3. Ensure variables start with `VITE_` prefix
4. Rebuild and redeploy after setting variables

### Environment Variables Not Loading
1. Clear browser cache
2. Check that variables are set at build time, not runtime
3. Verify the hosting platform supports environment variables
4. Use the browser's Network tab to check if the built files contain the correct values

### Testing Environment Variables
1. Build locally: `npm run build`
2. Preview: `npm run preview`
3. Check browser console for debug messages
4. All variables should show "✅ Set"

## Security Notes

- These are public Firebase config values, safe to expose in client-side code
- Firebase security is handled through Firestore rules and Authentication
- No sensitive server-side keys are exposed

## Build Commands

- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Type check: `npx tsc --noEmit`
