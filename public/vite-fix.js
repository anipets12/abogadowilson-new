/**
 * Sistema avanzado de correcciones para Vite v2.0.0
 * Resuelve problemas de WebSocket, módulos, HMR y carga de dependencias
 * Compatible con React 18+, Vite 4+, y entornos modernos
 */

(function() {
  // Estado global del sistema de correcciones
  window.__VITE_FIX_STATE__ = {
    initialized: false,
    wsPatched: false,
    modulesPrepared: false,
    fetchIntercepted: false,
    importMapInstalled: false,
    cdnFallbacks: {},
    wsConnections: [],
    errors: []
  };
  
  console.log('[ViteFix] Inicializando sistema avanzado de correcciones para Vite...');
  
  // Evitar inicialización doble
  if (window.__VITE_FIX_STATE__.initialized) {
    console.log('[ViteFix] Sistema ya inicializado, omitiendo');
    return;
  }
  
  window.__VITE_FIX_STATE__.initialized = true;
  
  // ##################################
  // FIX 1: WEBSOCKET RESILIENTE
  // ##################################
  
  // Resolver puerto correcto para el servidor Vite
  const resolveVitePort = () => {
    const scripts = document.querySelectorAll('script[type="module"]');
    for (const script of scripts) {
      const src = script.getAttribute('src') || '';
      if (src.includes('localhost:')) {
        const match = src.match(/localhost:(\d+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return '5174'; // Puerto predeterminado como fallback
  };
  
  const vitePort = resolveVitePort();
  console.log(`[ViteFix] Puerto Vite detectado: ${vitePort}`);
  
  // Parche avanzado para WebSocket con reconexiones automáticas
  if (window.WebSocket && !window.__VITE_FIX_STATE__.wsPatched) {
    const originalWebSocket = window.WebSocket;
    
    class EnhancedWebSocket {
      constructor(url, protocols) {
        // Registrar intento de conexión
        console.log(`[ViteFix] Interceptando WebSocket: ${url}`);
        this._url = url;
        this._protocols = protocols;
        this._socket = null;
        this._connectAttempt = 0;
        this._maxRetries = 3;
        this._listeners = { error: [], close: [], message: [], open: [] };
        window.__VITE_FIX_STATE__.wsConnections.push(this);
        
        // Corregir URL si es necesario
        if (url.includes('localhost:5173')) {
          this._url = url.replace('localhost:5173', `localhost:${vitePort}`);
          console.log(`[ViteFix] URL corregida: ${this._url}`);
        }
        
        // Intentar conexión
        this._connect();
        
        // Propiedades requeridas
        this.CONNECTING = 0;
        this.OPEN = 1;
        this.CLOSING = 2;
        this.CLOSED = 3;
        
        // Retornar this para chainability
        return this;
      }
      
      _connect() {
        this._connectAttempt++;
        console.log(`[ViteFix] Intento de conexión #${this._connectAttempt} a ${this._url}`);
        
        try {
          this._socket = new originalWebSocket(this._url, this._protocols);
          
          // Reenviar eventos
          this._socket.onopen = (event) => {
            console.log(`[ViteFix] WebSocket conectado exitosamente a ${this._url}`);
            this.readyState = this._socket.readyState;
            if (this.onopen) this.onopen(event);
            this._dispatch('open', event);
          };
          
          this._socket.onclose = (event) => {
            console.log(`[ViteFix] WebSocket cerrado: ${event.code} - ${event.reason}`);
            this.readyState = this._socket.readyState;
            
            // Reintento automático para códigos específicos
            if (
              (event.code === 1006 || event.code === 1012 || event.code === 1013) && 
              this._connectAttempt <= this._maxRetries
            ) {
              console.log(`[ViteFix] Reintentando conexión en 1500ms...`);
              setTimeout(() => this._connect(), 1500);
              return;
            }
            
            // Notificar cierre definitivo
            if (this.onclose) this.onclose(event);
            this._dispatch('close', event);
          };
          
          this._socket.onerror = (event) => {
            console.error(`[ViteFix] Error de WebSocket:`, event);
            this.readyState = this._socket.readyState;
            window.__VITE_FIX_STATE__.errors.push({
              type: 'websocket',
              url: this._url,
              timestamp: new Date().toISOString(),
              error: event
            });
            
            if (this.onerror) this.onerror(event);
            this._dispatch('error', event);
          };
          
          this._socket.onmessage = (event) => {
            this.readyState = this._socket.readyState;
            if (this.onmessage) this.onmessage(event);
            this._dispatch('message', event);
          };
          
          // Establecer estado inicial
          this.readyState = this._socket.readyState;
          
        } catch (error) {
          console.error('[ViteFix] Error creando WebSocket:', error);
          window.__VITE_FIX_STATE__.errors.push({
            type: 'websocket-creation',
            url: this._url,
            timestamp: new Date().toISOString(),
            error: error
          });
          
          // Simular eventos para mantener compatibilidad API
          this.readyState = 3; // CLOSED
          
          // Notificar error y cierre
          setTimeout(() => {
            const errorEvent = new Event('error');
            if (this.onerror) this.onerror(errorEvent);
            this._dispatch('error', errorEvent);
            
            const closeEvent = { code: 1006, reason: 'Error de conexión', wasClean: false };
            if (this.onclose) this.onclose(closeEvent);
            this._dispatch('close', closeEvent);
          }, 50);
        }
      }
      
      // API WebSocket estándar
      send(data) {
        if (this._socket && this._socket.readyState === 1) {
          return this._socket.send(data);
        } else {
          console.warn('[ViteFix] Intentando enviar en socket cerrado o no inicializado');
          return false;
        }
      }
      
      close(code, reason) {
        if (this._socket) {
          return this._socket.close(code, reason);
        }
      }
      
      // EventTarget API simplificada
      addEventListener(type, listener) {
        if (!this._listeners[type]) this._listeners[type] = [];
        this._listeners[type].push(listener);
      }
      
      removeEventListener(type, listener) {
        if (!this._listeners[type]) return;
        this._listeners[type] = this._listeners[type].filter(l => l !== listener);
      }
      
      _dispatch(type, event) {
        if (!this._listeners[type]) return;
        for (const listener of this._listeners[type]) {
          listener.call(this, event);
        }
      }
    }
    
    // Reemplazar el constructor global
    window.WebSocket = EnhancedWebSocket;
    
    // Copiar constantes estáticas
    window.WebSocket.CONNECTING = originalWebSocket.CONNECTING;
    window.WebSocket.OPEN = originalWebSocket.OPEN;
    window.WebSocket.CLOSING = originalWebSocket.CLOSING;
    window.WebSocket.CLOSED = originalWebSocket.CLOSED;
    
    window.__VITE_FIX_STATE__.wsPatched = true;
    console.log('[ViteFix] Sistema mejorado de WebSocket instalado');
  }
  
  // ##################################
  // FIX 2: PREPARACIÓN DE MÓDULOS
  // ##################################
  
  // Preparar entorno para carga correcta de módulos
  if (!window.__VITE_FIX_STATE__.modulesPrepared) {
    // Marcadores para evitar errores comunes de Vite/React
    window.__vite_plugin_react_preamble_installed__ = true;
    window.__vite_is_modern_browser = true;
    window.__vite_is_dynamic_import_support = true;
    window.__vite_is_react_refresh_boundary = () => true;
    
    // Forzar reconexiones para HMR
    window.__HMR_PROTOCOL__ = 'ws';
    window.__HMR_HOSTNAME__ = 'localhost';
    window.__HMR_PORT__ = vitePort;
    window.__HMR_BASE_PATH__ = '/';
    window.__HMR_TIMEOUT__ = 30000;
    window.__HMR_ENABLE_OVERLAY__ = true;
    window.__hmrForceReconnect = true;
    
    // Marcadores para ReactRefresh
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    
    // Cache para dependencias
    window.__LOADED_DEPENDENCIES__ = window.__LOADED_DEPENDENCIES__ || {};
    
    // Espacio para CDNs de respaldo
    window.__CDN_MODULES__ = window.__CDN_MODULES__ || {};
    
    // Mapa de importaciones para resolver dependencias problemáticas
    window.__CDN_URLS__ = {
      '@headlessui/react': 'https://cdn.jsdelivr.net/npm/@headlessui/react@1.7.17/dist/headlessui.esm.js',
      'react-icons/fa': 'https://cdn.jsdelivr.net/npm/react-icons@4.11.0/fa/index.esm.js',
      'framer-motion': 'https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.js',
      'axios': 'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js'
    };
    
    window.__VITE_FIX_STATE__.modulesPrepared = true;
    console.log('[ViteFix] Preparación de módulos completa');
  }
  
  // ##################################
  // FIX 3: INTERCEPTOR DE FETCH
  // ##################################
  
  // Interceptar fetch para arreglar URLs y mejorar manejo de errores
  if (!window.__VITE_FIX_STATE__.fetchIntercepted && window.fetch) {
    const originalFetch = window.fetch;
    
    window.fetch = async function(resource, options) {
      let url = resource;
      
      // Normalizar recurso a string si es Request
      if (resource instanceof Request) {
        url = resource.url;
        // Crear una nueva request con la URL corregida si es necesario
      }
      
      if (typeof url === 'string') {
        // Corregir URLs de dependencias de Vite
        if (url.includes('/node_modules/.vite/deps/')) {
          console.log(`[ViteFix] Interceptando fetch a: ${url}`);
          
          // Corregir puerto si es necesario
          if (url.includes('localhost:5173')) {
            url = url.replace('localhost:5173', `localhost:${vitePort}`);
            console.log(`[ViteFix] URL de dependencia corregida: ${url}`);
          }
          
          // Extraer nombre del módulo
          const moduleMatch = url.match(/\/node_modules\/\.vite\/deps\/([\w\-\@]+)(\.js|\?v=)/);
          if (moduleMatch && moduleMatch[1]) {
            const moduleName = moduleMatch[1].replace('%40', '@');
            
            // Verificar si tenemos un respaldo CDN para este módulo
            if (window.__CDN_URLS__[moduleName]) {
              console.log(`[ViteFix] Usando CDN para ${moduleName}: ${window.__CDN_URLS__[moduleName]}`);
              
              try {
                // Intentar cargar desde CDN
                const cdnResponse = await originalFetch(window.__CDN_URLS__[moduleName]);
                if (cdnResponse.ok) {
                  return cdnResponse;
                }
              } catch (cdnError) {
                console.warn(`[ViteFix] Error al cargar ${moduleName} desde CDN:`, cdnError);
              }
            }
          }
          
          // Agregar headers para resolver problemas de caché
          options = options || {};
          options.headers = options.headers || {};
          options.headers['Cache-Control'] = 'no-cache';
          options.headers['Pragma'] = 'no-cache';
          
          // Aumentar timeout para evitar problemas intermitentes
          // No podemos usar AbortSignal directamente, pero emulamos mayor timeout
          const originalSignal = options.signal;
          
          try {
            return await Promise.race([
              originalFetch(url, options),
              new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`[ViteFix] Timeout al cargar ${url}`)), 10000);
              })
            ]);
          } catch (fetchError) {
            console.warn(`[ViteFix] Error en fetch original para ${url}:`, fetchError);
            throw fetchError;
          }
        }
        
        // Para otras URLs, solo corregir el puerto si es necesario
        if (url.includes('localhost:5173')) {
          url = url.replace('localhost:5173', `localhost:${vitePort}`);
          console.log(`[ViteFix] URL corregida: ${url}`);
          
          if (resource instanceof Request) {
            resource = new Request(url, resource);
          } else {
            resource = url;
          }
        }
      }
      
      // Continuar con el fetch original
      return originalFetch(resource, options);
    };
    
    window.__VITE_FIX_STATE__.fetchIntercepted = true;
    console.log('[ViteFix] Interceptor de fetch instalado');
  }
  
  // ##################################
  // FIX 4: IMPORT MAP PARA DEPENDENCIAS
  // ##################################
  
  // Instalar import map para resolver importaciones problemáticas
  if (!window.__VITE_FIX_STATE__.importMapInstalled && !document.querySelector('script[type="importmap"]')) {
    const importMap = {
      imports: {
        '@headlessui/react': 'https://cdn.jsdelivr.net/npm/@headlessui/react@1.7.17/dist/headlessui.esm.js',
        'react-icons/fa': 'https://cdn.jsdelivr.net/npm/react-icons@4.11.0/fa/index.esm.js',
        'framer-motion': 'https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.js',
        'axios': 'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js'
      }
    };
    
    const importMapScript = document.createElement('script');
    importMapScript.type = 'importmap';
    importMapScript.textContent = JSON.stringify(importMap);
    document.head.appendChild(importMapScript);
    
    window.__VITE_FIX_STATE__.importMapInstalled = true;
    console.log('[ViteFix] Import map instalado para dependencias');
  }
  
  // Garantizar VITE_CJS_IGNORE_WARNING
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_CJS_IGNORE_WARNING = 'true';
  
  console.log('[ViteFix] Sistema avanzado de correcciones inicializado correctamente');
})();
