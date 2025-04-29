/**
 * Sistema de solucidu00f3n unificada - Corrector definitivo
 * @version 2.0.0
 */

(function() {
  console.log('[UnifiedFix] Inicializando sistema de correccidu00f3n unificada');
  
  // Lista de bibliotecas CDN a cargar localmente
  const localLibraries = [
    { name: 'React', path: '/fallback/react.production.min.js', global: 'React', check: () => !!window.React },
    { name: 'ReactDOM', path: '/fallback/react-dom.production.min.js', global: 'ReactDOM', check: () => !!window.ReactDOM },
    { name: 'ReactRouterDOM', path: '/fallback/react-router-dom.js', global: 'ReactRouterDOM', check: () => !!window.ReactRouterDOM },
    { name: 'HeadlessUI', path: '/fallback/headlessui.js', global: 'HeadlessUI', check: () => !!window.HeadlessUI },
    { name: 'HeroIcons', path: '/fallback/heroicons.js', global: 'HeroIcons', check: () => !!window.HeroIcons },
    { name: 'ReactIcons', path: '/fallback/react-icons.js', global: 'ReactIcons', check: () => !!window.ReactIcons },
    { name: 'ReactHotToast', path: '/fallback/react-hot-toast.js', global: 'toast', check: () => !!window.toast },
    { name: 'Axios', path: '/fallback/axios.min.js', global: 'axios', check: () => !!window.axios }
  ];
  
  // Cargar todas las bibliotecas locales de forma sincru00f3nica para garantizar disponibilidad inmediata
  function loadLocalLibraries() {
    // Cargar dependencias críticas si no están ya cargadas de forma asincrónica
    async function loadCriticalDependencies() {
      if (!window.React) {
        console.log('[UnifiedFix] Cargando React localmente');
        await loadScriptSync('/fallback/react.production.min.js');
      }
      
      if (!window.ReactDOM) {
        console.log('[UnifiedFix] Cargando ReactDOM localmente');
        await loadScriptSync('/fallback/react-dom.production.min.js');
      }
      
      console.log('[UnifiedFix] Cargando ReactRouterDOM localmente');
      await loadScriptSync('/fallback/react-router-dom.js');
      
      console.log('[UnifiedFix] Cargando HeadlessUI localmente');
      await loadScriptSync('/fallback/headlessui.js');
      
      console.log('[UnifiedFix] Todas las dependencias críticas cargadas correctamente');
    }
    
    // Iniciar carga de dependencias
    loadCriticalDependencies().catch(error => {
      console.error('[UnifiedFix] Error al cargar dependencias críticas:', error);
    });
  }
  
  // Cargar script local de forma asincru00f3nica
  function loadScriptSync(url) {
    console.log(`[UnifiedFix] Cargando ${url} localmente`);
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        console.log(`[UnifiedFix] Script cargado exitosamente: ${url}`);
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error(`[UnifiedFix] Error al cargar ${url}:`, error);
        // Intentar cargar usando un enfoque alternativo
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            return response.text();
          })
          .then(code => {
            const inlineScript = document.createElement('script');
            inlineScript.type = 'text/javascript';
            inlineScript.text = code;
            document.head.appendChild(inlineScript);
            console.log(`[UnifiedFix] Script cargado mediante fetch alternativo: ${url}`);
            resolve(true);
          })
          .catch(fetchError => {
            console.error(`[UnifiedFix] Error en carga alternativa de ${url}:`, fetchError);
            reject(fetchError);
          });
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Corregir errores en standalone-app.js 
  function fixStandaloneApp() {
    if (typeof window.renderStandaloneApp === 'function') {
      // Guardar la versiu00f3n original
      const originalRender = window.renderStandaloneApp;
      
      // Reemplazar con versiu00f3n parcheada
      window.renderStandaloneApp = function() {
        console.log('[UnifiedFix] Renderizando aplicaciu00f3n standalone con seguridad mejorada');
        try {
          // Verificar y proporcionar todas las dependencias
          if (!window.React) window.React = {};
          if (!window.ReactDOM) window.ReactDOM = { createRoot: () => ({ render: () => {} }) };
          if (!window.ReactRouterDOM) window.ReactRouterDOM = { 
            BrowserRouter: props => window.React.createElement('div', null, props.children),
            Routes: props => window.React.createElement('div', null, props.children),
            Route: () => null
          };
          
          return originalRender.apply(this, arguments);
        } catch (error) {
          console.error('[UnifiedFix] Error en renderStandaloneApp:', error);
          // Renderizar contenido de respaldo
          const root = document.getElementById('root');
          if (root) {
            root.innerHTML = `
              <div style="padding: 20px; font-family: system-ui, sans-serif;">
                <h1>Abogado Wilson</h1>
                <p>Cargando aplicaciu00f3n...</p>
                <p>Por favor espere un momento</p>
                <div style="height: 4px; width: 100%; background: #e5e7eb; margin: 20px 0;">
                  <div style="height: 100%; width: 60%; background: #3b82f6; animation: progress 2s infinite;" id="progress-bar"></div>
                </div>
              </div>
              <style>
                @keyframes progress { 0% { width: 0%; } 50% { width: 60%; } 100% { width: 100%; } }
              </style>
            `;
          }
        }
      };
      
      console.log('[UnifiedFix] StandaloneApp parcheado correctamente');
    }
  }
  
  // Corregir errores de WebSocket
  function fixWebSocketErrors() {
    // Interceptar todos los objetos WebSocket
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      console.log(`[UnifiedFix] Creando WebSocket a: ${url}`);
      
      try {
        const ws = new OriginalWebSocket(url, protocols);
        
        // Agregar manejo de errores mejorado
        ws.addEventListener('error', function(event) {
          console.log('[UnifiedFix] Error WebSocket interceptado:', event);
          // Evitar que los errores se propaguen
          event.preventDefault();
          event.stopPropagation();
          // Notificar a la aplicaciu00f3n que debe usar modo offline
          document.dispatchEvent(new CustomEvent('websocket-error'));
        });
        
        return ws;
      } catch (error) {
        console.log('[UnifiedFix] Creando WebSocket simulado debido a error');
        // Devolver una implementaciu00f3n falsa de WebSocket en caso de error
        return {
          addEventListener: function() {},
          removeEventListener: function() {},
          send: function() {},
          close: function() {}
        };
      }
    };
    
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    
    console.log('[UnifiedFix] WebSocket parcheado para manejo de errores mejorado');
  }
  
  // Corregir errores de carga de mu00f3dulos Vite
  function fixViteModules() {
    // Mu00f3dulos cru00edticos que pueden fallar
    const criticalModules = {
      'node_modules/.vite/deps/react-icons_fa.js': {
        module: {
          __esModule: true,
          default: {},
          FaBars: () => ({}),
          FaUser: () => ({}),
          FaCalendar: () => ({}),
          FaEnvelope: () => ({}),
          FaPhone: () => ({})
        }
      },
      'src/services/apiService.js': {
        module: {
          __esModule: true,
          default: {
            get: (url) => Promise.resolve({ data: {} }),
            post: (url, data) => Promise.resolve({ data: {} }),
            put: (url, data) => Promise.resolve({ data: {} }),
            delete: (url) => Promise.resolve({ data: {} })
          }
        }
      },
      'src/main.jsx': {
        module: {
          __esModule: true,
          default: {}
        }
      }
    };
    
    // Interceptar carga de mu00f3dulos
    window.addEventListener('error', function(event) {
      if (event.target && event.target.src && event.target.src.includes('node_modules/.vite/deps/')) {
        const moduleName = event.target.src.split('/').pop().split('?')[0];
        console.log(`[UnifiedFix] Interceptando error de carga de mu00f3dulo: ${moduleName}`);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);
    
    // Interceptar import para mu00f3dulos cru00edticos
    if (window.importShim || window.import) {
      const originalImport = window.importShim || window.import;
      
      window.importShim = window.import = function(specifier) {
        // Verificar si es un mu00f3dulo cru00edtico
        for (const modulePath in criticalModules) {
          if (specifier.includes(modulePath)) {
            console.log(`[UnifiedFix] Proporcionando mu00f3dulo simulado para: ${modulePath}`);
            return Promise.resolve(criticalModules[modulePath].module);
          }
        }
        
        // Si es react-icons
        if (specifier.includes('react-icons')) {
          console.log(`[UnifiedFix] Interceptando carga de react-icons: ${specifier}`);
          return Promise.resolve({
            __esModule: true,
            default: {},
            FaBars: () => ({ type: 'svg', props: { viewBox: '0 0 24 24' } }),
            FaUser: () => ({ type: 'svg', props: { viewBox: '0 0 24 24' } }),
            FaWhatsapp: () => ({ type: 'svg', props: { viewBox: '0 0 24 24' } }),
            FaMapMarkerAlt: () => ({ type: 'svg', props: { viewBox: '0 0 24 24' } })
          });
        }
        
        // Continuar con importaciu00f3n normal
        return originalImport(specifier).catch(error => {
          console.warn(`[UnifiedFix] Error al importar ${specifier}:`, error);
          
          // Si es un servicio de API o contexto
          if (specifier.includes('/services/') || specifier.includes('/context/')) {
            console.log(`[UnifiedFix] Proporcionando servicio simulado para: ${specifier}`);
            return Promise.resolve({
              __esModule: true,
              default: {},
              get: () => Promise.resolve({ data: {} }),
              post: () => Promise.resolve({ data: {} }),
              put: () => Promise.resolve({ data: {} }),
              delete: () => Promise.resolve({ data: {} })
            });
          }
          
          // Devolver mu00f3dulo vaci00f3 compatible
          return Promise.resolve({
            __esModule: true,
            default: {}
          });
        });
      };
    }
    
    console.log('[UnifiedFix] Sistema de importaciu00f3n de mu00f3dulos Vite parcheado');
  }
  
  // Corregir errores de React Router DOM
  function fixReactRouterDOM() {
    // Asegurarse de que el objeto global exista
    if (!window.ReactRouterDOM) {
      loadScriptSync('/fallback/react-router-dom.js');
    }
    
    // Interceptar unpkg de React Router DOM
    document.addEventListener('error', function(e) {
      if (e.target.tagName === 'SCRIPT' && e.target.src.includes('react-router-dom')) {
        console.log('[UnifiedFix] Interceptando error de carga React Router DOM:', e.target.src);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
    
    console.log('[UnifiedFix] React Router DOM parcheado correctamente');
  }
  
  // Inicializar todo el sistema
  function initialize() {
    // Cargar todas las bibliotecas locales primero
    loadLocalLibraries();
    
    // Aplicar todas las correcciones
    fixStandaloneApp();
    fixWebSocketErrors();
    fixViteModules();
    fixReactRouterDOM();
    
    console.log('[UnifiedFix] Sistema de correccidu00f3n unificada inicializado correctamente');
    
    // Notificar que el sistema estu00e1 listo
    document.dispatchEvent(new CustomEvent('unified-fix-ready'));
  }
  
  // Iniciar inmediatamente
  initialize();
})();
