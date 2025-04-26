/**
 * Sistema de recuperaciu00f3n para errores de elemento root
 * Este script garantiza que siempre exista un elemento root para la aplicaciu00f3n
 */

(function() {
  console.log('[FixRoot] Inicializando sistema de recuperaciu00f3n de elemento root...');
  
  // Ejecutar al inicio del documento
  function ensureRootElement() {
    // Verificar si ya existe un elemento root
    let rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.warn('[FixRoot] Elemento root no encontrado, creando uno nuevo...');
      
      // Crear un nuevo elemento div con id="root"
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      
      // Agregar algunos estilos para asegurar que ocupe toda la pantalla
      rootElement.style.position = 'fixed';
      rootElement.style.top = '0';
      rootElement.style.left = '0';
      rootElement.style.width = '100%';
      rootElement.style.height = '100%';
      rootElement.style.zIndex = '999';
      rootElement.style.backgroundColor = '#ffffff';
      
      // Agregar al body cuando estu00e9 disponible
      if (document.body) {
        document.body.appendChild(rootElement);
        console.log('[FixRoot] Elemento root creado y agregado al documento.');
      } else {
        // Si el body au00fan no estu00e1 disponible, esperar a que el DOM estu00e9 listo
        console.log('[FixRoot] Body no disponible, esperando a DOMContentLoaded...');
        
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(rootElement);
          console.log('[FixRoot] Elemento root creado y agregado al documento (DOMContentLoaded).');
        });
      }
    }
    
    return rootElement;
  }
  
  // Verificar y reparar elementos rotos
  function repairBrokenElements() {
    // Reparar ReactDOM si estu00e1 roto
    if (window.ReactDOM && typeof window.ReactDOM.createRoot !== 'function') {
      console.warn('[FixRoot] ReactDOM.createRoot no estu00e1 disponible, implementando fallback...');
      
      // Implementar una versiu00f3n de fallback para createRoot
      window.ReactDOM.createRoot = function(container) {
        return {
          render: function(element) {
            try {
              window.ReactDOM.render(element, container);
              console.log('[FixRoot] Renderizado completado usando ReactDOM.render como fallback.');
            } catch (error) {
              console.error('[FixRoot] Error en renderizado fallback:', error);
              
              // u00daltimo recurso: mostrar un mensaje al usuario
              container.innerHTML = `
                <div style="padding: 20px; font-family: sans-serif;">
                  <h2 style="color: #2563eb;">Abogado Wilson</h2>
                  <p>Aplicaciu00f3n en mantenimiento. Por favor, intente nuevamente en unos minutos.</p>
                  <button onclick="window.location.reload()" 
                    style="padding: 8px 16px; background: #2563eb; color: white; 
                    border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
                    Reintentar
                  </button>
                </div>
              `;
            }
          }
        };
      };
    }
    
    // Verificar y reparar window.__APP_STATE__
    if (!window.__APP_STATE__) {
      console.warn('[FixRoot] __APP_STATE__ no encontrado, creando objeto...');
      window.__APP_STATE__ = {
        loaded: false,
        failed: false,
        retryCount: 0,
        maxRetries: 3,
        errorCount: 0,
        dependencies: {},
        modules: {}
      };
    }
  }
  
  // Escuchar errores en tiempo de ejecuciu00f3n
  window.addEventListener('error', function(event) {
    console.warn('[FixRoot] Error detectado:', event.error);
    
    // Si el error estu00e1 relacionado con root o ReactDOM
    if (event.error && event.error.message && (
        event.error.message.includes('root is null') || 
        event.error.message.includes('getElementById') ||
        event.error.message.includes('createRoot')))
    {
      console.warn('[FixRoot] Error relacionado con el elemento root, intentando reparar...');
      
      // Reparar root y ReactDOM
      ensureRootElement();
      repairBrokenElements();
      
      // Intentar recargar la aplicaciu00f3n
      setTimeout(function() {
        if (typeof window.initializeApp === 'function') {
          console.log('[FixRoot] Reintentando inicializaciu00f3n de aplicaciu00f3n...');
          window.initializeApp().catch(function(error) {
            console.error('[FixRoot] Error al reinicializar aplicaciu00f3n:', error);
          });
        }
      }, 1000);
    }
  });
  
  // Inicializar sistema de recuperaciu00f3n
  ensureRootElement();
  repairBrokenElements();
  
  console.log('[FixRoot] Sistema de recuperaciu00f3n inicializado correctamente.');
})();
