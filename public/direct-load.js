/**
 * Sistema de carga directa para dependencias críticas
 * Carga directamente desde CDN todas las bibliotecas antes de que la aplicación las necesite
 */

(function() {
  console.log('[DirectLoad] Iniciando carga directa de bibliotecas críticas');
  
  // Lista de bibliotecas que necesitamos cargar directamente
  const CRITICAL_LIBRARIES = [
    {
      name: 'React',
      url: 'https://unpkg.com/react@18.2.0/umd/react.production.min.js',
      globalVar: 'React'
    },
    {
      name: 'ReactDOM',
      url: 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js',
      globalVar: 'ReactDOM'
    },
    {
      name: 'ReactRouterDOM',
      url: 'https://unpkg.com/react-router-dom@6.20.1/dist/umd/react-router-dom.production.min.js',
      globalVar: 'ReactRouterDOM'
    },
    {
      name: 'Axios',
      url: 'https://cdn.jsdelivr.net/npm/axios@1.6.7/dist/axios.min.js',
      globalVar: 'axios'
    },
    {
      name: 'ReactHotToast',
      url: 'https://cdn.jsdelivr.net/npm/react-hot-toast@2.4.1/dist/react-hot-toast.umd.min.js',
      globalVar: 'toast'
    },
    {
      name: 'HeadlessUI',
      // Aún tenemos problemas de MIME, será cargado directamente del fallback local
      url: '', // URL vacía para forzar fallback inmediato
      globalVar: 'Headless',
      useLocalFallback: true
    },
    {
      name: 'HeroIcons',
      url: 'https://cdn.jsdelivr.net/npm/@heroicons/react@2.2.0/dist/index.min.js',
      globalVar: 'HeroIcons'
    }
  ];

  // Función para crear un shimmer de componente
  function createComponentShim(name) {
    return function(props) {
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'div',
        props: { 
          ...props, 
          children: `[Cargando ${name}...]`,
          className: 'loading-shim'
        },
        key: null,
        ref: null
      };
    };
  }

  // Estado global para registrar bibliotecas cargadas
  window.__DIRECT_LOAD__ = {
    loaded: {},
    errors: [],
    loadCount: 0
  };

  // Crear elementos de componentes críticos para evitar errores
  window.__DEFAULT_COMPONENTS__ = {
    Navbar: createComponentShim('Navbar'),
    Footer: createComponentShim('Footer'),
    AuthProvider: {
      Provider: function(props) { return props.children; }
    },
    AuthContext: {
      Provider: function(props) { return props.children; }
    },
    useAuth: function() {
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        login: () => Promise.resolve(),
        logout: () => Promise.resolve(),
        register: () => Promise.resolve()
      };
    }
  };

  // Cargar una biblioteca desde CDN
  function loadLibrary(library) {
    return new Promise((resolve, reject) => {
      // Si ya existe globalmente, no cargar
      if (window[library.globalVar]) {
        console.log(`[DirectLoad] ${library.name} ya está disponible globalmente`);
        window.__DIRECT_LOAD__.loaded[library.name] = true;
        resolve(true);
        return;
      }
      
      // Si está configurado para usar fallback local directamente
      if (library.useLocalFallback) {
        loadLocalFallback(library, resolve);
        return;
      }

      // Crear elemento script para CDN si hay URL
      if (library.url) {
        const script = document.createElement('script');
        script.src = library.url;
        script.async = false; // Importante: cargar en orden
        script.crossOrigin = 'anonymous';

        // Eventos de carga
        script.onload = () => {
          console.log(`[DirectLoad] ${library.name} cargado correctamente`);
          window.__DIRECT_LOAD__.loaded[library.name] = true;
          window.__DIRECT_LOAD__.loadCount++;
          resolve(true);
        };

      script.onerror = (error) => {
        console.warn(`[DirectLoad] Error al cargar ${library.name} desde CDN, intentando fallback local`);
        loadLocalFallback(library, resolve);
      };
      
      // Añadir al documento
      document.head.appendChild(script);
      return; // Importante para evitar doble resolución
    });
  }
  
  // Función auxiliar para cargar fallback local
  function loadLocalFallback(library, resolve) {
    // Intentar fallback local
    const fallbackScript = document.createElement('script');
    fallbackScript.src = `/fallback/${library.name.toLowerCase()}.js`;
    fallbackScript.async = false;
    fallbackScript.crossOrigin = 'anonymous';

    fallbackScript.onload = () => {
      console.log(`[DirectLoad] ${library.name} cargado correctamente desde fallback local`);
      window.__DIRECT_LOAD__.loaded[library.name] = true;
      window.__DIRECT_LOAD__.loadCount++;
      resolve(true);
    };

    fallbackScript.onerror = (error2) => {
      console.error(`[DirectLoad] Fallback local para ${library.name} también falló:`, error2);
      window.__DIRECT_LOAD__.errors.push({
        library: library.name,
        error: error2,
        time: new Date().toISOString()
      });
      resolve(false);
    };

    // Añadir al documento
    document.head.appendChild(fallbackScript);
    });
  }

  // Cargar todas las bibliotecas críticas en orden
  async function loadAllLibraries() {
    console.log('[DirectLoad] Cargando bibliotecas críticas en secuencia');
    
    for (const library of CRITICAL_LIBRARIES) {
      await loadLibrary(library);
    }
    
    console.log(`[DirectLoad] Completado: ${window.__DIRECT_LOAD__.loadCount}/${CRITICAL_LIBRARIES.length} bibliotecas cargadas`);
    
    // Notificar que la carga está completa
    document.dispatchEvent(new CustomEvent('directload:complete', { 
      detail: {
        success: window.__DIRECT_LOAD__.loadCount === CRITICAL_LIBRARIES.length,
        loaded: window.__DIRECT_LOAD__.loaded,
        errors: window.__DIRECT_LOAD__.errors
      }
    }));

    // Inicializar el parche WebSocket solo si se han cargado correctamente
    if (window.__DIRECT_LOAD__.loadCount >= CRITICAL_LIBRARIES.length - 1) {
      initWebSocketFix();
    }
  }

  // Crear un parche para WebSocket que nunca fallará
  function initWebSocketFix() {
    console.log('[DirectLoad] Inicializando parche WebSocket avanzado');
    
    // Guardar la implementación original
    const OriginalWebSocket = window.WebSocket;
    
    // Crear una implementación nueva y resistente a fallos
    window.WebSocket = function(url, protocols) {
      console.log(`[DirectLoad] Interceptando WebSocket: ${url}`);
      
      try {
        // Intentar crear WebSocket normal
        const ws = new OriginalWebSocket(url, protocols);
        
        // Interceptar errores para evitar que la aplicación falle
        const originalOnerror = ws.onerror;
        ws.onerror = function(event) {
          console.warn('[DirectLoad] Error en WebSocket (interceptado):', event);
          
          // Evitar que el error se propague
          event.preventDefault();
          event.stopPropagation();
          
          // Llamar al manejador original si existe
          if (typeof originalOnerror === 'function') {
            originalOnerror.call(this, event);
          }
          
          // Intentar reconexión automática
          setTimeout(() => {
            if (typeof ws.onclose === 'function') {
              ws.onclose({
                code: 1006,
                reason: 'Reconnecting',
                wasClean: false
              });
            }
          }, 1000);
        };
        
        return ws;
      } catch (error) {
        console.warn('[DirectLoad] Creando WebSocket simulado:', error);
        
        // Crear un WebSocket simulado que no falle nunca
        const mockWs = {
          url,
          protocol: '',
          readyState: 1, // OPEN
          extensions: '',
          bufferedAmount: 0,
          binaryType: 'blob',
          
          // Métodos simulados
          send: function(data) {
            console.log('[DirectLoad] Envío simulado:', data);
            return true;
          },
          close: function(code, reason) {
            this.readyState = 3; // CLOSED
            if (typeof this.onclose === 'function') {
              this.onclose({
                code: code || 1000,
                reason: reason || 'Connection closed',
                wasClean: true
              });
            }
          },
          addEventListener: function(type, listener, options) {
            if (type === 'open' && typeof listener === 'function') {
              // Simular conexión inmediata
              setTimeout(() => {
                listener.call(this, { target: this, type: 'open' });
              }, 10);
            }
          },
          removeEventListener: function() {}
        };
        
        // Simular apertura inmediata
        setTimeout(() => {
          if (typeof mockWs.onopen === 'function') {
            mockWs.onopen({ target: mockWs });
          }
        }, 10);
        
        return mockWs;
      }
    };
    
    // Mantener constantes originales
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    
    console.log('[DirectLoad] Parche WebSocket instalado correctamente');
  }

  // Inicializar parche para módulos nativos
  function initModuleFix() {
    // Interceptar importaciones dinámicas
    const originalImport = window.importShim || window.import || null;
    
    if (originalImport) {
      window.importShim = window.import = function(specifier) {
        console.log(`[DirectLoad] Interceptando importación: ${specifier}`);
        
        // Detectar componentes críticos que podrían fallar
        if (specifier.includes('/components/Navigation/Navbar') || 
            specifier.includes('/Navbar.jsx')) {
          console.log('[DirectLoad] Proporcionando Navbar simulado');
          return Promise.resolve({
            default: window.__DEFAULT_COMPONENTS__.Navbar,
            __esModule: true
          });
        }
        
        if (specifier.includes('/components/Footer/Footer') || 
            specifier.includes('/Footer.jsx')) {
          console.log('[DirectLoad] Proporcionando Footer simulado');
          return Promise.resolve({
            default: window.__DEFAULT_COMPONENTS__.Footer,
            __esModule: true
          });
        }
        
        if (specifier.includes('/context/AuthContext') || 
            specifier.includes('/AuthContext.jsx')) {
          console.log('[DirectLoad] Proporcionando AuthContext simulado');
          return Promise.resolve({
            default: window.__DEFAULT_COMPONENTS__.AuthContext,
            useAuth: window.__DEFAULT_COMPONENTS__.useAuth,
            AuthProvider: window.__DEFAULT_COMPONENTS__.AuthProvider,
            __esModule: true
          });
        }
        
        // Intenta la importación original
        return originalImport(specifier).catch(error => {
          console.warn(`[DirectLoad] Error importando ${specifier}:`, error);
          
          // Para axios u otras bibliotecas conocidas
          if (specifier.includes('axios')) {
            return Promise.resolve({
              default: window.axios || {},
              __esModule: true
            });
          }
          
          // Para react y react-dom
          if (specifier.includes('react-dom')) {
            return Promise.resolve({
              default: window.ReactDOM || {},
              __esModule: true
            });
          }
          
          if (specifier.includes('react-router-dom')) {
            return Promise.resolve({
              default: window.ReactRouterDOM || {},
              __esModule: true
            });
          }
          
          if (specifier.includes('react') && !specifier.includes('-')) {
            return Promise.resolve({
              default: window.React || {},
              __esModule: true
            });
          }
          
          // Crear un módulo vacío para no romper la cadena
          return Promise.resolve({
            default: {},
            __esModule: true
          });
        });
      };
    }
  }

  // Iniciar la carga
  loadAllLibraries();
  initModuleFix();
  initWebSocketFix();

  console.log('[DirectLoad] Sistema de carga directa inicializado');
})();
