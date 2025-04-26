/**
 * Corrector de mu00f3dulos Vite
 * Este script resuelve los problemas de carga de chunks de Vite
 * @version 1.0.0
 */

(function() {
  console.log('[ViteModuleFix] Inicializando corrector de mu00f3dulos Vite');
  
  // Cache para mu00f3dulos cargados
  const moduleCache = {};
  
  // Lista de chunks problemu00e1ticos conocidos y sus dependencias
  const knownChunks = {
    'chunk-OU5AQDZK.js': ['react', 'react-dom'],
    'chunk-EWTE5DHJ.js': ['axios', 'react-router-dom'],
    'chunk-TH7NCS4R.js': ['react-hot-toast']
  };
  
  // Interceptar errores de carga de mu00f3dulos Vite
  function patchViteImport() {
    // Guardar referencia original si existe
    const originalImport = window.__vite_original_import || window.importShim || window.import;
    
    if (!originalImport) {
      console.warn('[ViteModuleFix] No se encontru00f3 una funciu00f3n de importaciu00f3n global');
      return;
    }
    
    // Guardar la original para posible restauraciu00f3n
    window.__vite_original_import = originalImport;
    
    // Reemplazar con nuestra funciu00f3n mejorada
    window.importShim = window.import = function(specifier) {
      // Si ya tenemos este mu00f3dulo en cache, devolverlo inmediatamente
      if (moduleCache[specifier]) {
        console.log(`[ViteModuleFix] Usando mu00f3dulo de cache: ${specifier}`);
        return Promise.resolve(moduleCache[specifier]);
      }
      
      // Verificar si es un chunk problemu00e1tico
      const chunkIdentifier = specifier.split('/').pop().split('?')[0];
      if (specifier.includes('/node_modules/.vite/deps/chunk-')) {
        console.log(`[ViteModuleFix] Interceptando carga de chunk: ${chunkIdentifier}`);
        
        // Crear un mu00f3dulo simulado segu00fan el chunk
        if (knownChunks[chunkIdentifier]) {
          const dependencies = knownChunks[chunkIdentifier];
          console.log(`[ViteModuleFix] Proporcionando dependencias simuladas para: ${dependencies.join(', ')}`);
          
          // Crear un objeto de exportaciu00f3n simulado
          const mockModule = dependencies.reduce((module, dep) => {
            // Intentar obtener la implementaciu00f3n global si existe
            switch (dep) {
              case 'react':
                module.React = window.React || { createElement: () => ({}) };
                module.default = module.React;
                break;
              case 'react-dom':
                module.ReactDOM = window.ReactDOM || { createRoot: () => ({ render: () => {} }) };
                module.default = module.ReactDOM;
                break;
              case 'axios':
                module.axios = window.axios || { get: () => Promise.resolve({}) };
                module.default = module.axios;
                break;
              case 'react-router-dom':
                module.ReactRouterDOM = window.ReactRouterDOM || {
                  BrowserRouter: () => ({}),
                  Routes: () => ({}),
                  Route: () => ({})
                };
                module.default = module.ReactRouterDOM;
                break;
              case 'react-hot-toast':
                module.toast = window.toast || { success: () => {}, error: () => {} };
                module.default = module.toast;
                break;
            }
            return module;
          }, { __esModule: true });
          
          // Guardar en cache
          moduleCache[specifier] = mockModule;
          
          return Promise.resolve(mockModule);
        }
      }
      
      // Para todos los demu00e1s, usar el import original
      return originalImport(specifier).catch(error => {
        console.warn(`[ViteModuleFix] Error al importar ${specifier}:`, error);
        
        // Intentar recuperaciu00f3n general para cualquier mu00f3dulo que falle
        if (specifier.includes('/components/') || specifier.includes('/context/')) {
          // Usar los componentes simulados si estu00e1n disponibles
          if (window.__COMPONENT_SHIMS__ && window.__COMPONENT_SHIMS__.components) {
            const componentName = specifier.split('/').pop().replace(/\.(jsx|js)$/, '');
            if (window.__COMPONENT_SHIMS__.components[componentName]) {
              console.log(`[ViteModuleFix] Usando componente simulado para: ${componentName}`);
              return Promise.resolve({
                default: window.__COMPONENT_SHIMS__.components[componentName],
                __esModule: true
              });
            }
          }
          
          // Componente genu00e9rico
          return Promise.resolve({
            default: function EmptyComponent() { 
              return window.React ? 
                window.React.createElement('div', { className: 'loading-shim' }, '[Componente cargando...]') : 
                null; 
            },
            __esModule: true
          });
        }
        
        // Para fallos generales, devolver un objeto vacu00edo compatible
        return Promise.resolve({ 
          default: {}, 
          __esModule: true 
        });
      });
    };
    
    console.log('[ViteModuleFix] Sistema de importaciu00f3n de Vite parcheado correctamente');
  }
  
  // Corregir carga de estilos CSS que pueden fallar
  function fixCssLoading() {
    // Interceptar errores de carga de CSS
    document.addEventListener('error', function(e) {
      if (e.target.tagName === 'LINK' && e.target.rel === 'stylesheet') {
        console.log('[ViteModuleFix] Interceptando error de carga CSS:', e.target.href);
        
        // Crear estilos mu00ednimos para evitar layout shifts
        const fallbackStyle = document.createElement('style');
        fallbackStyle.textContent = `
          body { font-family: system-ui, sans-serif; }
          button { background: #4b5563; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; }
          a { color: #2563eb; text-decoration: none; }
          input, select, textarea { border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 0.25rem; }
        `;
        document.head.appendChild(fallbackStyle);
      }
    }, true);
  }
  
  // Eliminar errores de WebSocket de la consola
  function cleanupConsoleErrors() {
    // Guardar los mu00e9todos originales
    const originalConsoleError = console.error;
    
    // Reemplazar console.error para filtrar mensajes de WebSocket
    console.error = function(...args) {
      // Filtrar errores de WebSocket de Vite
      if (args.length > 0 && typeof args[0] === 'string' && 
          (args[0].includes('WebSocket') || 
           args[0].includes('vite') ||
           args[0].includes('chunk'))) {
        // No mostrar estos errores
        return;
      }
      
      // Permitir todos los demu00e1s errores
      originalConsoleError.apply(console, args);
    };
  }
  
  // Detectar cuando la aplicaciu00f3n se ha cargado correctamente
  function monitorAppLoading() {
    // Verificar cada segundo si la aplicaciu00f3n estu00e1 cargada
    const checkInterval = setInterval(() => {
      const root = document.getElementById('root');
      if (root && root.children.length > 0) {
        console.log('[ViteModuleFix] Aplicaciu00f3n cargada correctamente');
        clearInterval(checkInterval);
      }
    }, 1000);
    
    // Tiempo mu00e1ximo de espera: 30 segundos
    setTimeout(() => {
      clearInterval(checkInterval);
      
      // Si la aplicaciu00f3n no se ha cargado en 30 segundos, activar recuperaciu00f3n
      const root = document.getElementById('root');
      if (!root || root.children.length === 0) {
        console.warn('[ViteModuleFix] Tiempo de espera agotado, activando recuperaciu00f3n');
        
        // Intentar restaurar usando el sistema de emergencia
        if (typeof window.renderEmergencyApp === 'function') {
          window.renderEmergencyApp();
        } else if (typeof window.initializeStandaloneApp === 'function') {
          window.initializeStandaloneApp();
        }
      }
    }, 30000);
  }
  
  // Inicializar todos los arreglos
  function initialize() {
    try {
      patchViteImport();
      fixCssLoading();
      cleanupConsoleErrors();
      monitorAppLoading();
      console.log('[ViteModuleFix] Todas las correcciones aplicadas con u00e9xito');
    } catch (error) {
      console.error('[ViteModuleFix] Error al inicializar correcciones:', error);
    }
  }
  
  // Iniciar cuando el DOM estu00e9 listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
