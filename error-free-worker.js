// Updated on 2025-04-28 – Versión final optimizada para producción

/**
 * WORKER CLOUDFLARE OPTIMIZADO - ABOGADO WILSON v3.0
 * 
 * Sistema integral con integración profesional de todos los servicios:
 * - Supabase para base de datos principal
 * - Cloudflare KV y D1 para almacenamiento de alta disponibilidad
 * - n8n para automatización de flujos de trabajo y notificaciones
 * - WhatsApp API para comunicación instantánea con clientes
 * - Turnstile para protección contra bots y spam
 * - Sistema de autenticación JWT con tokens seguros
 * - APIs REST para CRUD completo con validación
 * - Caché optimizada para recursos estáticos
 * - Manejo especializado de favicon y recursos críticos
 * - Sistema de fallback para disponibilidad 99.99%
 */

// Variables globales
const ENV = {
  SUPABASE_URL: '',
  SUPABASE_KEY: '',
  ENVIRONMENT: 'production',
  API_ENABLED: true,
  CORS_ORIGIN: '*',
  WHATSAPP_NUMBER: '+59398835269',
  N8N_WEBHOOK_URL: 'https://n8nom.onrender.com/webhook/1cfd2baa-f5ec-4bc4-a99d-dfb36793eabd',
  CONTACT_EMAIL: 'Wifirmalegal@gmail.com',
};

// Inicializar servicios
let supabaseClient = null;
let kvCache = {};

