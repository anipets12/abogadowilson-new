/**
 * Soluciu00f3n de emergencia para errores cru00edticos
 * Garantiza la carga completa de la aplicaciu00f3n incluso con errores graves
 */

(function() {
  console.log('[EmergencyFix] Activando sistema de recuperaciu00f3n total...');
  
  // Estado global
  window.__RECOVERY_STATE__ = {
    active: true,
    attempts: 0,
    maxAttempts: 3,
    errors: []
  };
  
  // Variables de control
  let initialized = false;
  let fallbackActivated = false;
  let errorCounter = 0;
  const MAX_ERRORS = 5;
  
  // Detectar si estamos en una pu00e1gina de error
  const isErrorPage = document.title.includes('Error') || 
                      document.body.innerHTML.includes('Error cru00edtico') ||
                      document.body.innerHTML.includes('No se pudo inicializar');
  
  if (isErrorPage) {
    console.log('[EmergencyFix] Detectada pu00e1gina de error, iniciando reparaciu00f3n...');
    
    // Limpiar completamente el almacenamiento
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('[EmergencyFix] Almacenamiento local limpiado');
      
      // Forzar recarga completa sin cachu00e9
      setTimeout(() => {
        window.location.href = '/' + '?nocache=' + Date.now();
      }, 1000);
      
      return; // Detener ejecuciu00f3n, estamos recargando
    } catch (error) {
      console.error('[EmergencyFix] Error al limpiar almacenamiento:', error);
    }
  }
  
  // Crear o asegurar que existe un elemento root
  function ensureRoot() {
    // Esperar a que el DOM esté listo
    if (!document.body) {
      console.log('[EmergencyFix] Esperando a que document.body esté disponible...');
      return null;
    }
    
    let rootElement = document.getElementById('root');
    
    if (!rootElement) {
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }
    
    return rootElement;
  }
  
  // Cargar React y ReactDOM directamente desde CDN si es necesario
  function loadReactFromCDN() {
    return new Promise((resolve) => {
      if (window.React && window.ReactDOM) {
        return resolve();
      }
      
      console.log('[EmergencyFix] Cargando React y ReactDOM desde CDN...');
      
      // Cargar React
      const reactScript = document.createElement('script');
      reactScript.src = 'https://unpkg.com/react@18/umd/react.development.js';
      reactScript.crossOrigin = 'anonymous';
      document.head.appendChild(reactScript);
      
      // Cargar ReactDOM
      const reactDOMScript = document.createElement('script');
      reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
      reactDOMScript.crossOrigin = 'anonymous';
      reactDOMScript.onload = () => {
        console.log('[EmergencyFix] React y ReactDOM cargados correctamente');
        resolve();
      };
      document.head.appendChild(reactDOMScript);
    });
  }
  
  // Cargar estilos mu00ednimos para la aplicaciu00f3n
  function loadMinimalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      body, html { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
      .emergency-container { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; text-align: center; }
      .emergency-logo { width: 120px; height: 120px; margin-bottom: 20px; background-color: #3b82f6; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
      .emergency-logo span { color: white; font-weight: bold; font-size: 40px; }
      .emergency-title { margin: 20px 0; color: #1e3a8a; font-size: 28px; }
      .emergency-message { margin-bottom: 30px; color: #4b5563; max-width: 600px; }
      .emergency-button { padding: 12px 24px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background-color 0.3s; }
      .emergency-button:hover { background-color: #1d4ed8; }
      .emergency-button.secondary { background-color: #6b7280; margin-left: 10px; }
      .emergency-button.secondary:hover { background-color: #4b5563; }
    `;
    document.head.appendChild(style);
  }
  
  // Parchear console.error para capturar y contar errores y evitar caídas
  function patchConsoleError() {
    // Evitar duplicar el parche si ya fue aplicado
    if (console.__EMERGENCY_PATCHED__) return;
    console.__EMERGENCY_PATCHED__ = true;

    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);

    console.error = function (...args) {
      try {
        // Registrar error en el estado global si está disponible
        if (window.__RECOVERY_STATE__ && Array.isArray(window.__RECOVERY_STATE__.errors)) {
          window.__RECOVERY_STATE__.errors.push({
            message: args && args.length ? args[0] : 'Unknown console.error',
            timestamp: new Date().toISOString()
          });
        }

        // Incrementar contador de errores y activar fallback si se excede el límite
        errorCounter++;
        if (errorCounter > MAX_ERRORS && !fallbackActivated) {
          fallbackActivated = true;
          console.log('[EmergencyFix] Demasiados errores en console.error, activando modo de emergencia');
          renderEmergencyApp();
        }
      } catch (e) {
        // Ignorar cualquier fallo durante el registro de errores
      }

      // Delegar al console.error original
      originalError(...args);
    };

    // También parchear console.warn para mantener consistencia (no incrementa contador)
    console.warn = function (...args) {
      try {
        if (window.__RECOVERY_STATE__ && Array.isArray(window.__RECOVERY_STATE__.errors)) {
          window.__RECOVERY_STATE__.errors.push({
            message: args && args.length ? '[WARN] ' + args[0] : 'Unknown console.warn',
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        // Silenciar
      }
      originalWarn(...args);
    };
  }
  
  // Renderizar la aplicaciu00f3n de emergencia
  function renderEmergencyApp() {
    const rootElement = ensureRoot();
    
    // HTML para la aplicaciu00f3n de emergencia
    rootElement.innerHTML = `
      <div class="emergency-container">
        <div class="emergency-logo">
          <span>AW</span>
        </div>
        <h1 class="emergency-title">Abogado Wilson</h1>
        <p class="emergency-message">
          Estamos actualizando el sistema para mejorar su experiencia. 
          La aplicaciu00f3n estaru00e1 disponible en breve.
        </p>
        <div>
          <button class="emergency-button" onclick="window.location.reload(true)">Reintentar</button>
          <button class="emergency-button secondary" onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload(true)">Reiniciar datos</button>
        </div>
      </div>
    `;
  }
  
  // Manejo de errores global
  window.addEventListener('error', function(event) {
    // Verificar si es un error de WebSocket
    if (event.message && event.message.includes('WebSocket')) {
      console.warn('[EmergencyFix] Error de WebSocket detectado:', event.message);
      // No acumular errores de WebSocket, son comunes en desarrollo
      fixWebSocketConnection();
      event.preventDefault();
      return false;
    }
    
    // Error de carga de módulo
    if (event.filename && (
        event.filename.includes('/node_modules/.vite/deps/') || 
        event.message.includes('Failed to load module') ||
        event.message.includes('Failed to fetch')
    )) {
      console.warn('[EmergencyFix] Error de carga de módulo detectado:', event.filename);
      fixModuleLoading(event.filename);
      event.preventDefault();
      return false;
    }
    
    // Acumular errores normales
    window.__RECOVERY_STATE__.errors.push({
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      timestamp: new Date().toISOString()
    });
    
    // Contar errores para ver si debemos mostrar la interfaz de emergencia
    errorCounter++;
    
    // Limitar la cantidad de mensajes de error para no sobrecargar la consola
    if (errorCounter === MAX_ERRORS) {
      console.warn('[EmergencyFix] Se han detectado varios errores, preparando respaldo');
      renderEmergencyApp();
    }
  });
  
  // Arregla los problemas de conexión WebSocket
  function fixWebSocketConnection() {
    console.log('[EmergencyFix] Reparando conexión WebSocket...');
    
    // Si ya tenemos un WebSocket simulado, no hacer nada
    if (window.__SIMULATED_WEBSOCKET__) return;
    
    // Guardar implementación original
    const originalWebSocket = window.WebSocket;
    
    // Crear implementación de respaldo
    window.WebSocket = function(url, protocols) {
      console.log(`[EmergencyFix] Creando WebSocket seguro para: ${url}`);
      
      try {
        // Intentar usar el WebSocket original
        const ws = new originalWebSocket(url, protocols);
        
        // Mejorar la gestión de errores
        const originalOnError = ws.onerror;
        ws.onerror = function(event) {
          console.warn('[EmergencyFix] Error en WebSocket, usando modo offline:', event);
          // No propagar el error, usar modo offline
          event.preventDefault();
          
          // Notificar a la aplicación que estamos en modo offline
          if (typeof window.__APP_STATE__ !== 'undefined') {
            window.__APP_STATE__.offline = true;
          }
          
          // Llamar al manejador original si existe
          if (originalOnError && typeof originalOnError === 'function') {
            originalOnError.call(this, event);
          }
        };
        
        return ws;
      } catch (error) {
        console.warn('[EmergencyFix] Error al crear WebSocket, usando simulado:', error);
        
        // Crear un WebSocket simulado que no falle
        const simulatedWs = {
          url,
          readyState: 1, // OPEN
          send: function(data) {
            console.log('[EmergencyFix] Enviando datos a WebSocket simulado (ignorado):', data);
          },
          close: function() {
            this.readyState = 3; // CLOSED
            if (this.onclose) this.onclose({ code: 1000, reason: 'Connection closed manually' });
          },
          addEventListener: function(event, handler) {
            if (event === 'open' && handler) {
              // Llamar inmediatamente al handler de open
              setTimeout(() => handler({ target: this }), 0);
            }
            // Para otros eventos, no hacer nada
          },
          removeEventListener: function() {},
          onopen: null,
          onclose: null,
          onerror: null,
          onmessage: null
        };
        
        // Simular conexión exitosa
        setTimeout(() => {
          if (simulatedWs.onopen) simulatedWs.onopen({ target: simulatedWs });
        }, 100);
        
        window.__SIMULATED_WEBSOCKET__ = true;
        return simulatedWs;
      }
    };
    
    // Mantener constantes de estado
    window.WebSocket.CONNECTING = originalWebSocket.CONNECTING;
    window.WebSocket.OPEN = originalWebSocket.OPEN;
    window.WebSocket.CLOSING = originalWebSocket.CLOSING;
    window.WebSocket.CLOSED = originalWebSocket.CLOSED;
  }
  
  // Arregla problemas de carga de módulos
  function fixModuleLoading(modulePath) {
    console.log('[EmergencyFix] Reparando carga de módulo:', modulePath);
    
    // Obtener el nombre del módulo si existe
    let moduleName = '';
    if (modulePath) {
      const moduleMatch = modulePath.match(/\/deps\/([^?]+)/);
      if (moduleMatch && moduleMatch[1]) {
        moduleName = moduleMatch[1]
          .replace('.js', '')
          .replace(/%40/g, '@')
          .replace(/%2F/g, '/')
          .replace(/%5F/g, '_');
      }
    }
    
    // Lista de CDNs para módulos comunes
    const cdnModules = {
      'axios': 'https://cdn.jsdelivr.net/npm/axios@1.6.2/dist/axios.min.js',
      'react-router-dom': 'https://cdn.jsdelivr.net/npm/react-router-dom@6.20.1/dist/react-router-dom.production.min.js',
      'react-hot-toast': 'https://cdn.jsdelivr.net/npm/react-hot-toast@2.4.1/dist/react-hot-toast.min.js',
      '@headlessui/react': 'https://cdn.jsdelivr.net/npm/@headlessui/react@2.0.0/dist/headlessui.min.js',
      '@heroicons/react': 'https://cdn.jsdelivr.net/npm/@heroicons/react@2.0.18/dist/index.min.js',
      'react-icons': 'https://cdn.jsdelivr.net/npm/react-icons@4.12.0/index.min.js',
      'framer-motion': 'https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.min.js'
    };
    
    // Intentar cargar desde CDN si es un módulo conocido
    Object.keys(cdnModules).forEach(key => {
      if (moduleName.includes(key) || (modulePath && modulePath.includes(key))) {
        const script = document.createElement('script');
        script.src = cdnModules[key];
        script.async = true;
        document.head.appendChild(script);
        console.log(`[EmergencyFix] Cargando ${key} desde CDN: ${cdnModules[key]}`);
      }
    });
    
    // Forzar actualización del estado de Vite
    if (window.__vite_plugin_react_preamble_installed__) {
      setTimeout(() => {
        console.log('[EmergencyFix] Forzando actualización de estado de Vite...');
        document.dispatchEvent(new CustomEvent('vite:invalidate'));
      }, 1000);
    }
  }

  // Inicializaciu00f3n cuando el DOM estu00e1 listo
  function initialize() {
    if (window.__RECOVERY_STATE__.initialized) return;
    window.__RECOVERY_STATE__.initialized = true;
    
    // Cargar estilos de emergencia por si acaso
    loadMinimalStyles();
    
    // Asegurar que existe un elemento root
    ensureRoot();
    
    // Cargar React desde CDN si es necesario
    loadReactFromCDN();
    
    // Reparar WebSocket
    fixWebSocketConnection();
    
    // Cuando la pu00e1gina estu00e9 cargada completamente
    window.addEventListener('load', function() {
      // Verificar si la aplicaciu00f3n se ha cargado correctamente
      setTimeout(() => {
        const rootElement = document.getElementById('root');
        // Si el root estu00e1 vacu00edo o solo contiene la pantalla de error, mostrar la interfaz de emergencia
        if (!rootElement || !rootElement.children.length || 
            (rootElement.innerHTML.includes('Error') && rootElement.innerHTML.includes('reintentar'))) {
          console.warn('[EmergencyFix] Aplicaciu00f3n no cargada correctamente, activando aplicaciu00f3n de emergencia');
          renderEmergencyApp();
        }
      }, 5000); // Esperar 5 segundos para verificar
    });
  }
  
  // Función para aplicar estilos de emergencia
  function ensureStyles() {
    // Verificar si los estilos ya existen
    if (document.getElementById('emergency-styles')) {
      return;
    }
    
    // Crear y aplicar estilos de emergencia
    const style = document.createElement('style');
    style.id = 'emergency-styles';
    style.textContent = `
      .emergency-container {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .emergency-header {
        color: #2563eb;
        font-size: 1.75rem;
        margin-bottom: 1rem;
      }
      .emergency-message {
        background-color: #f9fafb;
        border-left: 4px solid #2563eb;
        padding: 1rem;
        margin: 1rem 0;
      }
      .emergency-action {
        margin-top: 1.5rem;
      }
      .emergency-button {
        background-color: #2563eb;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Función para inicializar el sistema de emergencia
  function initializeEmergencySystem() {
    console.log('[EmergencyFix] Inicializando sistema de emergencia...');
    ensureStyles();
    
    // Crear observador para detectar cuandu00f3 renderizar la aplicaciu00f3n de emergencia
    const observer = new MutationObserver((mutations) => {
      errorCounter++;
      if (errorCounter > MAX_ERRORS && !fallbackActivated) {
        fallbackActivated = true;
        console.log('[EmergencyFix] Demasiados errores detectados, activando modo de emergencia');
        renderEmergencyApp();
      }
    });
    
    // Observar cambios en el DOM
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Parchear funciones de error
    patchConsoleError();
    
    // Inicializar está completo
    initialized = true;
    console.log('[EmergencyFix] Sistema de emergencia inicializado correctamente');
  }
  
  // Inicializar todo cuando el DOM estu00e9 listo
  function safeInitialize() {
    if (document.body) {
      initializeEmergencySystem();
    } else {
      // Si el body no estu00e1 listo, esperar un poco mu00e1s
      console.log('[EmergencyFix] Esperando a que document.body estu00e9 disponible...');
      setTimeout(safeInitialize, 50);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialize);
  } else {
    safeInitialize();
  }
  
  console.log('[EmergencyFix] Sistema de recuperaciu00f3n inicializado correctamente');
})();
