import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// FIX: Import `process` to provide type definitions for `process.cwd()`
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy for non-streaming, analysis requests using the powerful model
        '/api/proxy-pro': {
          target: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${env.API_KEY}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proxy-pro/, ''),
        },
        // Proxy for streaming, interactive chat requests using the fast model
        '/api/proxy-flash': {
          target: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${env.API_KEY}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proxy-flash/, ''),
        },
      }
    }
  }
})
