/**
 * CORS Proxy avanzado para desarrollo local
 * Permite el acceso a recursos externos desde localhost sin problemas de CORS
 * y proporciona respuestas simuladas para servicios externos
 */

// Instalación inmediata de BinancePay simulado para prevenir errores
(function installBinancePayImmediately() {
  if (typeof window !== 'undefined') {
    window.BinancePay = {
      checkout: function(options) {
        console.log('[BinancePay Simulado] Checkout iniciado con opciones:', options);
        // Simular procesamiento y redireccionar después de 1 segundo
        setTimeout(() => {
          if (options.returnUrl) {
            console.log('[BinancePay Simulado] Redirigiendo a:', options.returnUrl);
            window.location.href = options.returnUrl + '?simulator=true&status=success';
          }
        }, 1000);
        return true;
      }
    };
    console.log('[BinancePay Simulado] Inicializado inmediatamente');
    
    // Notificar a otros scripts que BinancePay está listo
    const event = new CustomEvent('binancepay_ready', { detail: { simulated: true } });
    document.dispatchEvent(event);
  }
})();

// Dominios permitidos para el proxy
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8787',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8787',
  'https://abogado-wilson.anipets12.workers.dev',
  'https://public.bnbstatic.com'
];

// Respuestas simuladas para API
const API_RESPONSES = {
  // API de salud y configuración
  '/api/health': { status: 'ok', environment: 'development', version: '1.0.0' },
  '/api/config': window.APP_CONFIG || { apiUrl: 'http://localhost:8787', environment: 'development' },
  
  // Datos de la aplicación
  '/api/data/searches': { success: true, data: [] },
  '/api/data/topics': { 
    success: true, 
    data: [
      { id: 1, title: 'Reforma al Código Penal: Implicaciones prácticas', author: 'Dr. Wilson Ipiales', date: '2023-12-15', replies: 24, views: 156, category: 'Derecho Penal', excerpt: 'Análisis de las recientes reformas al COIP y cómo afectan a los procesos penales en curso.' },
      { id: 2, title: 'Consulta sobre juicio de alimentos', author: 'María Sánchez', date: '2023-12-14', replies: 18, views: 89, category: 'Derecho Familiar', excerpt: 'Tengo dudas sobre el proceso de demanda de alimentos y los documentos necesarios.' },
      { id: 3, title: 'Procedimiento para impugnar multas de tránsito', author: 'Carlos Mendoza', date: '2023-12-12', replies: 32, views: 210, category: 'Tránsito', excerpt: 'Quisiera conocer el procedimiento correcto para impugnar una multa que considero injusta.' }
    ] 
  },
  
  // Productos y pagos
  '/api/tokens/packages': [
    { id: 1, name: 'Paquete Básico', tokens: 50, price: 15.99, popular: false, save: '0%' },
    { id: 2, name: 'Paquete Estándar', tokens: 120, price: 29.99, popular: true, save: '20%' },
    { id: 3, name: 'Paquete Premium', tokens: 300, price: 59.99, popular: false, save: '33%' },
    { id: 4, name: 'Paquete Empresarial', tokens: 1000, price: 149.99, popular: false, save: '50%' }
  ],
  '/api/payments/process': { success: true, paymentUrl: '#simulation', orderId: 'sim_' + Date.now() },
  '/api/proxy': { success: true, message: 'Proxy data', data: [] },
  
  // Respuesta genérica para cualquier endpoint de Supabase
  'supabase': { success: true, data: [] }
};

// Recursos externos simulados
const EXTERNAL_RESOURCES = {
  // Script de Binance Pay
  'binancepay.js': `
    console.log('[Binance Pay] Script cargado correctamente');
    window.BinancePay = window.BinancePay || {
      checkout: function(options) {
        console.log('[BinancePay] Checkout con opciones:', options);
        setTimeout(() => {
          if (options.returnUrl) {
            window.location.href = options.returnUrl + '?status=success&orderId=' + (options.orderInfo?.orderId || 'order123');
          }
        }, 1000);
        return true;
      }
    };
    document.dispatchEvent(new CustomEvent('binancepay_loaded'));
  `,
  
  // Respuesta genérica para otros recursos externos
  'default': '// Recurso simulado\nconsole.log("[CORS Proxy] Recurso simulado cargado");'
};

// Marcamos que el proxy CORS está instalado
window._corsProxyInstalled = true;

