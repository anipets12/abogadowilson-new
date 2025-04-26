// Configuración global para la aplicación (archivo estático)
window.APP_CONFIG = {
  apiUrl: 'http://localhost:5173/api',
  supabaseUrl: 'https://phzldiaohelbyobhjrnc.supabase.co',
  environment: 'development',
  whatsappNumber: '+59398835269',
  contactEmail: 'Wifirmalegal@gmail.com',
  version: '3.0.0',
  paymentsEnabled: true,
  binancePayId: '549755069',
  chatbotEnabled: true,
  captchaEnabled: true,
  qrEnabled: true,
  fallbackEnabled: true,
  debugMode: true
};

// Hacer la configuración accesible para peticiones fetch
if (typeof module !== 'undefined') {
  module.exports = window.APP_CONFIG;
}

// Notificar que la configuración estática está cargada
console.log('Configuración estática cargada correctamente');
