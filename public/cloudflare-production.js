/**
 * Script de producciu00f3n para Cloudflare Workers
 * Coordinaciu00f3n especu00edfica para entorno de producciu00f3n
 * @version 1.0.0
 */

(function() {
  console.log('[CloudflareProduction] Inicializando sistema de producciu00f3n');
  
  // Variables globales para seguimiento de estado
  let appInitialized = false;
  let renderAttempts = 0;
  const MAX_RENDER_ATTEMPTS = 2;
  
  // Recursos críticos que deben cargarse correctamente
  const CRITICAL_RESOURCES = [
    '/favicon.ico',
    '/favicon.svg',
    '/manifest.json',
    '/icons/favicon-backup.svg'
  ];
  
  // Definir la aplicaciu00f3n de respaldo garantizada
  function renderBackupApp() {
    console.log('[CloudflareProduction] Renderizando aplicaciu00f3n de respaldo');
    
    const root = document.getElementById('root');
    if (!root) return false;
    
    // Limpiar cualquier contenido existente
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    
    // Contenido HTML simple y garantizado
    root.innerHTML = `
      <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
        <h1 style="color: #2563eb; font-size: 2rem; margin-bottom: 1.5rem;">Abogado Wilson</h1>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 1rem; margin: 1.5rem 0;">
          <h2 style="font-size: 1.25rem; margin: 0 0 0.5rem 0;">Sitio en mantenimiento</h2>
          <p>Estamos realizando mejoras en nuestro sitio. Por favor, intu00e9ntelo de nuevo en unos minutos.</p>
        </div>
        
        <div style="margin: 2rem 0;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Servicios Legales Profesionales</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">u2696ufe0f Derecho Penal</li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">u2696ufe0f Derecho Civil</li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">u2696ufe0f Tru00e1nsito</li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">u2696ufe0f Derecho Comercial</li>
            <li style="padding: 0.5rem 0;">u2696ufe0f Aduanas</li>
          </ul>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 1.5rem; border-radius: 0.5rem; margin: 2rem 0;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Contacto</h2>
          <p>Para consultas o servicios, contu00e1ctenos directamente:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 0.75rem 0;">ud83dudcde Telu00e9fono: +593 XXXXXXXX</li>
            <li style="margin: 0.75rem 0;">u2709ufe0f Email: contacto@abogadowilson.com</li>
            <li style="margin: 0.75rem 0;">ud83dudccd Direcciu00f3n: Ibarra, Ecuador</li>
          </ul>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
          <button onclick="window.location.reload()" 
            style="background-color: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Refrescar Pu00e1gina
          </button>
        </div>
        
        <footer style="margin-top: 3rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
          u00a9 2025 Abogado Wilson Alexander Ipiales Guerron. Todos los derechos reservados.
        </footer>
      </div>
    `;
    
    return true;
  }
  
  // Verificar si la aplicaciu00f3n principal se estu00e1 ejecutando correctamente
  function checkAppStatus() {
    // Si ya detectamos que estu00e1 inicializada, no hacer nada
    if (appInitialized) return;
    
    console.log('[CloudflareProduction] Verificando estado de la aplicaciu00f3n principal');
    
    // Verificar si hay errores detectados
    const errorsDetected = window.__ERRORS_DETECTED__ || window.__RECOVERY_STATE__?.errors?.length > 0 || false;
    
    // Comprobar si el DOM tiene contenido vu00e1lido
    const root = document.getElementById('root');
    const hasValidContent = root && root.children.length > 0 && !root.textContent.includes('Sitio en mantenimiento');
    
    if (errorsDetected || !hasValidContent) {
      renderAttempts++;
      console.warn(`[CloudflareProduction] Problemas detectados, intento ${renderAttempts} de ${MAX_RENDER_ATTEMPTS}`);
      
      if (renderAttempts >= MAX_RENDER_ATTEMPTS) {
        console.warn('[CloudflareProduction] Mu00e1ximos intentos alcanzados, usando aplicaciu00f3n de respaldo');
        renderBackupApp();
      }
    } else {
      appInitialized = true;
      console.log('[CloudflareProduction] Aplicaciu00f3n principal inicializada correctamente');
    }
  }
  
  // Monitor de errores para capturar problemas y renderizar respaldo
  function setupErrorMonitor() {
    window.addEventListener('error', function(event) {
      // Ignorar errores de WebSocket que no son cru00edticos para la aplicaciu00f3n
      if (event.message && (event.message.includes('WebSocket') || event.message.includes('ws://'))) {
        return;
      }
      
      // Marcar que se detectaron errores
      window.__ERRORS_DETECTED__ = true;
      
      // Si ya intentamos varias veces, renderizar la aplicaciu00f3n de respaldo
      renderAttempts++;
      if (renderAttempts >= MAX_RENDER_ATTEMPTS) {
        console.warn('[CloudflareProduction] Error cru00edtico detectado, usando aplicaciu00f3n de respaldo');
        renderBackupApp();
      }
    }, true);
    
    // Tambiu00e9n monitorear promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', function(event) {
      window.__ERRORS_DETECTED__ = true;
      console.warn('[CloudflareProduction] Promesa rechazada no manejada:', event.reason);
      
      renderAttempts++;
      if (renderAttempts >= MAX_RENDER_ATTEMPTS) {
        console.warn('[CloudflareProduction] Demasiados errores de promesa, usando aplicaciu00f3n de respaldo');
        renderBackupApp();
      }
    });
  }
  
  // Detectar cuando la aplicaciu00f3n estu00e1 lista o ha fallado
  function startAppMonitoring() {
    // Verificar el estado inicial despuu00e9s de 3 segundos (tiempo suficiente para cargar)
    setTimeout(checkAppStatus, 3000);
    
    // Seguir verificando cada 2 segundos hasta 10 segundos mu00e1ximo
    const interval = setInterval(function() {
      if (appInitialized || renderAttempts >= MAX_RENDER_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      checkAppStatus();
    }, 2000);
    
    // Limpieza final despuu00e9s de 10 segundos
    setTimeout(function() {
      clearInterval(interval);
      if (!appInitialized && renderAttempts < MAX_RENDER_ATTEMPTS) {
        console.warn('[CloudflareProduction] Tiempo de espera agotado, usando aplicaciu00f3n de respaldo');
        renderBackupApp();
      }
    }, 10000);
  }
  
  // Manejador de recursos críticos
  function handleCriticalResource(url) {
    if (url.includes('favicon.ico') || url.includes('favicon.svg') || url.includes('icon')) {
      console.log(`[CloudflareProduction] Manejando recurso crítico: ${url}`);
      
      // Crear un favicon de respaldo en base64 si es necesario
      const faviconBase64 = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEC7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7u0e7u7k/u7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7k/u7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4GAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAE=';
      
      // Verificar si el navegador soporta fetch
      if (typeof fetch === 'function') {
        // Intentar cargar el recurso primero
        return fetch(url).catch(() => {
          console.warn(`[CloudflareProduction] Error al cargar ${url}, usando respaldo inline`);
          
          // Devolver un respaldo inline
          if (url.endsWith('.ico')) {
            return new Response(
              Uint8Array.from(atob(faviconBase64), c => c.charCodeAt(0)),
              { headers: { 'Content-Type': 'image/x-icon' } }
            );
          } else if (url.endsWith('.svg')) {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n' +
              '  <circle cx="50" cy="50" r="40" fill="#1e40af" />\n' +
              '  <text x="50" y="60" font-size="40" text-anchor="middle" fill="white">AW</text>\n' +
              '</svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
      }
    }
    
    return null;
  }

  // Interceptar solicitudes de recursos críticos
  function setupResourceInterceptor() {
    // Guardar la función fetch original
    const originalFetch = window.fetch;
    
    if (typeof originalFetch === 'function') {
      window.fetch = function(resource, init) {
        const url = typeof resource === 'string' ? resource : resource.url;
        
        // Verificar si es un recurso crítico
        if (CRITICAL_RESOURCES.some(res => url.includes(res))) {
          const response = handleCriticalResource(url);
          if (response) return response;
        }
        
        // Continuar con el fetch normal
        return originalFetch.call(this, resource, init);
      };
    }
  }
  
  // Inicializar el sistema de producciu00f3n
  function initialize() {
    setupErrorMonitor();
    setupResourceInterceptor();
    startAppMonitoring();
    console.log('[CloudflareProduction] Sistema de producciu00f3n inicializado');
  }
  
  // Esperar a que el DOM estu00e9 completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
