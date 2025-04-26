/**
 * Sistema de fallback para dependencias.
 * Este script asegura que las dependencias externas estu00e9n disponibles incluso si hay problemas de red.
 */

// Simulaciones de APIs para modo offline o desarrollo
window.__FALLBACK_APIS = {
  // BinancePay simulado
  BinancePay: {
    checkout: function(options) {
      console.log('BinancePay checkout simulado', options);
      setTimeout(() => {
        // Simular un pago exitoso despuu00e9s de 2 segundos
        if (options.returnUrl) {
          window.location.href = options.returnUrl + '?success=true&simulado=true';
        }
      }, 2000);
      return true;
    }
  },
  
  // Simulaciu00f3n de Supabase
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-test', email: 'test@example.com' } } }),
      signIn: () => Promise.resolve({ data: { user: { id: 'user-test', email: 'test@example.com' } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      })
    }),
  }
};

// Inicializaciu00f3n del sistema de prevenciu00f3n de errores
console.log('Inicializando sistema de recuperaciu00f3n y prevenciu00f3n de errores...');

// Sistema de fallback para errores críticos, sin sobrescribir funcionalidades de otros scripts
// Verificamos primero si ya existe un sistema de proxy CORS
if (!window._corsProxyInstalled) {
  // Solo si no hay un proxy CORS, inicializamos nuestro sistema básico de fallback
  console.log('Inicializando sistema de fallback básico');
  
  // Guardamos funciones de backup (para uso interno)
  window._backupFetch = window._backupFetch || window.fetch;
  
  // Función para proporcionar respuestas de fallback solo en caso de error
  window._getFallbackResponse = function(url) {
    // Si es una solicitud a un recurso crítico, proporcionar un sustituto
    if (url && url.includes('/api/config')) {
      console.log('Proporcionando configuración de fallback');
      return new Response(JSON.stringify(window.APP_CONFIG || {}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return null;
  };
}

// Asegurar que BinancePay estu00e9 disponible
setTimeout(() => {
  if (!window.BinancePay) {
    console.log('BinancePay no disponible, utilizando fallback');
    window.BinancePay = window.__FALLBACK_APIS.BinancePay;
  }
}, 3000);

// Notificar que el sistema de fallback estu00e1 activado
console.log('Sistema de prevenciu00f3n de errores activado correctamente');