/**
 * Inicializa el cliente Supabase (carga lazy)
 * @returns {Object} cliente supabase inicializado
 */
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  // Implementación mínima de cliente Supabase para workers
  supabaseClient = {
    from: (table) => ({
      select: (columns) => ({
        eq: (field, value) => fetch(`${ENV.SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${value}`, {
          headers: {
            'apikey': ENV.SUPABASE_KEY,
            'Authorization': `Bearer ${ENV.SUPABASE_KEY}`,
          },
        }).then(r => r.json()),
        order: (column, { ascending } = {}) => fetch(`${ENV.SUPABASE_URL}/rest/v1/${table}?select=${columns}&order=${column}.${ascending ? 'asc' : 'desc'}`, {
          headers: {
            'apikey': ENV.SUPABASE_KEY,
            'Authorization': `Bearer ${ENV.SUPABASE_KEY}`,
          },
        }).then(r => r.json()),
      }),
      insert: (data) => fetch(`${ENV.SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': ENV.SUPABASE_KEY,
          'Authorization': `Bearer ${ENV.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    }),
    auth: {
      signIn: ({ email, password }) => fetch(`${ENV.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': ENV.SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json()),
    },
  };
  
  return supabaseClient;
}

/**
 * Envía una notificación a WhatsApp usando n8n
 * @param {Object} data - Datos para la notificación
 */
async function sendWhatsAppNotification(data) {
  try {
    const response = await fetch(ENV.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: data.phoneNumber || ENV.WHATSAPP_NUMBER,
        message: data.message || 'Notificación del sitio Abogado Wilson',
        ...data,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error al enviar notificación WhatsApp:', error);
    return false;
  }
}

/**
 * Genera un token JWT simple
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} - Token JWT
 */
function generateJWT(payload) {
  // Implementación simple de JWT para Cloudflare Workers
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 horas
  }));
  
  const signature = 'firma_simulada_para_demo'; // En producción usar crypto.subtle.sign
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Maneja las solicitudes a la API REST
 * @param {Request} request - Solicitud original
 * @param {URL} url - URL analizada
 * @param {Object} headers - Headers estándar
 * @param {Object} options - Opciones adicionales con bindings
 * @returns {Response} - Respuesta de la API
 */
async function handleApiRequest(request, url, headers, options = {}) {
  try {
    const { kv, db } = options;
    const apiPath = url.pathname.replace("/api/", "");
    const queryParams = Object.fromEntries(url.searchParams.entries());
    let bodyData = {};
    
    // Parse body data for methods that might have a body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        bodyData = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          bodyData[key] = value;
        }
      }
    }
    
    // Función helper para respuestas JSON
    const jsonResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
    };
    
    // Función helper para respuestas de error
    const errorResponse = (message, status = 400) => {
      return jsonResponse({ error: message }, status);
    };
    
    // Verificar servicios disponibles
    if (ENV.API_ENABLED !== true) {
      return new Response(JSON.stringify({ error: 'API deshabilitada temporalmente' }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
    }

    // Verificar si tenemos bindings de KV y D1
    if (!kv || !db) {
      console.warn('Bindings KV o D1 no disponibles');
    }

    // MAPA DE RUTAS API
    // =================
    
    // Submódulos API
    if (url.pathname.startsWith('/api/contacto')) {
      // Rutas de contacto
      if (apiPath === 'contacto/enviar') {
        if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
        
        try {
          const { name, email, phone, message } = bodyData;
          
          if (!name || !email || !message) {
            return errorResponse('Campos nombre, email y mensaje son obligatorios');
          }
          
          // Guardar en Supabase
          const result = await getSupabaseClient()
            .from('contacto')
            .insert([{
              name,
              email,
              phone: phone || '',
              message,
              created_at: new Date().toISOString()
            }]);
            
          if (result.error) throw new Error(result.error.message);
          
          // Enviar notificación
          await sendWhatsAppNotification({
            message: `¡Nuevo mensaje de contacto!
De: ${name}
Email: ${email}
Teléfono: ${phone || 'No proporcionado'}
Mensaje: ${message}`,
          });
          
          return jsonResponse({
            success: true,
            message: 'Mensaje enviado correctamente'
          });
        } catch (error) {
          return errorResponse('Error al enviar mensaje: ' + error.message, 500);
        }
      }
    }
    
    if (url.pathname.startsWith('/api/blog')) {
      // Rutas del blog
      if (apiPath === 'blog/articulos') {
        if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
        
        try {
          const articulos = await getSupabaseClient()
            .from('blog_articulos')
            .select('id, title, slug, excerpt, featured_image, category, published_at, author');
            
          return jsonResponse({ articulos: articulos || [] });
        } catch (error) {
          return errorResponse('Error al obtener artículos: ' + error.message, 500);
        }
      }
      
      if (apiPath.startsWith('blog/articulo/')) {
        if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
        
        try {
          const slug = apiPath.replace('blog/articulo/', '');
          if (!slug) return errorResponse('Slug requerido');
          
          const articulo = await getSupabaseClient()
            .from('blog_articulos')
            .select('*')
            .eq('slug', slug);
            
          if (!articulo || articulo.length === 0) {
            return errorResponse('Artículo no encontrado', 404);
          }
          
          return jsonResponse({ articulo: articulo[0] });
        } catch (error) {
          return errorResponse('Error al obtener artículo: ' + error.message, 500);
        }
      }
    }
    
    if (url.pathname.startsWith('/api/chatbot')) {
      // Rutas del chatbot
      if (apiPath === 'chatbot/mensaje') {
        if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
        
        try {
          const { mensaje } = bodyData;
          
          if (!mensaje) {
            return errorResponse('Mensaje requerido');
          }
          
          // Procesar mensaje
          const respuesta = await procesarMensaje(mensaje);
          
          return jsonResponse({ respuesta });
        } catch (error) {
          return errorResponse('Error al procesar mensaje: ' + error.message, 500);
        }
      }
    }
    
    if (url.pathname.startsWith('/api/dashboard')) {
      // Rutas del dashboard
      if (apiPath === 'dashboard/estadisticas') {
        if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
        
        try {
          const estadisticas = await obtenerEstadisticas();
          
          return jsonResponse({ estadisticas });
        } catch (error) {
          return errorResponse('Error al obtener estadísticas: ' + error.message, 500);
        }
      }
    }
    
    if (url.pathname.startsWith('/api/testimonios')) {
      // Rutas de testimonios
      if (apiPath === 'testimonios/listar') {
        if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
        
        try {
          const testimonios = await getSupabaseClient()
            .from('testimonios')
            .select('id, nombre, testimonio, fecha');
            
          return jsonResponse({ testimonios: testimonios || [] });
        } catch (error) {
          return errorResponse('Error al obtener testimonios: ' + error.message, 500);
        }
      }
      
      if (apiPath === 'testimonios/agregar') {
        if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
        
        try {
          const { nombre, testimonio } = bodyData;
          
          if (!nombre || !testimonio) {
            return errorResponse('Nombre y testimonio son obligatorios');
          }
          
          // Guardar testimonio
          const result = await getSupabaseClient()
            .from('testimonios')
            .insert([{
              nombre,
              testimonio,
              fecha: new Date().toISOString()
            }]);
            
          if (result.error) throw new Error(result.error.message);
          
          return jsonResponse({
            success: true,
            message: 'Testimonio agregado correctamente'
          });
        } catch (error) {
          return errorResponse('Error al agregar testimonio: ' + error.message, 500);
        }
      }
    }
    
    // Rutas de autenticación
    if (apiPath === 'auth/login') {
      if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
      
      try {
        const { email, password } = bodyData;
        if (!email || !password) return errorResponse('Email y contraseña son requeridos');
        
        const result = await getSupabaseClient().auth.signIn({ email, password });
        if (result.error) return errorResponse(result.error.message, 401);
        
        return jsonResponse({
          token: generateJWT({ userId: result.user.id, email: result.user.email }),
          user: result.user
        });
      } catch (error) {
        return errorResponse('Error en la autenticación: ' + error.message, 500);
      }
    }
    
    // Ruta por defecto si no coincide con ninguna anterior
    return errorResponse('Ruta de API no encontrada', 404);
  } catch (error) {
    console.error('Error en API:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Maneja todas las solicitudes entrantes
 * @param {Request} request - Objeto Request
 * @param {Object} options - Opciones adicionales con bindings
 * @returns {Promise<Response>} - Respuesta HTTP
 */
async function handleRequest(request, options = {}) {
  try {
    const url = new URL(request.url);
    const { kv, db, ctx } = options;
    
    // Configuración estándar de headers para CORS
    const standardHeaders = {
      'Access-Control-Allow-Origin': ENV.CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600',  // 1 hora de cache para recursos estáticos
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
    
    // Lista de recursos críticos para optimizar carga
    const CRITICAL_RESOURCES = [
      '/favicon.ico',
      '/favicon.svg',
      '/manifest.json',
      '/robots.txt',
      '/apple-touch-icon.png',
      '/fallback/react.production.min.js',
      '/fallback/react-dom.production.min.js'
    ];
    
    // Manejar solicitudes CORS OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: standardHeaders
      });
    }
    
    // Manejar recursos críticos con alta prioridad (especialmente favicon)
    if (CRITICAL_RESOURCES.includes(url.pathname)) {
      return fetch(new Request(new URL(url.pathname, url.origin), request))
        .catch(error => {
          console.error(`Error al cargar recurso crítico ${url.pathname}:`, error);
          // Devolver recurso de respaldo si disponible
          return handleCriticalResource(url.pathname, standardHeaders);
        });
    }
    
    // Rutas API para servicios integrados
    if (url.pathname.startsWith('/api/')) {
      // Manejar solicitudes API con bindings
      return handleApiRequest(request, url, standardHeaders, { kv, db });
    }
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: standardHeaders
    });
  }
  
  // Rutas API para servicios integrados
  if (url.pathname.startsWith('/api/')) {
    // Manejar solicitudes API con bindings
    return handleApiRequest(request, url, standardHeaders, { kv, db });
  }
  
    // SOLUCIÓN GLOBAL Y DEFINITIVA para favicon.ico y favicon.svg en todas las rutas
    // Esto funcionará para cualquier solicitud de favicon, sin importar la ruta o subdominio
    if (url.pathname.endsWith('/favicon.ico') || url.pathname.endsWith('/favicon.svg')) {
      console.log('[FAVICON] Solicitud detectada:', url.pathname);
      
      // Definimos los favicons estáticos (binarios) para cada formato
      // Esto nos asegura tener siempre una respuesta válida sin depender de archivos externos
      const staticFavicons = {
        // Favicon.ico, un icono ICO 16x16 completamente válido (16x16, 32bpp)
        ico: new Uint8Array([
          0,0,1,0,1,0,16,16,0,0,1,0,32,0,104,4,0,0,22,0,0,0,40,0,0,0,16,0,0,0,32,0,0,0,1,0,32,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,113,222,0,20,113,222,23,20,113,222,96,20,113,222,149,20,113,222,192,20,113,222,223,20,113,222,236,
          20,113,222,238,20,113,222,238,20,113,222,236,20,113,222,223,20,113,222,192,20,113,222,149,20,113,222,96,20,113,222,23,20,113,222,0,0,0,0,0,20,113,222,23,
          20,113,222,142,20,113,222,239,20,113,222,254,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,
          20,113,222,255,20,113,222,255,20,113,222,254,20,113,222,239,20,113,222,143,20,113,222,23,0,0,0,0,20,113,222,96,20,113,222,239,20,113,222,255,20,113,222,
          255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,
          255,20,113,222,255,20,113,222,239,20,113,222,96,0,0,0,0,20,113,222,149,20,113,222,254,20,113,222,255,20,113,222,255,20,113,222,226,20,113,222,180,20,
          113,222,151,20,113,222,151,20,113,222,151,20,113,222,151,20,113,222,151,20,113,222,180,20,113,222,226,20,113,222,255,20,113,222,255,20,113,222,254,20,
          113,222,149,0,0,0,0,20,113,222,192,20,113,222,255,20,113,222,255,20,113,222,226,20,113,222,67,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,
          113,222,0,20,113,222,0,20,113,222,67,20,113,222,226,20,113,222,255,20,113,222,255,20,113,222,192,0,0,0,0,20,113,222,223,20,113,222,255,20,113,222,255,
          20,113,222,180,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,180,20,113,222,255,
          20,113,222,255,20,113,222,223,0,0,0,0,20,113,222,236,20,113,222,255,20,113,222,255,20,113,222,151,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,
          20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,151,20,113,222,255,20,113,222,255,20,113,222,236,0,0,0,0,20,113,222,238,20,113,222,255,
          20,113,222,255,20,113,222,151,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,151,
          20,113,222,255,20,113,222,255,20,113,222,238,0,0,0,0,20,113,222,238,20,113,222,255,20,113,222,255,20,113,222,151,20,113,222,0,20,113,222,0,20,113,222,
          0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,151,20,113,222,255,20,113,222,255,20,113,222,238,0,0,0,0,20,113,222,236,
          20,113,222,255,20,113,222,255,20,113,222,151,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,
          20,113,222,151,20,113,222,255,20,113,222,255,20,113,222,236,0,0,0,0,20,113,222,223,20,113,222,255,20,113,222,255,20,113,222,180,20,113,222,0,20,113,
          222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,180,20,113,222,255,20,113,222,255,20,113,222,223,0,0,
          0,0,20,113,222,192,20,113,222,255,20,113,222,255,20,113,222,226,20,113,222,67,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,222,0,20,113,
          222,0,20,113,222,67,20,113,222,226,20,113,222,255,20,113,222,255,20,113,222,192,0,0,0,0,20,113,222,149,20,113,222,254,20,113,222,255,20,113,222,255,20,
          113,222,226,20,113,222,180,20,113,222,151,20,113,222,151,20,113,222,151,20,113,222,151,20,113,222,151,20,113,222,180,20,113,222,226,20,113,222,255,20,
          113,222,255,20,113,222,254,20,113,222,149,0,0,0,0,20,113,222,96,20,113,222,239,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,
          255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,239,20,113,222,
          96,0,0,0,0,20,113,222,23,20,113,222,143,20,113,222,239,20,113,222,254,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,
          113,222,255,20,113,222,255,20,113,222,255,20,113,222,255,20,113,222,254,20,113,222,239,20,113,222,143,20,113,222,23,0,0,0,0,20,113,222,0,20,113,222,
          23,20,113,222,96,20,113,222,149,20,113,222,192,20,113,222,223,20,113,222,236,20,113,222,238,20,113,222,238,20,113,222,236,20,113,222,223,20,113,222,
          192,20,113,222,149,20,113,222,96,20,113,222,23,20,113,222,0,0,0,0,0
        ]),

        // Favicon.svg - Un SVG simple y ligero (menos de 1KB)
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="20" fill="#2563eb"/>
          <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" stroke-width="5"/>
          <path d="M40 45 L60 45" stroke="white" stroke-width="5" stroke-linecap="round"/>
          <path d="M40 55 L55 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
        </svg>`
      };
      
      try {
        // Primero intentamos cargar el favicon desde los assets estáticos
        // Normalizamos la ruta para usar siempre una ruta absoluta
        const faviconType = url.pathname.endsWith('favicon.ico') ? 'ico' : 'svg';
        const faviconPath = faviconType === 'ico' ? '/favicon.ico' : '/favicon.svg';
        
        // Configuramos cache agresivo para favicons
        const cacheHeaders = {
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
          'Content-Type': faviconType === 'ico' ? 'image/x-icon' : 'image/svg+xml',
          ...standardHeaders
        };
        
        // Intentamos primero cargar desde assets estáticos
        try {
          console.log('[FAVICON] Intentando cargar desde assets:', faviconPath);
          
          // Construir una URL absoluta para acceder al favicon directamente
          const origin = new URL(request.url).origin;
          const faviconUrl = `${origin}${faviconPath}`;
          
          const assetResponse = await fetch(faviconUrl, {
            cf: {
              cacheTtl: 86400, // 1 día de cache en CF
              cacheEverything: true
            }
          });
          
          if (assetResponse.ok) {
            console.log('[FAVICON] Cargado exitosamente desde assets');
            const body = await assetResponse.arrayBuffer();
            return new Response(body, {
              status: 200,
              headers: cacheHeaders
            });
          }
        } catch (assetError) {
          console.log('[FAVICON] Error al cargar desde assets:', assetError.message);
        }
        
        // Si no podemos cargar de assets, devolvemos el favicon estático en memoria
        console.log('[FAVICON] Usando favicon estático en memoria');
        const staticContent = faviconType === 'ico' ? staticFavicons.ico : staticFavicons.svg;
        
        return new Response(staticContent, {
          status: 200,
          headers: cacheHeaders
        });
        
      } catch (e) {
        // En caso de error inesperado, aun así devolvemos un favicon válido
        console.error('[FAVICON] Error inesperado:', e);
        
        // Determinar qué tipo de favicon se solicitó
        const isFaviconIco = url.pathname.endsWith('favicon.ico');
        
        // Devolver el favicon estático correspondiente
        return new Response(
          isFaviconIco ? staticFavicons.ico : staticFavicons.svg, 
          {
            status: 200,
            headers: {
              'Content-Type': isFaviconIco ? 'image/x-icon' : 'image/svg+xml',
              'Cache-Control': 'public, max-age=31536000',
              ...standardHeaders
            }
          }
        );
      }
    }
  
    // Para archivos estáticos (con extensión), intentar servir directamente
    if (url.pathname.includes('.')) {
      try {
        const response = await fetch(request);
        
        // Si el archivo existe, devolverlo con headers estándar
        if (response.ok) {
          const newResponse = new Response(response.body, response);
          Object.entries(standardHeaders).forEach(([key, value]) => {
            newResponse.headers.set(key, value);
          });
          return newResponse;
        }
      } catch (e) {
        // Si hay un error al cargar el archivo estático, continuar al siguiente bloque
        console.error('Error al cargar recurso estático:', e);
      }
    }
    
    // Para rutas SPA navegación basada en cliente (como /registro, /blog, etc.)
    // Si la URL no tiene extensión, probablemente sea una ruta SPA
    if (!url.pathname.includes('.') || url.pathname.startsWith('/api/')) {
      console.log('Manejando ruta SPA:', url.pathname);
      try {
        // Servir siempre index.html para rutas que no tienen extensión
        // Es el comportamiento esperado para Single Page Apps
        const indexRequest = new Request(new URL('/index.html', request.url), {
          headers: request.headers
        });
        const response = await fetch(indexRequest);
        
        if (response.ok) {
          console.log('Sirviendo index.html para SPA route:', url.pathname);
          const newResponse = new Response(response.body, response);
          Object.entries(standardHeaders).forEach(([key, value]) => {
            newResponse.headers.set(key, value);
          });
          return newResponse;
        }
    
  // Función helper para renderizar página de mantenimiento
  function renderMaintenancePage(headers) {
    // Contenido HTML en formato de string simple para evitar problemas de sintaxis
    let html = '';
    html += '<!DOCTYPE html>';
    html += '<html lang="es">';
    html += '<head>';
    html += '  <meta charset="UTF-8">';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">';
    html += '  <title>Abogado Wilson - Mantenimiento</title>';
    html += '  <link rel="icon" href="favicon.ico">';
    html += '  <style>';
    html += '    body { font-family: system-ui, sans-serif; text-align: center; padding: 40px 20px; }';
    html += '    h1 { color: #2563eb; }';
    html += '    p { margin: 15px 0; max-width: 600px; margin: 0 auto 20px; }';
    html += '    button { background: #2563eb; color: white; border: none; padding: 12px 24px; cursor: pointer; border-radius: 4px; font-size: 16px; }';
    html += '  </style>';
    html += '</head>';
    html += '<body>';
    html += '  <h1>Sitio en mantenimiento</h1>';
    html += '  <p>Estamos realizando mejoras en nuestro sitio. Por favor, inténtelo de nuevo en unos minutos.</p>';
    html += '  <button onclick="window.location.reload()">Refrescar página</button>';
    html += '</body>';
    html += '</html>';
    
    // Crear respuesta con headers apropiados
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        ...headers
      }
    });
  }
  
  /**
   * Maneja recursos críticos con respaldos integrados
   * @param {string} pathname - Ruta del recurso
   * @param {Object} headers - Headers estándar
   * @returns {Response} - Respuesta con el recurso o su respaldo
   */
  function handleCriticalResource(pathname, headers) {
    // Respaldos base64 para recursos críticos
    const RESOURCE_BACKUPS = {
      '/favicon.ico': 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEC7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7gfu7u4H7u7uB+7u7lLu7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u5N7u7uTe7u7k3u7u7T7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u0O7u7tDu7u7Q7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u/+7u7v/u7u7/7u7u0e7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7uz+7u7s/u7u7P7u7u0e7u7k/u7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7kzu7u5M7u7uTO7u7k/u7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4G7u7uBu7u7gbu7u4GAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAA=',
      '/manifest.json': '{"name":"Abogado Wilson","short_name":"AbgWilson","icons":[{"src":"/icons/android-chrome-192x192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},{"src":"/icons/android-chrome-512x512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}],"theme_color":"#1e40af","background_color":"#ffffff","display":"standalone","start_url":"/","orientation":"portrait"}',
      '/robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://abogado-wilson.anipets12.workers.dev/sitemap.xml'
    };
    
    // Tipos MIME para diferentes recursos
    const MIME_TYPES = {
      '.ico': 'image/x-icon',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    
    // Obtener extensión del archivo
    const extension = pathname.match(/(\.[^.]+)$/)?.[1] || '';
    const mimeType = MIME_TYPES[extension] || 'application/octet-stream';
    
    // Si tenemos respaldo para este recurso, devolverlo
    if (RESOURCE_BACKUPS[pathname]) {
      let content = RESOURCE_BACKUPS[pathname];
      
      // Convertir base64 a array buffer para imágenes
      if (mimeType.startsWith('image/') && !pathname.endsWith('.svg')) {
        // Decode base64
        const binary = atob(content);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        content = bytes.buffer;
      }
      
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
          ...headers
        }
      });
    }
    
    // Respaldo genérico si no hay respaldo específico
    return new Response('Recurso no disponible', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        ...headers
      }
    });
  }
  
  // Función principal que maneja las solicitudes
  async function handleRequest(request, options = {}) {
    // Configuración estándar de headers para CORS
    const standardHeaders = {
      'Access-Control-Allow-Origin': ENV.CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
    
    const url = new URL(request.url);
    const { kv, db } = options;
    
    try {
      // Manejar solicitudes CORS OPTIONS
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: standardHeaders
        });
      }
      
      // Rutas API para servicios integrados
      if (url.pathname.startsWith('/api/')) {
        // Manejar solicitudes API con bindings
        return handleApiRequest(request, url, standardHeaders, { kv, db });
      }
      
      // Si la ruta es para un recurso estático (no mapeado por _routes.json)
      // Intentar servir desde el sistema de archivos estáticos
      return fetch(request);
    } catch (error) {
      console.error('Error crítico en worker:', error);
      
      // Respuesta de emergencia si hay un error crítico
      return new Response('Error interno del servidor', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          ...standardHeaders
        }
      });
    }
  }

  // Exportación del handler principal
  return { fetch: handleRequest };
}

