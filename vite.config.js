import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Usar 5173 por defecto pero permitir cambiar automáticamente si está ocupado
    port: parseInt(process.env.PORT || '5173', 10),
    strictPort: false, // Permite a Vite usar el siguiente puerto disponible
    cors: true,
    fs: {
      allow: ['..', '/']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      // No fijamos el puerto HMR: Vite usará automáticamente el puerto del servidor
      timeout: 5000,
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'https://api.abogadowilson.com',
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        format: 'esm', // Cambiar a formato ESM para que funcione import.meta
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'react-hot-toast'
    ],
    force: true
  }
});