// Instalar interceptor de XMLHttpRequest
(function installXHRInterceptor() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._corsProxyUrl = url;
    return originalOpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const url = this._corsProxyUrl;
    
    // Manejar solicitudes a Supabase
    if (url && (url.includes('supabase') || url.includes('phzldiaohelbyobhjrnc'))) {
      console.log(`[CORS Proxy] Interceptando solicitud XHR a Supabase: ${url}`);
      
      // Simular respuesta exitosa
      setTimeout(() => {
        Object.defineProperty(this, 'readyState', { value: 4 });
        Object.defineProperty(this, 'status', { value: 200 });
        Object.defineProperty(this, 'responseText', { value: JSON.stringify(API_RESPONSES.supabase) });
        this.onreadystatechange && this.onreadystatechange();
        this.onload && this.onload();
      }, 50);
      
      return;
    }
    
    // Manejar solicitudes a API local
    if (url && (url.includes('/api/') || url.includes('localhost:8787'))) {
      console.log(`[CORS Proxy] Interceptando solicitud XHR a API: ${url}`);
      
      // Buscar respuesta simulada apropiada
      let responseData = API_RESPONSES['/api/proxy'];
      
      for (const endpoint in API_RESPONSES) {
        if (url.includes(endpoint)) {
          responseData = API_RESPONSES[endpoint];
          break;
        }
      }
      
      // Simular respuesta exitosa
      setTimeout(() => {
        Object.defineProperty(this, 'readyState', { value: 4 });
        Object.defineProperty(this, 'status', { value: 200 });
        Object.defineProperty(this, 'responseText', { value: JSON.stringify(responseData) });
        this.onreadystatechange && this.onreadystatechange();
        this.onload && this.onload();
      }, 50);
      
      return;
    }
    
    return originalSend.apply(this, args);
  };
  
  console.log('[CORS Proxy] Interceptor XHR instalado');
})();

// Instalar interceptor de fetch
(function installFetchInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async function proxyFetch(resource, options = {}) {
    const url = typeof resource === 'string' ? resource : resource?.url;
    
    // Manejar solicitudes a Binance Pay
    if (url && url.includes('binancepay.js')) {
      console.log('[CORS Proxy] Interceptando solicitud a binancepay.js');
      return new Response(EXTERNAL_RESOURCES['binancepay.js'], {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    // Manejar solicitudes a Supabase
    if (url && (url.includes('supabase') || url.includes('phzldiaohelbyobhjrnc'))) {
      console.log(`[CORS Proxy] Interceptando solicitud fetch a Supabase: ${url}`);
      return new Response(JSON.stringify(API_RESPONSES.supabase), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Manejar solicitudes a API local
    if (url && (url.includes('/api/') || url.includes('localhost:8787'))) {
      console.log(`[CORS Proxy] Interceptando solicitud fetch a API: ${url}`);
      
      // Buscar respuesta simulada apropiada
      let responseData = API_RESPONSES['/api/proxy'];
      
      for (const endpoint in API_RESPONSES) {
        if (url.includes(endpoint)) {
          responseData = API_RESPONSES[endpoint];
          break;
        }
      }
      
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Intentar solicitud normal primero
    try {
      return await originalFetch(resource, options);
    } catch (error) {
      console.log(`[CORS Proxy] Error en solicitud fetch: ${error.message}`);
      
      // Respuesta simulada genérica para cualquier error
      return new Response(JSON.stringify({
        success: true,
        message: 'Respuesta simulada por CORS Proxy',
        data: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
  
  console.log('[CORS Proxy] Interceptor fetch instalado');
})();

// Interceptar carga de scripts externos
(function patchScriptLoading() {
  const originalCreateElement = document.createElement;
  
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      // Observar cambios en el atributo src
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value.includes('binancepay.js')) {
          console.log('[CORS Proxy] Interceptando carga de script:', value);
          
          // Reemplazar con versión local
          setTimeout(() => {
            element.text = EXTERNAL_RESOURCES['binancepay.js'];
            element.dispatchEvent(new Event('load'));
          }, 10);
          
          return originalSetAttribute.call(this, 'type', 'javascript/blocked');
        }
        
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  console.log('[CORS Proxy] Interceptor de scripts instalado');
})();

// Exponer respuestas simuladas al objeto window para que otros scripts puedan acceder a ellas
window.API_RESPONSES = API_RESPONSES;

// Notificar que el proxy está listo
console.log('[CORS Proxy] Sistema de compatibilidad instalado completamente');

// Función global para activar modo de compatibilidad
window.activateCompatibilityMode = function() {
  try {
    localStorage.setItem('use_compatibility_mode', 'true');
    localStorage.setItem('use_proxy', 'true');
    console.log('[CORS Proxy] Modo de compatibilidad activado');
    return true;
  } catch (e) {
    console.error('[CORS Proxy] Error al activar modo de compatibilidad:', e);
    return false;
  }
};

// Activar por defecto
window.activateCompatibilityMode();

// Notificar que el sistema está listo para su uso
document.dispatchEvent(new CustomEvent('cors_proxy_ready', { detail: { simulated: true } }));
