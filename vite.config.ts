import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    host: true
  },
  define: {
    // Ensure environment variables are available at build time
    'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY),
    'process.env.VITE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_AUTH_DOMAIN),
    'process.env.VITE_PROJECT_ID': JSON.stringify(process.env.VITE_PROJECT_ID),
    'process.env.VITE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_STORAGE_BUCKET),
    'process.env.VITE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_MESSAGING_SENDER_ID),
    'process.env.VITE_APP_ID': JSON.stringify(process.env.VITE_APP_ID),
    'process.env.VITE_MEASUREMENT_ID': JSON.stringify(process.env.VITE_MEASUREMENT_ID),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
      }
    }
  },
  envDir: '.',
  envPrefix: 'VITE_'
})
