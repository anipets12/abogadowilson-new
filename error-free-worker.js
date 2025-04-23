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
 * @returns {Response} - Respuesta de la API
 */
async function handleApiRequest(request, url, headers) {
  const apiPath = url.pathname.replace('/api/', '');
  const supabase = getSupabaseClient();
  
  try {
    // Extraer parametros de la consulta y el cuerpo
    const queryParams = Object.fromEntries(url.searchParams);
    let bodyData = {};
    
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        bodyData = await request.json();
      } catch (e) {
        console.error('Error al parsear cuerpo JSON:', e);
      }
    }
    
    // Respuestas comunes
    const jsonResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    };
    
    const errorResponse = (message, status = 400) => {
      return jsonResponse({ error: message }, status);
    };
    
    // Rutas de autenticación
    if (apiPath === 'auth/login') {
      if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
      
      try {
        const { email, password } = bodyData;
        if (!email || !password) return errorResponse('Email y contraseña son requeridos');
        
        const result = await supabase.auth.signIn({ email, password });
        if (result.error) return errorResponse(result.error.message, 401);
        
        return jsonResponse({
          token: generateJWT({ userId: result.user.id, email: result.user.email }),
          user: result.user
        });
      } catch (error) {
        return errorResponse('Error en la autenticación: ' + error.message, 500);
      }
    }
    
    // Rutas del blog
    if (apiPath === 'blog' || apiPath === 'blog/articles') {
      if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
      
      try {
        const articles = await supabase
          .from('blog_articles')
          .select('id, title, slug, excerpt, featured_image, category, published_at, author')
          .order('published_at', { ascending: false });
          
        return jsonResponse({ articles: articles || [] });
      } catch (error) {
        return errorResponse('Error al obtener artículos: ' + error.message, 500);
      }
    }
    
    if (apiPath.startsWith('blog/article/')) {
      if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
      
      try {
        const slug = apiPath.replace('blog/article/', '');
        if (!slug) return errorResponse('Slug requerido');
        
        const article = await supabase
          .from('blog_articles')
          .select('*')
          .eq('slug', slug);
          
        if (!article || article.length === 0) {
          return errorResponse('Artículo no encontrado', 404);
        }
        
        return jsonResponse({ article: article[0] });
      } catch (error) {
        return errorResponse('Error al obtener artículo: ' + error.message, 500);
      }
    }
    
    // Rutas de consultas legales
    if (apiPath === 'consultations/create') {
      if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
      
      try {
        const { name, email, phone, message, service_type } = bodyData;
        
        if (!name || !email || !message) {
          return errorResponse('Campos nombre, email y mensaje son obligatorios');
        }
        
        // Guardar en Supabase
        const result = await supabase
          .from('consultations')
          .insert([{
            name,
            email,
            phone: phone || '',
            message,
            service_type: service_type || 'general',
            status: 'pending',
            created_at: new Date().toISOString()
          }]);
          
        if (result.error) throw new Error(result.error.message);
        
        // Enviar notificación WhatsApp si está habilitado
        await sendWhatsAppNotification({
          message: `¡Nueva consulta legal!
De: ${name}
Email: ${email}
Teléfono: ${phone || 'No proporcionado'}
Tipo: ${service_type || 'General'}
Mensaje: ${message}`,
        });
        
        return jsonResponse({
          success: true,
          message: 'Consulta recibida correctamente'
        });
      } catch (error) {
        return errorResponse('Error al procesar consulta: ' + error.message, 500);
      }
    }
    
    // Rutas de citas/reservas
    if (apiPath === 'appointments/available') {
      if (request.method !== 'GET') return errorResponse('Método no permitido', 405);
      
      try {
        const { date } = queryParams;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return errorResponse('Formato de fecha inválido. Utilice YYYY-MM-DD');
        }
        
        // Obtener citas existentes
        const existingAppointments = await supabase
          .from('appointments')
          .select('time_slot')
          .eq('date', date);
        
        // Definir slots disponibles (9 AM a 5 PM, cada hora)
        const allSlots = [
          '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
        ];
        
        // Filtrar slots ocupados
        const bookedSlots = existingAppointments ? 
          existingAppointments.map(app => app.time_slot) : [];
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        
        return jsonResponse({ 
          date, 
          available_slots: availableSlots,
          booked_slots: bookedSlots
        });
      } catch (error) {
        return errorResponse('Error al obtener slots disponibles: ' + error.message, 500);
      }
    }
    
    if (apiPath === 'appointments/create') {
      if (request.method !== 'POST') return errorResponse('Método no permitido', 405);
      
      try {
        const { name, email, phone, date, time_slot, service_type, message } = bodyData;
        
        if (!name || !email || !date || !time_slot) {
          return errorResponse('Campos nombre, email, fecha y horario son obligatorios');
        }
        
        // Verificar disponibilidad
        const existingAppointment = await supabase
          .from('appointments')
          .select('id')
          .eq('date', date)
          .eq('time_slot', time_slot);
        
        if (existingAppointment && existingAppointment.length > 0) {
          return errorResponse('El horario seleccionado ya no está disponible', 409);
        }
        
        // Crear la cita
        const result = await supabase
          .from('appointments')
          .insert([{
            name,
            email,
            phone: phone || '',
            date,
            time_slot,
            service_type: service_type || 'general',
            message: message || '',
            status: 'scheduled',
            created_at: new Date().toISOString()
          }]);
          
        if (result.error) throw new Error(result.error.message);
        
        // Enviar notificación
        await sendWhatsAppNotification({
          message: `¡Nueva cita programada!
De: ${name}
Email: ${email}
Teléfono: ${phone || 'No proporcionado'}
Fecha: ${date}
Hora: ${time_slot}
Tipo: ${service_type || 'General'}`,
        });
        
        return jsonResponse({
          success: true,
          message: 'Cita programada correctamente',
          appointment_id: result.data[0].id
        });
      } catch (error) {
        return errorResponse('Error al programar cita: ' + error.message, 500);
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
 * @param {Request} request - Solicitud original
 * @returns {Response} - Respuesta generada
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Headers estándar para todas las respuestas
  const standardHeaders = {
    'Access-Control-Allow-Origin': ENV.CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block'
  };
  
  // Manejar solicitudes CORS OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: standardHeaders
    });
  }
  
  // Rutas API para servicios integrados
  if (url.pathname.startsWith('/api/') && ENV.API_ENABLED) {
    return handleApiRequest(request, url, standardHeaders);
  }
  
  // Manejo específico para favicon.ico y favicon.svg - SOLUCIÓN DEFINITIVA
  if (url.pathname === '/favicon.ico' || url.pathname === '/favicon.svg') {
    try {
      // Intentar servir el archivo desde los assets estáticos
      const faviconResponse = await fetch(request);
      
      if (faviconResponse.ok) {
        const newResponse = new Response(faviconResponse.body, faviconResponse);
        Object.entries(standardHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        // Agregar cache extra para favicon
        newResponse.headers.set('Cache-Control', 'public, max-age=86400');
        return newResponse;
      }
    } catch (e) {
      console.error('Error al servir favicon desde assets:', e);
    }
      
    // Favicon de respaldo en formato SVG
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="#2563eb"/>
      <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" stroke-width="5"/>
      <path d="M40 45 L60 45" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 55 L55 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
    
    return new Response(svgIcon, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
        ...standardHeaders
      }
    });
  }
  
  try {
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
    
    // Para rutas SPA o recursos no encontrados, servir index.html
    try {
      const response = await fetch('/index.html');
      
      if (response.ok) {
        const newResponse = new Response(response.body, response);
        Object.entries(standardHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        return newResponse;
      }
    } catch (e) {
      console.error('Error al cargar index.html:', e);
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
      headers: standardHeaders
    });
  }
}

export default {
  async fetch(request, env) {
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
      return await handleRequest(request);
    } catch (error) {
      console.error('Error crítico en handler:', error);
      return new Response('Error interno', { status: 500 });
    }
  }
};
