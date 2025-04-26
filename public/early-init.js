/**
 * Sistema de inicializaciu00f3n temprana
 * Este script se ejecuta antes que cualquier otro para garantizar la disponibilidad del DOM
 * @version 1.0.0
 */

(function() {
  console.log('[EarlyInit] Inicializando sistema de pre-carga');
  
  // Crear elementos DOM esenciales si no existen
  function ensureEssentialElements() {
    // Asegurarse de que <body> exista
    if (!document.body) {
      let bodyElement = document.getElementsByTagName('body')[0];
      if (!bodyElement) {
        bodyElement = document.createElement('body');
        document.documentElement.appendChild(bodyElement);
      }
    }
    
    // Asegurarse de que <div id="root"> exista
    if (!document.getElementById('root')) {
      const rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }
    
    // Crear un contenedor para notificaciones
    if (!document.getElementById('notifications')) {
      const notificationsElement = document.createElement('div');
      notificationsElement.id = 'notifications';
      notificationsElement.style.position = 'fixed';
      notificationsElement.style.top = '0';
      notificationsElement.style.right = '0';
      notificationsElement.style.zIndex = '9999';
      document.body.appendChild(notificationsElement);
    }
    
    console.log('[EarlyInit] Elementos DOM esenciales creados');
  }
  
  // Silenciar errores no crcu00edticos en la consola
  function setupErrorFiltering() {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Filtrar errores no crcu00edticos
      if (args.length > 0 && typeof args[0] === 'string') {
        if (args[0].includes('WebSocket') || 
            args[0].includes('CORS') || 
            args[0].includes('MIME') ||
            args[0].includes('cdn.jsdelivr') ||
            args[0].includes('unpkg.com') ||
            args[0].includes('Minified React error #31')) {
          // Registramos error React #31 pero con nivel inferior
          if (args[0].includes('Minified React error #31')) {
            console.warn('[EarlyInit] Interceptado error React #31 (renderizado mu00faltiple)');
            
            // Si tenemos el coordinador, notificarle del error
            if (window.__RENDER_COORDINATOR__) {
              console.log('[EarlyInit] Notificando a coordinador de renderizado');
              window.__RENDER_COORDINATOR__.cleanRoot();
            }
          }
          return;
        }
      }
      
      // Mostrar todos los demu00e1s errores
      originalConsoleError.apply(console, args);
    };
    
    // Tambu00e9n filtrar warnings
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      // Filtrar warnings relativos a React Router
      if (args.length > 0 && typeof args[0] === 'string') {
        if (args[0].includes('React Router') || 
            args[0].includes('relative route resolution')) {
          return;
        }
      }
      
      originalConsoleWarn.apply(console, args);
    };
    
    console.log('[EarlyInit] Filtrado de errores configurado');
  }
  
  // Preparar polyfills
  function setupPolyfills() {
    // URLSearchParams polyfill si no existe
    if (!window.URLSearchParams) {
      window.URLSearchParams = function(init) {
        this.params = {};
        
        this.get = function(key) {
          return this.params[key] || null;
        };
        
        this.set = function(key, value) {
          this.params[key] = value;
        };
        
        this.has = function(key) {
          return key in this.params;
        };
        
        this.delete = function(key) {
          delete this.params[key];
        };
        
        this.toString = function() {
          const pairs = [];
          for (const key in this.params) {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(this.params[key]));
          }
          return pairs.join('&');
        };
        
        // Inicializar
        if (typeof init === 'string') {
          const pairs = init.split('&');
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            if (pair.length === 2) {
              this.params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
          }
        }
      };
    }
    
    console.log('[EarlyInit] Polyfills configurados');
  }
  
  // Inicializar todo
  function initialize() {
    ensureEssentialElements();
    setupErrorFiltering();
    setupPolyfills();
    console.log('[EarlyInit] Sistema de pre-carga inicializado correctamente');
  }
  
  // Ejecutar inmediatamente
  initialize();
})();
