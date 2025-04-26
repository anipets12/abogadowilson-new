/**
 * React RenderGuard: Sistema de protecciu00f3n contra renderizados mu00faltiples
 * @version 1.0.0
 * Previene errores de React #31 - mu00faltiples renderizados en un mismo nodo DOM
 */

(function() {
  console.log('[ReactRenderGuard] Inicializando sistema de protecciu00f3n contra renderizados mu00faltiples');
  
  // Estado global del sistema de renderizado
  window.__REACT_RENDER_STATE__ = {
    rootElementId: 'root',
    renderedBy: null,
    renderCount: 0,
    maxRenders: 3,
    rootLocked: false,
    renderStack: []
  };
  
  // Verificar si React y ReactDOM estu00e1n disponibles
  function waitForReact(callback) {
    if (window.React && window.ReactDOM) {
      callback();
      return;
    }
    
    console.log('[ReactRenderGuard] Esperando a que React estu00e9 disponible...');
    setTimeout(function() {
      waitForReact(callback);
    }, 50);
  }
  
  // Parchar React y ReactDOM para proteger contra renderizados mu00faltiples
  function patchReactDOM() {
    // Si ya estu00e1 parcheado, no hacer nada
    if (window.ReactDOM.__patched) return;
    
    console.log('[ReactRenderGuard] Parcheando ReactDOM...');
    
    // Guardar referencias originales
    const originalRender = window.ReactDOM.render;
    const originalCreateRoot = window.ReactDOM.createRoot;
    
    // Parchar ReactDOM.render
    if (typeof originalRender === 'function') {
      window.ReactDOM.render = function(element, container, callback) {
        // Si el contenedor es el root y ya estu00e1 bloqueado
        if (container.id === window.__REACT_RENDER_STATE__.rootElementId && 
            window.__REACT_RENDER_STATE__.rootLocked) {
          console.warn(`[ReactRenderGuard] Intento de ReactDOM.render bloqueado - ya renderizado por: ${window.__REACT_RENDER_STATE__.renderedBy}`);
          if (typeof callback === 'function') callback();
          return null;
        }
        
        // Limpiar el contenedor para evitar Error #31
        try {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        } catch (e) {
          console.warn('[ReactRenderGuard] Error al limpiar contenedor:', e);
        }
        
        try {
          // Registrar este renderizado
          window.__REACT_RENDER_STATE__.renderCount++;
          
          if (container.id === window.__REACT_RENDER_STATE__.rootElementId) {
            window.__REACT_RENDER_STATE__.rootLocked = true;
            window.__REACT_RENDER_STATE__.renderedBy = 'ReactDOM.render';
          }
          
          return originalRender(element, container, callback);
        } catch (error) {
          console.error('[ReactRenderGuard] Error en ReactDOM.render:', error);
          if (typeof callback === 'function') callback();
          return null;
        }
      };
    }
    
    // Parchar ReactDOM.createRoot
    if (typeof originalCreateRoot === 'function') {
      window.ReactDOM.createRoot = function(container, options) {
        // Si el contenedor es el root y ya estu00e1 bloqueado
        if (container.id === window.__REACT_RENDER_STATE__.rootElementId && 
            window.__REACT_RENDER_STATE__.rootLocked) {
          console.warn(`[ReactRenderGuard] Intento de ReactDOM.createRoot bloqueado - ya renderizado por: ${window.__REACT_RENDER_STATE__.renderedBy}`);
          return {
            render: function() { return null; },
            unmount: function() {}
          };
        }
        
        // Limpiar el contenedor para evitar Error #31
        try {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        } catch (e) {
          console.warn('[ReactRenderGuard] Error al limpiar contenedor:', e);
        }
        
        try {
          const root = originalCreateRoot(container, options);
          const originalRootRender = root.render;
          
          // Parchar root.render
          root.render = function(element) {
            try {
              // Registrar este renderizado
              window.__REACT_RENDER_STATE__.renderCount++;
              
              if (container.id === window.__REACT_RENDER_STATE__.rootElementId) {
                window.__REACT_RENDER_STATE__.rootLocked = true;
                window.__REACT_RENDER_STATE__.renderedBy = 'ReactDOM.createRoot';
              }
              
              return originalRootRender.call(this, element);
            } catch (error) {
              console.error('[ReactRenderGuard] Error en root.render:', error);
              return null;
            }
          };
          
          return root;
        } catch (error) {
          console.error('[ReactRenderGuard] Error en ReactDOM.createRoot:', error);
          return {
            render: function() { return null; },
            unmount: function() {}
          };
        }
      };
    }
    
    window.ReactDOM.__patched = true;
    console.log('[ReactRenderGuard] ReactDOM parcheado correctamente');
  }
  
  // Inicializar
  waitForReact(function() {
    patchReactDOM();
    console.log('[ReactRenderGuard] Sistema de protecciu00f3n inicializado correctamente');
  });
})();
