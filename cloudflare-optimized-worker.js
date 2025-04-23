/**
 * CLOUDFLARE WORKER OPTIMIZADO FINAL - ABOGADO WILSON
 * 
 * Este worker resuelve todos los problemas de integración y proporciona
 * una implementación completa y funcional para el proyecto Abogado Wilson.
 * 
 * Características:
 * - Manejo correcto de CORS para APIs
 * - Implementación de endpoints API (/api/config, etc.)
 * - Servicio correcto de archivos estáticos
 * - Manejo de CSP para permitir fuentes externas
 * - Soporte completo para SPA (Single Page Application)
 */

// Variables globales para opciones de respuesta
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
  'Access-Control-Max-Age': '86400'
};

// Configuración CSP que permite Google Fonts y otros recursos esenciales
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://*;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.googleapis.com;
  frame-src 'self';
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim();

// Funciones auxiliares
function addSecurityHeaders(headers) {
  return {
    ...headers,
    'Content-Security-Policy': cspHeader,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

// Implementación de las rutas API
const apiHandlers = {
  // Endpoint de configuración
  '/api/config': async (request) => {
    const config = {
      VITE_SUPABASE_URL: 'https://phzldiaohelbyobhjrnc.supabase.co',
      VITE_SUPABASE_KEY: 'sbp_db5898ecc094d37ec87562399efe3833e63ab20f',
      VITE_APP_VERSION: '3.0.0',
      VITE_API_BASE_URL: new URL(request.url).origin,
      CONFIG_LOADED: true,
      CONFIG_VERSION: '3.0.0',
      CONFIG_TIMESTAMP: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(config), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  },
  
  // Endpoint para blog
  '/api/blog': async () => {
    const articles = [
      {
        id: 1,
        title: 'Derechos Fundamentales en Ecuador',
        excerpt: 'Una guía sobre los derechos constitucionales y su aplicación actual.',
        content: 'Contenido completo del artículo sobre derechos fundamentales...',
        author: 'Dr. Wilson Ipiales',
        category: 'derecho-constitucional',
        date: '2025-03-15',
        image: '/images/blog/constitutional-rights.jpg'
      },
      {
        id: 2,
        title: 'Procedimiento para Divorcios en 2025',
        excerpt: 'Todo lo que necesitas saber sobre el proceso de divorcio actualizado.',
        content: 'Contenido completo sobre el procedimiento de divorcio...',
        author: 'Dr. Wilson Ipiales',
        category: 'derecho-familiar',
        date: '2025-04-01',
        image: '/images/blog/divorce-procedure.jpg'
      },
      {
        id: 3,
        title: 'Derechos Laborales: Lo Que Todo Trabajador Debe Conocer',
        excerpt: 'Análisis de la legislación laboral ecuatoriana actual.',
        content: 'Contenido completo sobre derechos laborales en Ecuador...',
        author: 'Dr. Wilson Ipiales',
        category: 'derecho-laboral',
        date: '2025-04-10',
        image: '/images/blog/labor-rights.jpg'
      }
    ];
    
    return new Response(JSON.stringify(articles), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  },
  
  // Endpoint para categorías de blog
  '/api/blog/categories': async () => {
    const categories = [
      { id: 'derecho-constitucional', name: 'Derecho Constitucional', count: 7 },
      { id: 'derecho-familiar', name: 'Derecho Familiar', count: 12 },
      { id: 'derecho-laboral', name: 'Derecho Laboral', count: 9 },
      { id: 'derecho-penal', name: 'Derecho Penal', count: 8 },
      { id: 'derecho-transito', name: 'Leyes de Tránsito', count: 5 },
      { id: 'derecho-civil', name: 'Derecho Civil', count: 11 }
    ];
    
    return new Response(JSON.stringify(categories), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

// Función principal para manejar solicitudes
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Manejar solicitudes preflight CORS OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Manejar rutas API
  if (pathname.startsWith('/api/')) {
    // Normalizar la ruta API para buscar el manejador correspondiente
    const apiPath = pathname.endsWith('/') 
      ? pathname.slice(0, -1) 
      : pathname;
      
    // Buscar manejador específico para esta ruta API
    const exactHandler = apiHandlers[apiPath];
    if (exactHandler) {
      return exactHandler(request);
    }
    
    // Manejar rutas dinámicas o anidadas
    for (const [basePath, handler] of Object.entries(apiHandlers)) {
      if (apiPath.startsWith(basePath + '/')) {
        return handler(request);
      }
    }
    
    // Si no se encuentra un manejador específico
    return new Response(JSON.stringify({ 
      error: 'Endpoint no implementado',
      path: pathname
    }), {
      status: 501,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  // Servir favicon
  if (pathname === '/favicon.ico' || pathname === '/favicon.svg') {
    try {
      const asset = await env.ASSETS.fetch(request);
      return new Response(asset.body, {
        status: asset.status,
        headers: {
          ...Object.fromEntries(asset.headers),
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } catch (e) {
      // Fallback favicon si no se encuentra el archivo
      return new Response('', { 
        status: 404,
        headers: corsHeaders
      });
    }
  }
  
  // Intentar servir el archivo estático solicitado
  try {
    const response = await env.ASSETS.fetch(request);
    
    // Añadir encabezados de seguridad y CORS a las respuestas
    const headers = new Headers(response.headers);
    Object.entries(addSecurityHeaders(corsHeaders)).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (e) {
    console.error('Error sirviendo activo:', pathname, e);
  }
  
  // Si llegamos aquí, la ruta no coincide con ningún archivo estático
  // Redirigir a index.html (comportamiento SPA)
  try {
    const response = await env.ASSETS.fetch(`${url.origin}/index.html`);
    
    // Añadir encabezados de seguridad y CORS
    const headers = new Headers(response.headers);
    Object.entries(addSecurityHeaders(corsHeaders)).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(response.body, {
      status: 200, // Siempre devolver 200 para rutas SPA
      headers
    });
  } catch (error) {
    // Respuesta final de error si todo lo demás falla
    return new Response('Servicio no disponible', { 
      status: 503,
      headers: corsHeaders
    });
  }
}

// Exportar el manejador para Cloudflare Workers
export default {
  fetch: handleRequest
};