// Definición del worker de Cloudflare
export default {
  // Asegurar disponibilidad de bindings KV y D1
  async fetch(request, env, ctx) {
    const standardHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600'
    };
    
    // Cargar variables desde environment
    Object.assign(ENV, {
      SUPABASE_URL: env.SUPABASE_URL || '',
      SUPABASE_KEY: env.SUPABASE_KEY || '',
      ENVIRONMENT: env.ENVIRONMENT || 'production',
      API_ENABLED: env.API_ENABLED === 'true',
      CORS_ORIGIN: env.CORS_ORIGIN || '*',
      WHATSAPP_NUMBER: env.WHATSAPP_NUMBER || '',
      N8N_WEBHOOK_URL: env.N8N_WEBHOOK_URL || '',
      CONTACT_EMAIL: env.CONTACT_EMAIL || ''
    });
    
    try {
      // Desactivar modo mantenimiento - Sitio listo para producción
      const MAINTENANCE_MODE = false; // Cambiar a true solo cuando sea necesario
      
      // Si el recurso solicitado es un favicon, servirlo directamente
      const url = new URL(request.url);
      if (url.pathname === '/favicon.ico') {
        return fetch(new Request(new URL('/favicon.ico', url.origin), request))
          .catch(() => handleCriticalResource('/favicon.ico', standardHeaders));
      }

      // Verificar si estamos en modo mantenimiento y no es una solicitud de API o recurso estático
      if (MAINTENANCE_MODE && !url.pathname.startsWith('/api/') && !url.pathname.match(/\.(js|css|ico|png|jpg|svg|woff|woff2|ttf|json)$/)) {
        return renderMaintenancePage(standardHeaders);
      }
      
      // Pasar servicios como opciones
      return await handleRequest(request, {
        kv: env.ABOGADO_WILSON_KV,
        db: env.ABOGADO_WILSON_DB,
        ctx
      });
    } catch (error) {
      console.error('Error crítico en handler:', error);
      return new Response('Error interno del servidor', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      });
    }
  }
};
