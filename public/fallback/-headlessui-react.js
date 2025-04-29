/**
 * Fallback para @headlessui/react con redirección
 * Este archivo actúa como redirección hacia el archivo correcto
 */

(function() {
  console.log('[Fallback] Redireccionando desde -headlessui-react.js a headlessui.js');
  
  // Cargar el archivo correcto
  const script = document.createElement('script');
  script.src = '/fallback/headlessui.js';
  script.async = true;
  
  script.onload = function() {
    console.log('[Fallback] Carga redirigida exitosa para @headlessui/react');
  };
  
  script.onerror = function(error) {
    console.error('[Fallback] Error en redirección para @headlessui/react:', error);
    // Intento alternativo de carga inmediata en caso de error
    window.HeadlessUI = window.HeadlessUI || {};
    console.log('[Fallback] Creando objeto HeadlessUI de emergencia');
  };
  
  document.head.appendChild(script);
})();
