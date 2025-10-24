
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Fix: Import process to provide types for `process.cwd()` and to use `process.env`.
import process from 'process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This loads environment variables into process.env.
  loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy for non-streaming, analysis requests now uses the flash model
        '/api/proxy-pro': {
          // Fix: Use process.env.API_KEY as per guidelines.
          target: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.API_KEY}`,
          changeOrigin: true,
          // Fix: Corrected invalid regex syntax which caused parsing errors. Switched to string replacement.
          rewrite: (path) => path.replace('/api/proxy-pro', ''),
        },
        // Proxy for streaming, interactive chat requests using the fast model
        '/api/proxy-flash': {
          // Fix: Use process.env.API_KEY as per guidelines.
          target: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${process.env.API_KEY}`,
          changeOrigin: true,
          // Fix: Corrected invalid regex syntax.
          rewrite: (path) => path.replace('/api/proxy-flash', ''),
        },
      }
    }
  }
})
