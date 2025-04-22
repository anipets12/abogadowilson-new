export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Manejar solicitudes CORS OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
        },
      });
    }

    // Manejo específico para endpoints de configuración que están fallando
    if (pathname === '/api/config' || pathname === '/api/config/' || 
        pathname === '/config' || pathname === '/api/config.js' || 
        pathname === '/config.js') {
      return this.handleConfig(request, env);
    }
    
    try {
      // Intentar servir archivos estáticos primero
      const response = await env.ASSETS.fetch(request);
      
      // Modificar respuestas de HTML para incluir encabezados CSP adecuados
      if (response.headers.get('content-type')?.includes('text/html')) {
        const headers = new Headers(response.headers);
        // Política CSP que permite Google Fonts
        headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
      
      return response;
    } catch (e) {
      // Si falla y es una ruta de API, devuelve una respuesta específica
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({
          error: 'API endpoint not implemented',
          path: pathname,
          message: 'Please check the documentation for available endpoints'
        }), { 
          status: 501, 
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Para rutas normales, redirigir a index.html (SPA routing)
      try {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        
        // Aplicar los mismos headers CSP al index.html
        const headers = new Headers(indexResponse.headers);
        headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co");
        
        return new Response(indexResponse.body, {
          status: indexResponse.status,
          statusText: indexResponse.statusText,
          headers
        });
      } catch (indexError) {
        return new Response('Not found', { status: 404 });
      }
    }
  },
  
  // Manejador específico para las solicitudes de configuración
  async handleConfig(request, env) {
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info'
    };
    
    // Crear objeto de configuración para el cliente
    const clientConfig = {
      // Valores de configuración
      VITE_SUPABASE_URL: 'https://phzldiaohelbyobhjrnc.supabase.co',
      VITE_SUPABASE_KEY: 'sbp_db5898ecc094d37ec87562399efe3833e63ab20f',
      VITE_GOOGLE_GENERATIVE_API_KEY: env.GOOGLE_GENERATIVE_API_KEY || 'AIzaSyB9ENQXVErbIQ166m7dGwndOB6hlFj9k5I',
      VITE_GOOGLE_API_KEY_ALTERNATIVE: env.GOOGLE_API_KEY_ALTERNATIVE || 'AIzaSyBCKTfeo2P92rCk_mhrz7J73pNY4zDMBh0',
      VITE_GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID || '387170916829-t6dp4kb7cp663ihq98as0jjju9n0ljbm.apps.googleusercontent.com',
      VITE_GOOGLE_SERVICE_ACCOUNT: env.GOOGLE_SERVICE_ACCOUNT || 'pruebagoogle@gen-lang-client-0663345747.iam.gserviceaccount.com',
      // Metadata de configuración
      CONFIG_LOADED: true,
      CONFIG_VERSION: '2.0.2',
      CONFIG_SOURCE: 'worker-direct',
      CONFIG_TIMESTAMP: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(clientConfig), {
      headers: corsHeaders,
      status: 200,
    });
  }
};
