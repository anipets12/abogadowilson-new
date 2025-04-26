/**
 * Configuración específica para Cloudflare Workers
 * @version 1.0.0
 */

(function() {
  console.log('[WorkersConfig] Inicializando configuración para Cloudflare Workers');
  
  // Configuración global para entorno de Cloudflare Workers
  window.__CLOUDFLARE_CONFIG__ = {
    deployed: true,
    environment: 'production',
    renderingStrategy: 'sequential',
    recoveryMode: false,
    debug: false
  };
  
  // Estado de renderizado centralizado para evitar conflictos
  window.__RENDERING_STATE__ = {
    initialized: false,
    renderedBy: null,
    renderAttempts: 0,
    maxRenderAttempts: 2, // En producción limitamos los intentos
    activeRenderer: null,
    pendingRenderers: [],
    rootNode: null,
    rootLocked: false
  };
  
  // Sistema de renderizado coordinado para evitar conflictos
  const coordinator = {
    /**
     * Registra un renderizador y evita conflictos
     * @param {string} name - Nombre del sistema que intenta renderizar
     * @param {Function} renderFn - Función de renderizado
     * @param {number} priority - Prioridad (menor = mayor prioridad)
     */
    registerRenderer: function(name, renderFn, priority = 10) {
      // Si ya hay un renderizador activo de mayor prioridad, cancelar
      if (window.__RENDERING_STATE__.activeRenderer && 
          window.__RENDERING_STATE__.activeRenderer.priority < priority) {
        console.log(`[WorkersConfig] Renderizador ${name} cancelado, hay uno de mayor prioridad activo`);
        return false;
      }
      
      // Si el root ya está bloqueado por otro sistema y ya se renderizó, cancelar
      if (window.__RENDERING_STATE__.rootLocked && 
          window.__RENDERING_STATE__.renderedBy !== name) {
        console.log(`[WorkersConfig] Renderizador ${name} cancelado, root bloqueado por ${window.__RENDERING_STATE__.renderedBy}`);
        return false;
      }
      
      // Registrar este renderizador
      window.__RENDERING_STATE__.pendingRenderers.push({
        name,
        renderFn,
        priority,
        timestamp: Date.now()
      });
      
      // Si no hay renderizador activo, activar este
      if (!window.__RENDERING_STATE__.activeRenderer) {
        this.processNextRenderer();
      }
      
      return true;
    },
    
    /**
     * Procesa el siguiente renderizador en cola
     */
    processNextRenderer: function() {
      if (window.__RENDERING_STATE__.pendingRenderers.length === 0) {
        window.__RENDERING_STATE__.activeRenderer = null;
        return;
      }
      
      // Ordenar por prioridad
      window.__RENDERING_STATE__.pendingRenderers.sort((a, b) => a.priority - b.priority);
      
      // Obtener el próximo
      const nextRenderer = window.__RENDERING_STATE__.pendingRenderers.shift();
      window.__RENDERING_STATE__.activeRenderer = nextRenderer;
      
      console.log(`[WorkersConfig] Activando renderizador: ${nextRenderer.name}`);
      
      // Incrementar contador de intentos
      window.__RENDERING_STATE__.renderAttempts++;
      
      // Bloquear el root para este renderizador
      window.__RENDERING_STATE__.rootLocked = true;
      window.__RENDERING_STATE__.renderedBy = nextRenderer.name;
      
      // Ejecutar renderizador
      try {
        nextRenderer.renderFn();
        console.log(`[WorkersConfig] Renderizado exitoso por: ${nextRenderer.name}`);
        // No procesammos más después de un renderizado exitoso
      } catch (error) {
        console.error(`[WorkersConfig] Error en renderizador ${nextRenderer.name}:`, error);
        // Desbloquear y pasar al siguiente
        window.__RENDERING_STATE__.rootLocked = false;
        window.__RENDERING_STATE__.activeRenderer = null;
        
        // Solo procesamos el siguiente si no alcanzamos el máximo de intentos
        if (window.__RENDERING_STATE__.renderAttempts < window.__RENDERING_STATE__.maxRenderAttempts) {
          this.processNextRenderer();
        } else {
          console.warn('[WorkersConfig] Máximo de intentos de renderizado alcanzado');
          // Activar último recurso si todo falla
          this.renderEmergencyContent();
        }
      }
    },
    
    /**
     * Renderiza contenido de emergencia si todo lo demás falla
     */
    renderEmergencyContent: function() {
      console.warn('[WorkersConfig] Renderizando contenido de emergencia');
      
      const root = document.getElementById('root');
      if (!root) return;
      
      // Limpiar cualquier contenido previo
      while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
      
      // Crear contenido de respaldo estático (sin React/DOM)
      root.innerHTML = `
        <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
          <h1 style="color: #2563eb; font-size: 2rem;">Abogado Wilson</h1>
          <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0;">
            <p>Estamos realizando mejoras en nuestro sitio. Por favor, inténtelo de nuevo en unos minutos.</p>
          </div>
          <h2 style="font-size: 1.5rem; margin-top: 2rem;">Contacto</h2>
          <p>Si necesita asistencia inmediata, contáctenos directamente:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 0.5rem 0;">📞 Teléfono: +593 XXXXXXXX</li>
            <li style="margin: 0.5rem 0;">✉️ Email: contacto@abogadowilson.com</li>
            <li style="margin: 0.5rem 0;">📍 Dirección: Ibarra, Ecuador</li>
          </ul>
          <div style="margin-top: 2rem; text-align: center;">
            <button onclick="window.location.reload()" style="background-color: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; cursor: pointer;">
              Refrescar página
            </button>
          </div>
        </div>
      `;
      
      // Marcar como renderizado por emergencia
      window.__RENDERING_STATE__.renderedBy = 'emergency';
    },
    
    /**
     * Limpia y devuelve el root a su estado original
     */
    cleanRoot: function() {
      const root = document.getElementById('root');
      if (!root) return false;
      
      // Limpiar cualquier contenido previo
      while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
      
      // Desbloquear el root
      window.__RENDERING_STATE__.rootLocked = false;
      window.__RENDERING_STATE__.renderedBy = null;
      return true;
    }
  };
  
  // Exponer el coordinador globalmente
  window.__RENDER_COORDINATOR__ = coordinator;
  
  // Parchar React DOM para evitar errores cuando se intenta renderizar múltiples veces
  function patchReactDOM() {
    if (window.ReactDOM && window.ReactDOM.render) {
      const originalRender = window.ReactDOM.render;
      
      window.ReactDOM.render = function(element, container, callback) {
        // Verificar si ya se está renderizando en este contenedor
        if (container.id === 'root' && window.__RENDERING_STATE__.rootLocked) {
          console.warn(`[WorkersConfig] Intento de renderizado bloqueado en #root por ${window.__RENDERING_STATE__.renderedBy}`);
          if (typeof callback === 'function') callback();
          return null;
        }
        
        // Limpiamos primero el contenedor para evitar errores de React #31
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        // Ahora renderizamos con seguridad
        try {
          return originalRender(element, container, callback);
        } catch (error) {
          console.error('[WorkersConfig] Error en ReactDOM.render:', error);
          // Intentar renderizado de emergencia
          if (container.id === 'root') {
            window.__RENDER_COORDINATOR__.renderEmergencyContent();
          }
          if (typeof callback === 'function') callback();
          return null;
        }
      };
      
      // También parchamos createRoot para React 18
      if (window.ReactDOM.createRoot) {
        const originalCreateRoot = window.ReactDOM.createRoot;
        
        window.ReactDOM.createRoot = function(container, options) {
          // Si el contenedor es #root y ya está bloqueado, devolvemos un root falso
          if (container.id === 'root' && window.__RENDERING_STATE__.rootLocked) {
            console.warn(`[WorkersConfig] Intento de createRoot bloqueado en #root por ${window.__RENDERING_STATE__.renderedBy}`);
            return {
              render: function() { return null; },
              unmount: function() {}
            };
          }
          
          // Limpiamos primero el contenedor para evitar errores
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          
          try {
            const root = originalCreateRoot(container, options);
            const originalRootRender = root.render;
            
            // Parchamos el método render del root
            root.render = function(element) {
              try {
                return originalRootRender.call(this, element);
              } catch (error) {
                console.error('[WorkersConfig] Error en root.render:', error);
                // Intentar renderizado de emergencia
                if (container.id === 'root') {
                  window.__RENDER_COORDINATOR__.renderEmergencyContent();
                }
                return null;
              }
            };
            
            return root;
          } catch (error) {
            console.error('[WorkersConfig] Error en createRoot:', error);
            // Devolver un root falso que no haga nada
            return {
              render: function() { return null; },
              unmount: function() {}
            };
          }
        };
      }
      
      console.log('[WorkersConfig] ReactDOM parcheado para evitar conflictos de renderizado');
    }
  }
  
  // Parchar otros sistemas de recuperación para que usen el coordinador
  function patchRecoverySystems() {
    // Parchar offlineBundle
    if (typeof window.renderOfflineApp === 'function') {
      const originalRenderOfflineApp = window.renderOfflineApp;
      window.renderOfflineApp = function() {
        return window.__RENDER_COORDINATOR__.registerRenderer('offlineBundle', originalRenderOfflineApp, 20);
      };
    }
    
    // Parchar emergency-fix
    if (typeof window.renderEmergencyApp === 'function') {
      const originalRenderEmergencyApp = window.renderEmergencyApp;
      window.renderEmergencyApp = function() {
        return window.__RENDER_COORDINATOR__.registerRenderer('emergencyFix', originalRenderEmergencyApp, 30);
      };
    }
    
    // Parchar standalone-app
    if (typeof window.renderStandaloneApp === 'function') {
      const originalRenderStandaloneApp = window.renderStandaloneApp;
      window.renderStandaloneApp = function() {
        return window.__RENDER_COORDINATOR__.registerRenderer('standaloneApp', originalRenderStandaloneApp, 10);
      };
    }
    
    console.log('[WorkersConfig] Sistemas de recuperación parcheados');
  }
  
  // Aplicar parches cuando React esté disponible
  function initialize() {
    if (window.React && window.ReactDOM) {
      patchReactDOM();
      patchRecoverySystems();
      console.log('[WorkersConfig] Configuración para Cloudflare Workers inicializada correctamente');
    } else {
      // Esperar a que React esté disponible
      console.log('[WorkersConfig] Esperando a que React esté disponible...');
      setTimeout(initialize, 50);
    }
  }
  
  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
