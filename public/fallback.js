/**
 * Sistema de respaldo principal para evitar errores de carga
 * Este archivo centraliza todos los respaldos y previene errores en Cloudflare Workers
 */

(function() {
  console.log('[FallbackSystem] Inicializando sistema de respaldo global');
  
  // Definir estado global para detectar errores de carga
  window.__FALLBACK_SYSTEM__ = window.__FALLBACK_SYSTEM__ || {
    errors: [],
    loaded: {},
    initialized: false
  };
  
  // Función para registrar errores de carga
  function registerError(moduleName, error) {
    window.__FALLBACK_SYSTEM__.errors.push({
      module: moduleName,
      error: error,
      time: new Date().toISOString()
    });
    console.warn(`[FallbackSystem] Error al cargar '${moduleName}':`, error);
  }
  
  // Función para registrar módulos cargados exitosamente
  function registerLoaded(moduleName) {
    window.__FALLBACK_SYSTEM__.loaded[moduleName] = true;
    console.log(`[FallbackSystem] Módulo '${moduleName}' cargado correctamente`);
  }
  
  // Asegurarse de que las implementaciones básicas estén disponibles
  function ensureBasicImplementations() {
    // Asegurar que React esté disponible
    if (!window.React) {
      window.React = window.React || {
        createElement: function() { return {}; },
        Fragment: 'div',
        useState: function() { return [null, function() {}]; },
        useEffect: function() {},
        useContext: function() { return {}; },
        createContext: function() { return { Provider: 'div', Consumer: 'div' }; }
      };
      console.warn('[FallbackSystem] React no está disponible, usando implementación de emergencia');
    }
    
    // Asegurar que ReactDOM esté disponible
    if (!window.ReactDOM) {
      window.ReactDOM = window.ReactDOM || {
        render: function() {},
        createPortal: function() { return {}; }
      };
      console.warn('[FallbackSystem] ReactDOM no está disponible, usando implementación de emergencia');
    }
    
    // Asegurar que Framer Motion esté disponible
    if (!window.FramerMotion) {
      window.FramerMotion = {
        motion: { div: 'div', span: 'span' },
        animate: function() {}
      };
      console.warn('[FallbackSystem] Framer Motion no está disponible, usando implementación de emergencia');
    }
    
    // Asegurar que HeadlessUI esté disponible
    if (!window.HeadlessUI) {
      window.HeadlessUI = {
        Transition: { Root: 'div', Child: 'div' },
        Dialog: { Root: 'div', Overlay: 'div', Title: 'h2', Description: 'p' },
        Menu: { Button: 'button', Items: 'div', Item: 'div' },
        Disclosure: { Button: 'button', Panel: 'div' },
        Listbox: { Button: 'button', Options: 'div', Option: 'div' }
      };
      console.warn('[FallbackSystem] HeadlessUI no está disponible, usando implementación de emergencia');
    }

    // Asegurar que createIcon esté definido globalmente para emergencias
    if (typeof window.createIcon === 'undefined') {
      window.createIcon = function(name, path) {
        console.warn(`[FallbackSystem] Llamada a createIcon para ${name}`);
        return function() {
          return {
            type: 'svg',
            props: {
              width: '24',
              height: '24',
              viewBox: '0 0 24 24',
              fill: 'none',
              children: [{
                type: 'path',
                props: {
                  d: path || 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  stroke: 'currentColor',
                  strokeWidth: '2'
                }
              }]
            }
          };
        };
      };
    }
  }

  // Instalar el sistema de respaldo
  ensureBasicImplementations();
  
  // Exportar funciones globalmente
  window.__FALLBACK_SYSTEM__.registerError = registerError;
  window.__FALLBACK_SYSTEM__.registerLoaded = registerLoaded;
  window.__FALLBACK_SYSTEM__.ensureImplementations = ensureBasicImplementations;
  window.__FALLBACK_SYSTEM__.initialized = true;
  
  console.log('[FallbackSystem] Sistema de respaldo global inicializado correctamente');
})();
