import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Configuración optimizada de Vite para resolver problemas de carga y WebSocket
export default defineConfig({
  plugins: [
    react({
      // Opciones de React optimizadas para evitar problemas de HMR
      fastRefresh: true,
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
  ],
  base: './',
  server: {
    port: 5174,
    strictPort: false, // Cambiado a false para permitir fallback
    cors: true,
    fs: {
      allow: ['..', '/']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174,
      clientPort: 5174,
      timeout: 5000, // Menor timeout para evitar bloqueos
      overlay: false,
      reconnect: 10, // Más intentos de reconexión
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          // Manejo mejorado de errores
          proxy.on('error', (err) => {
            console.warn('Error de proxy (no crítico):', err);
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    // Agregar extensiones prioritarias
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantener console.logs para diagnóstico
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        format: 'esm',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
        }
      }
    },
    chunkSizeWarningLimit: 2000 // Aumentar el límite para evitar advertencias
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'react-hot-toast',
      'axios'
    ],
    esbuildOptions: {
      target: 'es2020',
      supported: { 'top-level-await': true }
    },
    force: true,
    entries: ['./src/main.jsx'], // Especificar punto de entrada principal
  },
  // Mejorar la compatibilidad del navegador
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')()
      ]
    }
  },
  // Añadir más información para diagnóstico
  logLevel: 'info',
  clearScreen: false
});
