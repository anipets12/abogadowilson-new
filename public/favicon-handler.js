/**
 * Sistema de gestiu00f3n de favicon con respaldo base64 incorporado - v2.0
 * Soluciona problemas de carga de favicon en Cloudflare Workers de forma definitiva
 * Implementa mu00faltiples niveles de respaldo para garantizar disponibilidad
 */

(function() {
  console.log('[FaviconHandler] Inicializando sistema avanzado de gestiu00f3n de favicon...');
  
  // Favicon en base64 como respaldo absoluto (versión optimizada)
  const faviconBase64 = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEC7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7lLu7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u7T7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u0e7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7u0e7u7k/u7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7k/u7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4GAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAA=';
  
  // SVG favicon optimizado como respaldo (funciona en todos los navegadores)
  const faviconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#1e40af"/><text x="50" y="60" font-size="40" text-anchor="middle" fill="white">AW</text></svg>';
  
  // Crear link rel="preload" para cargar el favicon anticipadamente
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = '/favicon.ico';
  preloadLink.type = 'image/x-icon';
  document.head.appendChild(preloadLink);
  
  // Crear una funciu00f3n para generar Data URLs
  function createDataUrl(data, mimeType) {
    return `data:${mimeType};base64,${data}`;
  }
  
  // Crear el favicon inline como respaldo u00faltimo
  const inlineFavicon = document.createElement('link');
  inlineFavicon.rel = 'icon';
  inlineFavicon.type = 'image/x-icon';
  inlineFavicon.href = createDataUrl(faviconBase64, 'image/x-icon');
  document.head.appendChild(inlineFavicon);

  // Funciu00f3n para instalar todos los favicons necesarios
  function installFavicons() {
    // Remover cualquier favicon existente con manejo seguro
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => {
      try {
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      } catch (e) {
        console.warn('[FaviconHandler] Error al eliminar favicon antiguo:', e);
      }
    });
    
    // Crear los nuevos favicons con respaldo
    const iconLinks = [
      // Favicon estu00e1ndar con respaldo
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', fallback: createDataUrl(faviconBase64, 'image/x-icon') },
      // SVG favicon con respaldo
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', fallback: `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}` },
      // Apple Touch Icon
      { rel: 'apple-touch-icon', href: '/favicon.svg', fallback: `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}` }
    ];
    
    // Instalar cada favicon con manejo de errores
    iconLinks.forEach(iconConfig => {
      const link = document.createElement('link');
      link.rel = iconConfig.rel;
      if (iconConfig.type) link.type = iconConfig.type;
      link.href = iconConfig.href;
      
      // Manejar errores de carga de forma robusta
      link.onerror = function() {
        console.warn(`[FaviconHandler] Error al cargar favicon: ${iconConfig.href}, usando respaldo`);
        // Establecer el respaldo inmediatamente
        this.href = iconConfig.fallback;
      };
      
      document.head.appendChild(link);
    });
    
    console.log('[FaviconHandler] Favicons instalados correctamente');
  }
  
  // Interceptar errores de recursos
  function interceptResourceErrors() {
    window.addEventListener('error', function(e) {
      if (e.target && (e.target.tagName === 'LINK' || e.target.tagName === 'IMG') && 
          ((e.target.rel && e.target.rel.includes('icon')) || 
           (e.target.href && e.target.href.includes('favicon')) || 
           (e.target.src && e.target.src.includes('favicon')))) {
        console.warn('[FaviconHandler] Error detectado en recurso de favicon');
        // Reinstalar favicons si hay error
        installFavicons();
      }
    }, true);
  }
  
  // Interceptar solicitudes de favicon con fetch
  function interceptFaviconFetch() {
    if (!window.fetch) return;
    
    const originalFetch = window.fetch;
    window.fetch = function(resource, init) {
      const url = typeof resource === 'string' ? resource : resource.url;
      
      // Si es una solicitud de favicon
      if (url.includes('favicon.ico') || url.includes('favicon.svg')) {
        console.log(`[FaviconHandler] Interceptando fetch para: ${url}`);
        
        // Primero intentar el fetch original
        return originalFetch(resource, init)
          .catch(error => {
            console.warn(`[FaviconHandler] Error al cargar favicon: ${url}, generando respaldo`, error);
            
            // Crear respuesta para favicon.ico
            if (url.includes('.ico')) {
              return new Response(
                Uint8Array.from(atob(faviconBase64), c => c.charCodeAt(0)),
                { headers: { 'Content-Type': 'image/x-icon' } }
              );
            }
            
            // Crear respuesta para favicon.svg
            if (url.includes('.svg')) {
              return new Response(
                faviconSvg,
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // Si no sabemos quu00e9 tipo es, lanzar el error original
            throw error;
          });
      }
      
      // Para otras solicitudes, continuar normalmente
      return originalFetch(resource, init);
    };
  }
  
  // Funciu00f3n para inicializar el sistema
  function initialize() {
    // Instalar favicons
    installFavicons();
    
    // Interceptar errores
    interceptResourceErrors();
    
    // Interceptar fetch
    interceptFaviconFetch();
    
    console.log('[FaviconHandler] Sistema de gestiu00f3n de favicon inicializado correctamente');
  }
  
  // Inicializar cuando el DOM estu00e9 listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
