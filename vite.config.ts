import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise warning threshold — three.js chunk will be ~600KB, which is expected
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        // Function form required by TypeScript — group heavy deps into separate
        // cacheable chunks so the app shell loads faster
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'vendor-three';
          if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-lucide';
        },
      },
    },
  },
})
