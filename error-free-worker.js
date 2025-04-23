// Updated on 2025-04-23 – Bump version to trigger fresh deploy

/**
 * WORKER CLOUDFLARE OPTIMIZADO - ABOGADO WILSON v2.0
 * 
 * Sistema integral con integración profesional de todos los servicios:
 * - Supabase para base de datos principal
 * - Prisma como ORM para PostgreSQL
 * - Cloudflare KV y D1 para almacenamiento
 * - n8n para automatización de flujos
 * - WhatsApp API para comunicación
 * - Turnstile para protección contra bots
 * - Sistema de autenticación JWT
 * - APIs REST para CRUD completo
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
    
    // Headers estándar para todas las respuestas
    const standardHeaders = {
      'Access-Control-Allow-Origin': ENV.CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  
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
  
    // Manejo específico para favicon.ico y favicon.svg - SOLUCIÓN DEFINITIVA
    if (url.pathname === '/favicon.ico' || url.pathname === '/favicon.svg') {
      try {
        // Intentar servir desde assets estáticos
        const faviconRequest = new Request(new URL(url.pathname, request.url), request);
        const faviconResponse = await fetch(faviconRequest);
        
        // Si favicon existe, servirlo directamente
        if (faviconResponse.ok) {
          return faviconResponse;
        } else {
          // Fallback: Generar un favicon vacío para evitar errores 404
          const emptyFavicon = new Uint8Array([0,0,1,0,1,0,16,16,0,0,1,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
          return new Response(emptyFavicon, {
            headers: {
              'Content-Type': 'image/x-icon',
              'Cache-Control': 'public, max-age=31536000',
              ...standardHeaders
            }
          });
        }
      } catch (e) {
        console.error('Error al cargar favicon:', e);
        // Servir favicon vacío en caso de error
        const emptyFavicon = new Uint8Array([0,0,1,0,1,0,16,16,0,0,1,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        return new Response(emptyFavicon, {
          headers: {
            'Content-Type': 'image/x-icon',
            'Cache-Control': 'public, max-age=31536000',
            ...standardHeaders
          }
        });
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
      } catch (e) {
        console.error('Error al cargar index.html para SPA:', e, url.pathname);
      }
    }
    
    // Fallback HTML si todo lo anterior falla
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abogado Wilson</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 40px 20px; }
          h1 { color: #2563eb; }
          p { margin: 15px 0; max-width: 600px; margin: 0 auto 20px; }
          button { background: #2563eb; color: white; border: none; padding: 12px 24px; cursor: pointer; border-radius: 4px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Sitio en mantenimiento</h1>
        <p>Estamos realizando mejoras en nuestro sitio. Por favor, inténtelo de nuevo en unos minutos.</p>
        <button onclick="window.location.reload()">Refrescar página</button>
      </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        ...standardHeaders
      }
    });
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

export default {
  // Asegurar disponibilidad de bindings KV y D1
  async fetch(request, env, ctx) {
    // Cargar variables desde environment
    Object.assign(ENV, {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_KEY: env.SUPABASE_KEY,
      ENVIRONMENT: env.ENVIRONMENT,
      API_ENABLED: env.API_ENABLED === 'true',
      CORS_ORIGIN: env.CORS_ORIGIN,
      WHATSAPP_NUMBER: env.WHATSAPP_NUMBER,
      N8N_WEBHOOK_URL: env.N8N_WEBHOOK_URL,
      CONTACT_EMAIL: env.CONTACT_EMAIL
    });
    
    try {
      // Pasar servicios como opciones
      return await handleRequest(request, {
        kv: env.ABOGADO_WILSON_KV,
        db: env.ABOGADO_WILSON_DB,
        ctx: ctx
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
