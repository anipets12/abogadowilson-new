// Configuración global para la aplicación
window.APP_CONFIG = {
  apiUrl: 'https://abogado-wilson.anipets12.workers.dev',
  supabaseUrl: 'https://phzldiaohelbyobhjrnc.supabase.co',
  environment: 'production',
  whatsappNumber: '+59398835269',
  contactEmail: 'Wifirmalegal@gmail.com',
  version: '3.0.0',
  paymentsEnabled: true,
  binancePayId: '549755069',
  chatbotEnabled: true,
  captchaEnabled: true,
  qrEnabled: true
};

// Prevenir errores de CORS
document.addEventListener('DOMContentLoaded', function() {
  console.log('Configuración global cargada correctamente');
});

// Hacer la configuración accesible para peticiones fetch
if (typeof module !== 'undefined') {
  module.exports = window.APP_CONFIG;
}
