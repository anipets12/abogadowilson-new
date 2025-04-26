/**
 * Sistema avanzado para cargar mu00f3dulos cru00edticos directamente desde CDN
 * Esta soluciu00f3n resuelve los problemas con headlessui, react-icons y otros
 */

(function() {
  console.log('[ModuleFix] Inicializando sistemas de carga de mu00f3dulos desde CDN...');
  
  // Mu00f3dulos con problemas conocidos
  const PROBLEMATIC_MODULES = [
    'react-icons/fa',
    'react-icons/fi',
    'react-icons/si',
    'react-icons/fa6',
    '@headlessui/react',
    '@heroicons/react/24/outline',
    '@heroicons/react/24/solid',
    'framer-motion'
  ];
  
  // Mapeo de múltiples CDNs para cada módulo (para respaldo)
  const CDN_MODULES = {
    '@headlessui/react': [
      'https://esm.sh/@headlessui/react@1.7.17',
      'https://cdn.skypack.dev/@headlessui/react@1.7.17',
      'https://unpkg.com/@headlessui/react@1.7.17/dist/headlessui.umd.js'
    ],
    'react-icons': [
      'https://esm.sh/react-icons@4.11.0',
      'https://cdn.skypack.dev/react-icons@4.11.0',
      'https://unpkg.com/react-icons@4.11.0/index.js'
    ],
    '@heroicons/react': [
      'https://esm.sh/@heroicons/react@2.0.18',
      'https://cdn.skypack.dev/@heroicons/react@2.0.18',
      'https://unpkg.com/@heroicons/react@2.0.18/dist/index.js'
    ],
    'framer-motion': [
      'https://esm.sh/framer-motion@10.16.4',
      'https://cdn.skypack.dev/framer-motion@10.16.4',
      'https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js'
    ],
    'axios': [
      'https://esm.sh/axios@1.6.2',
      'https://cdn.skypack.dev/axios@1.6.2',
      'https://unpkg.com/axios@1.6.2/dist/axios.min.js'
    ]
  };
  
  // Seguimiento de intentos de CDN
  const CDN_ATTEMPTS = {};
  
  // Monitorear errores de carga de mu00f3dulos
  function monitorModuleErrors() {
    window.addEventListener('error', function(event) {
      // Verificar si el error estu00e1 relacionado con la carga de un mu00f3dulo
      if (event.filename && event.filename.includes('/node_modules/.vite/deps/')) {
        console.warn('[ModuleFix] Error detectado en la carga de un mu00f3dulo:', event.filename);
        
        // Extraer el nombre del mu00f3dulo
        const moduleNameMatch = event.filename.match(/\/deps\/([^\?]+)/);
        if (moduleNameMatch && moduleNameMatch[1]) {
          let moduleName = moduleNameMatch[1]
            .replace('.js', '')
            .replace(/%40/g, '@')
            .replace(/_/g, '/');
          
          // Cargar desde CDN si estu00e1 disponible
          const cdnBaseModule = Object.keys(CDN_MODULES).find(base => moduleName.startsWith(base));
          if (cdnBaseModule) {
            console.log(`[ModuleFix] Cargando ${moduleName} desde CDN...`);
            loadModuleFromCDN(cdnBaseModule, CDN_MODULES[cdnBaseModule]);
          }
        }
      }
    }, true);
  }
  
  // Precargar mu00f3dulos problemu00e1ticos conocidos
  function preloadProblematicModules() {
    console.log('[ModuleFix] Precargando mu00f3dulos con problemas conocidos...');
    
    // Para cada base de mu00f3dulo (react-icons, headlessui, etc)
    Object.keys(CDN_MODULES).forEach(baseModuleName => {
      loadModuleFromCDN(baseModuleName, CDN_MODULES[baseModuleName]);
    });
  }
  
  // Cargar un mu00f3dulo desde CDN
  function loadModuleFromCDN(moduleName, cdnUrl) {
    // Evitar cargar el mismo mu00f3dulo mu00faltiples veces
    if (window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`]) {
      console.log(`[ModuleFix] Mu00f3dulo ${moduleName} ya cargado desde CDN`);
      return;
    }
    
    console.log(`[ModuleFix] Cargando ${moduleName} desde ${cdnUrl}...`);
    
    const script = document.createElement('script');
    script.src = cdnUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log(`[ModuleFix] Mu00f3dulo ${moduleName} cargado correctamente desde CDN`);
      window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`] = true;
      
      // Manejar casos especiales
      handleSpecialCases(moduleName);
    };
    
    script.onerror = (error) => {
      console.error(`[ModuleFix] Error al cargar ${moduleName} desde CDN:`, error);
    };
    
    document.head.appendChild(script);
  }
  
  // Manejar casos especiales para ciertos mu00f3dulos
  function handleSpecialCases(moduleName) {
    // Caso especial para react-icons
    if (moduleName === 'react-icons') {
      if (window.ReactIcons) {
        // Exponer los iconos especu00edficos globalmente
        window.FaIcons = window.ReactIcons.fa;
        window.FiIcons = window.ReactIcons.fi;
        window.SiIcons = window.ReactIcons.si;
        
        // Parchear import para react-icons/fa
        patchESModule('react-icons/fa', window.ReactIcons.fa);
        patchESModule('react-icons/fi', window.ReactIcons.fi);
        patchESModule('react-icons/si', window.ReactIcons.si);
      }
    }
    
    // Caso especial para headlessui
    if (moduleName === '@headlessui/react') {
      if (window.Headless) {
        patchESModule('@headlessui/react', window.Headless);
      }
    }
    
    // Caso especial para heroicons
    if (moduleName === '@heroicons/react') {
      if (window.HeroIcons) {
        patchESModule('@heroicons/react/24/outline', window.HeroIcons.outline);
        patchESModule('@heroicons/react/24/solid', window.HeroIcons.solid);
      }
    }
  }
  
  // Parchear sistema de mu00f3dulos ES para que reconozca los mu00f3dulos cargados desde CDN
  function patchESModule(moduleName, moduleExports) {
    // Registrar el mu00f3dulo para que import lo encuentre
    if (window.__vite_plugin_react_preamble_installed__) {
      console.log(`[ModuleFix] Registrando mu00f3dulo ${moduleName} en el sistema de mu00f3dulos Vite`);
      
      // Crear un mu00f3dulo virtual
      const moduleUrl = `/@id/${moduleName}`;
      const virtualModule = {
        url: moduleUrl,
        exports: moduleExports,
        loaded: true
      };
      
      // Registrarlo en el sistema de mu00f3dulos de Vite
      if (window.__vite__moduleCache) {
        window.__vite__moduleCache[moduleUrl] = virtualModule;
      }
      
      // Para importaciones dinnu00e1micas
      if (!window.__cdnModules) window.__cdnModules = {};
      window.__cdnModules[moduleName] = moduleExports;
    }
  }
  
  // Redefinir import() para intercepción de módulos problemáticos
  const originalImport = window.import || Function.prototype;
  
  // Parche para __vite_ssr_dynamic_import__
  if (typeof window.__vite_ssr_dynamic_import__ === 'function') {
    const originalSSRImport = window.__vite_ssr_dynamic_import__;
    window.__vite_ssr_dynamic_import__ = function(modulePath) {
      if (window.__cdnModules && window.__cdnModules[modulePath]) {
        console.log(`[ModuleFix] Redirigiendo SSR import de ${modulePath} a versión CDN`);
        return Promise.resolve(window.__cdnModules[modulePath]);
      }
      return originalSSRImport.apply(this, arguments);
    };
  }
  
  window.import = function(modulePath) {
    // Verificar si es un mu00f3dulo que hemos cargado desde CDN
    if (window.__cdnModules && window.__cdnModules[modulePath]) {
      console.log(`[ModuleFix] Redirigiendo import de ${modulePath} a versiu00f3n CDN`);
      return Promise.resolve({
        default: window.__cdnModules[modulePath],
        __esModule: true
      });
    }
    
    // Si es un mu00f3dulo problema: encontrar su base
    const baseModule = Object.keys(CDN_MODULES).find(base => modulePath.startsWith(base));
    if (baseModule) {
      // Cargar desde CDN si au00fan no se ha cargado
      if (!window[`__${baseModule.replace(/[@\/\-]/g, '_')}__loaded`]) {
        console.log(`[ModuleFix] Cargando desde CDN a petición: ${modulePath}`);
        loadModuleFromCDN(baseModule, CDN_MODULES[baseModule]);
      }
      
      // Esperar a que se cargue y luego resolver la promesa
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.__cdnModules && window.__cdnModules[modulePath]) {
            clearInterval(checkInterval);
            resolve({
              default: window.__cdnModules[modulePath],
              __esModule: true
            });
          }
        }, 100);
        
        // Timeout por si acaso
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve({
            default: {},
            __esModule: true
          });
        }, 3000);
      });
    }
    
    // Para otros mu00f3dulos, usar el import original
    return originalImport.apply(this, arguments);
  };
  
  // Inicializar sistema
  function initialize() {
    // Crear contenedor para mu00f3dulos
    window.__cdnModules = window.__cdnModules || {};
    
    // Monitorear errores
    monitorModuleErrors();
    
    // Precargar mu00f3dulos conocidos
    preloadProblematicModules();
    
    console.log('[ModuleFix] Sistema de carga de mu00f3dulos inicializado correctamente');
  }
  
  // Iniciar inmediatamente
  initialize();
})();
