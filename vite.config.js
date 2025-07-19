import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      '5173-ife7jgqypeedazam86vh9-e5c0aff3.manusvm.computer',
      '5173-i38zexs2waeeplc8igmtc-6ef6679c.manusvm.computer',
      '5173-i5s8rts97hg1u8n77tb7l-052faf89.manusvm.computer',
      '5173-iw8y5rp043qkwxjko039d-90e4d933.manusvm.computer',
      '5174-iw8y5rp043qkwxjko039d-90e4d933.manusvm.computer'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor_react';
            }
            if (id.includes('firebase')) {
              return 'vendor_firebase';
            }
            if (id.includes('lexical')) {
              return 'vendor_lexical';
            }
            return 'vendor'; // All other node_modules go here
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js',
  },
})


