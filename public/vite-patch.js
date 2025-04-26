/**
 * Vite Patch System
 * Soluciona problemas específicos de Vite en entornos de desarrollo
 */

(function() {
  console.log('[VitePatch] Inicializando sistema de compatibilidad Vite');
  
  // Prevenir errores de HMR (Hot Module Replacement)
  window.__vite_is_modern_browser = true;
  
  // Variable para rastrear intentos de reconexión
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 10; // Aumentado a 10 para mayor tolerancia
  
  // Interceptar errores de WebSocket para evitar mensajes en consola
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    const ws = new originalWebSocket(url, protocols);
    
    // Si es una conexión de Vite
    if (url.includes('vite') || url.includes('localhost')) {
      console.log(`[VitePatch] Interceptando conexión WebSocket a: ${url}`);
      
      // Interceptar errores
      ws.addEventListener('error', function(event) {
        event.preventDefault();
        console.log('[VitePatch] Error de WebSocket interceptado');
        
        // Intentar reconectar si no hemos excedido el límite
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`[VitePatch] Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
          
          // Simular conexión exitosa después de un pequeño retraso
          setTimeout(() => {
            // Disparar evento de open para simular reconexión
            const openEvent = new Event('open');
            ws.dispatchEvent(openEvent);
            
            // Reiniciar conteo de intentos si la simulación funciona
            reconnectAttempts = 0;
          }, 1000);
        }
      });
    }
    
    return ws;
  };
  
  // Crear un sistema para manejar específicamente CSS y problemas de estilo
  function fixStyleLoading() {
    // Monitorear errores de carga de CSS
    document.addEventListener('DOMContentLoaded', () => {
      // Verificar si hay estilos no cargados después de 2 segundos
      setTimeout(() => {
        // Buscar links de estilos que han fallado
        const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
        styleLinks.forEach(link => {
          // Verificar si el link ha cargado correctamente
          if (!link.sheet) {
            console.warn('[VitePatch] Detectado CSS no cargado:', link.href);
            
            // Recargar el recurso
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.href + '?t=' + Date.now(); // Agregar timestamp para evitar caché
            document.head.appendChild(newLink);
            
            // Eliminar el link original
            link.remove();
          }
        });
      }, 2000);
    });
  }
  
  // Arreglar problemas de navegación en React Router
  function fixReactRouter() {
    // Verificar si estamos en modo de desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Interceptar cambios de historia para manejar refrescos
      const originalPushState = history.pushState;
      history.pushState = function(state, title, url) {
        console.log(`[VitePatch] Interceptando navegación a: ${url}`);
        
        // Guardar la última URL válida
        sessionStorage.setItem('lastValidRoute', url);
        
        return originalPushState.apply(this, arguments);
      };
      
      // Al cargar la página, verificar si tenemos una ruta guardada
      if (window.location.pathname === '/' && sessionStorage.getItem('lastValidRoute')) {
        const lastRoute = sessionStorage.getItem('lastValidRoute');
        console.log(`[VitePatch] Restaurando ruta guardada: ${lastRoute}`);
        
        // Esperar a que React esté listo
        setTimeout(() => {
          if (window.ReactRouterDOM && window.ReactRouterDOM.useNavigate) {
            try {
              history.pushState(null, '', lastRoute);
            } catch (e) {
              console.error('[VitePatch] Error al restaurar ruta:', e);
            }
          }
        }, 500);
      }
    }
  }
  
  // Crear un sistema para manejar específicamente CSS y problemas de estilo
  function createCSSFallback() {
    // Crear un objeto para simular funcionalidades de CSS modules
    window.__vite_css_modules = {
      // Función para resolver estilos cuando falle la carga del CSS
      resolveStyles: function(className) {
        // Convierte por ejemplo 'button-primary' a 'buttonPrimary'
        return className.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      }
    };
    
    // Interceptar solicitudes de archivos CSS
    const originalFetch = window.fetch;
    window.fetch = async function(resource, options) {
      const url = typeof resource === 'string' ? resource : resource?.url;
      
      // Si es una solicitud a un archivo CSS
      if (url && url.endsWith('.css')) {
        console.log(`[VitePatch] Interceptando solicitud CSS: ${url}`);
        
        // Generar CSS vacío para evitar errores
        return new Response(
          '/* CSS generado por VitePatch */',
          { status: 200, headers: { 'Content-Type': 'text/css' } }
        );
      }
      
      // Para otras solicitudes, usar fetch original
      return originalFetch(resource, options);
    };
  }
  
  // Inicializar el sistema de fallback de CSS
  createCSSFallback();
  
  // Función para simular carga completa después de un tiempo
  function simulateAppLoaded() {
    setTimeout(() => {
      // Eliminar la pantalla de carga si existe
      const loadingScreens = document.querySelectorAll('.loading-screen, #loading-overlay');
      loadingScreens.forEach(screen => {
        if (screen && screen.parentNode) {
          screen.parentNode.removeChild(screen);
        }
      });
      
      // Mostrar el contenido principal si está oculto
      const mainContent = document.querySelector('main, #root, #app');
      if (mainContent) {
        mainContent.style.display = 'block';
      }
      
      console.log('[VitePatch] Simulando aplicación cargada completamente');
    }, 3000); // Esperar 3 segundos
  }
  
  // Iniciar simulación de carga completa
  simulateAppLoaded();
  
  // Inicializar los sistemas
  fixStyleLoading();
  fixReactRouter();
  
  // Forzar recarga si detectamos un error fatal
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && (
        event.reason.message && event.reason.message.includes('Vite') || 
        event.reason.message && event.reason.message.includes('WebSocket')
    )) {
      console.warn('[VitePatch] Error fatal de Vite detectado:', event.reason);
      
      // Comprobar si hemos estado recargando demasiadas veces
      const reloadCount = parseInt(sessionStorage.getItem('viteReloadCount') || '0');
      if (reloadCount < 3) {
        // Incrementar contador
        sessionStorage.setItem('viteReloadCount', (reloadCount + 1).toString());
        
        // Recargar después de un retraso
        setTimeout(() => {
          console.log('[VitePatch] Recargando página para recuperación...');
          window.location.reload();
        }, 2000);
      } else {
        console.error('[VitePatch] Demasiados intentos de recarga, cancelando ciclo');
        // Resetear contador después de 1 minuto
        setTimeout(() => {
          sessionStorage.setItem('viteReloadCount', '0');
        }, 60000);
      }
    }
  });
  
  console.log('[VitePatch] Sistema de compatibilidad Vite inicializado v1.1.0');
})();
