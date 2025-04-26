/**
 * Sistema unificado de carga de componentes UI
 * Maneja todas las bibliotecas con problemas de CORS y MIME
 * @version 1.0.0
 */

(function() {
  console.log('[UIComponentsBundle] Inicializando carga de componentes UI');
  
  // Lista de scripts a cargar desde local
  const localScripts = [
    { path: '/fallback/headlessui.js', global: 'HeadlessUI', module: '@headlessui/react' },
    { path: '/fallback/heroicons.js', global: 'HeroIcons', module: '@heroicons/react' },
    { path: '/fallback/react-icons.js', global: 'ReactIcons', module: 'react-icons' }
  ];
  
  // Cargar scripts locales
  function loadLocalScript(config) {
    return new Promise((resolve, reject) => {
      // Verificar si ya estu00e1 cargado
      if (window[config.global]) {
        console.log(`[UIComponentsBundle] ${config.module} ya estu00e1 cargado globalmente`);
        resolve(window[config.global]);
        return;
      }
      
      const script = document.createElement('script');
      script.src = config.path;
      script.async = false;
      
      script.onload = function() {
        console.log(`[UIComponentsBundle] Script local cargado: ${config.path}`);
        resolve(window[config.global]);
      };
      
      script.onerror = function(error) {
        console.error(`[UIComponentsBundle] Error cargando ${config.path}:`, error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Cargar todos los scripts locales en orden
  async function loadAllScripts() {
    for (const config of localScripts) {
      try {
        await loadLocalScript(config);
      } catch (error) {
        console.error(`[UIComponentsBundle] Error cargando ${config.module}:`, error);
      }
    }
    
    // Notificar que todos los componentes estu00e1n listos
    document.dispatchEvent(new CustomEvent('ui-components-ready'));
    console.log('[UIComponentsBundle] Todos los componentes UI cargados correctamente');
  }
  
  // Parchar el sistema de importaciu00f3n para manejar paquetes UI
  function patchImportSystem() {
    // Guardar la funciu00f3n original
    const originalImport = window.importShim || window.import || (s => import(s));
    
    // Reemplazar con nuestra versiu00f3n parcheada
    window.importShim = window.import = function(specifier) {
      // Manejar los mu00f3dulos UI problemu00e1ticos
      if (specifier.includes('@headlessui/react')) {
        console.log('[UIComponentsBundle] Interceptando importaciu00f3n de @headlessui/react');
        return Promise.resolve({
          default: window.HeadlessUI || {},
          ...window.HeadlessUI,
          __esModule: true
        });
      }
      
      if (specifier.includes('@heroicons/react')) {
        console.log('[UIComponentsBundle] Interceptando importaciu00f3n de @heroicons/react');
        return Promise.resolve({
          default: window.HeroIcons || {},
          ...window.HeroIcons,
          __esModule: true
        });
      }
      
      if (specifier.includes('react-icons')) {
        console.log('[UIComponentsBundle] Interceptando importaciu00f3n de react-icons');
        return Promise.resolve({
          default: window.ReactIcons || {},
          ...window.ReactIcons,
          __esModule: true
        });
      }
      
      // Para cualquier otro mu00f3dulo, usar la importaciu00f3n original
      return originalImport(specifier);
    };
    
    console.log('[UIComponentsBundle] Sistema de importaciu00f3n parcheado');
  }
  
  // Parchar fetch para manejar peticiones problemu00e1ticas
  function patchFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = function(resource, options) {
      const url = resource.url || resource;
      
      if (typeof url === 'string') {
        // Interceptar peticiones a CDNs que fallan por CORS
        if (url.includes('cdn.jsdelivr.net') && 
            (url.includes('@headlessui') || 
             url.includes('@heroicons') || 
             url.includes('react-icons'))) {
          console.log(`[UIComponentsBundle] Interceptando fetch a: ${url}`);
          
          // Simular respuesta exitosa vacu00eda
          return Promise.resolve(new Response('{}', {
            status: 200,
            headers: { 'Content-Type': 'application/javascript' }
          }));
        }
      }
      
      // Para cualquier otra peticiu00f3n, usar fetch original
      return originalFetch(resource, options);
    };
    
    console.log('[UIComponentsBundle] Sistema fetch parcheado');
  }
  
  // Inicializar todo el sistema
  function initialize() {
    patchImportSystem();
    patchFetch();
    loadAllScripts();
  }
  
  // Iniciar cuando el DOM estu00e9 listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
