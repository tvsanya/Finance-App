import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  base: './',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('vue')) return 'vue-vendor';
          if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'chart-vendor';
          if (id.includes('jspdf')) return 'pdf-vendor';
          if (id.includes('idb')) return 'idb-vendor';
        }
      }
    }
    },
  },
  server: {
        port: 5173,
        host: true 
    }
})
