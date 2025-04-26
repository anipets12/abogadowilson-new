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
  ];
  
  // CDN para cargar módulos:
  const CDN_URLS = {
    unpkg: 'https://unpkg.com',        // Primario - soporta UMD bien
    jsdelivr: 'https://cdn.jsdelivr.net/npm',  // Secundario - cdn alternativo
    cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs'  // Terciario - otra alternativa
  };

  // Lista de módulos con sus versiones UMD
  const CDN_MODULES = {
    '@headlessui/react': { url: '@headlessui/react@1.7.17/dist/headlessui.umd.js' },
    '@heroicons/react': { url: '@heroicons/react@2.0.18/dist/index.umd.min.js' },
    'react-icons': { url: 'react-icons@4.11.0/umd/react-icons.min.js' },
    'framer-motion': { url: 'framer-motion@10.16.4/dist/framer-motion.umd.min.js' },
    'axios': { url: 'axios@1.6.2/dist/axios.min.js' }
  };
  
  // Mapeo de nombres de CDN a mapeo de módulos específicos por proveedor
  const CDN_SPECIFIC_URLS = {
    cdnjs: {
      '@headlessui/react': 'headlessui/1.7.17/headlessui.umd.min.js',
      'react-icons': 'react-icons/4.11.0/react-icons.min.js',
      'framer-motion': 'framer-motion/10.16.4/framer-motion.umd.min.js',
      'axios': 'axios/1.6.2/axios.min.js'
    }
  };
  
  // Antigua configuración (referencia)
  const OLD_CDN_MODULES = {
    '@heroicons/react': [
      'https://unpkg.com/@heroicons/react@2.0.18/dist/index.umd.min.js',
      'https://cdn.jsdelivr.net/npm/@heroicons/react@2.0.18/dist/index.umd.min.js',
      '/fallback/heroicons.js'
    ],
    'framer-motion': [
      'https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.umd.min.js',
      'https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.umd.min.js',
      '/fallback/framer-motion.js'
    ],
    'axios': [
      'https://unpkg.com/axios@1.6.2/dist/axios.min.js',
      'https://cdn.jsdelivr.net/npm/axios@1.6.2/dist/axios.min.js',
      '/fallback/axios.min.js'
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
  
  // Precargar módulos problemáticos conocidos de forma asincrónica
  function preloadProblematicModules() {
    console.log('[ModuleFix] Precargando módulos con problemas conocidos...');
    
    // Array de promesas de carga
    const loadPromises = [];
    
    // Para cada base de módulo (react-icons, headlessui, etc)
    Object.keys(CDN_MODULES).forEach(baseModuleName => {
      loadPromises.push(
        loadModuleFromCDN(baseModuleName, CDN_MODULES[baseModuleName])
          .catch(error => {
            console.error(`[ModuleFix] Error al precargar ${baseModuleName}:`, error);
            return false; // No detener la carga por un error
          })
      );
    });
    
    // Devolver promesa que se resuelve cuando todos los módulos están cargados
    return Promise.all(loadPromises).then(() => {
      console.log('[ModuleFix] Todos los módulos precargados');
    });
  }
  
  // Cargar un módulo desde CDN con sistema de reintentos
  function loadModuleFromCDN(moduleName, currentCdnIndex = 0) {
    // Evitar cargar el mismo módulo múltiples veces
    if (window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`]) {
      console.log(`[ModuleFix] Módulo ${moduleName} ya cargado desde CDN`);
      return Promise.resolve(true);
    }
    
    const cdnNames = Object.keys(CDN_URLS);
    
    // Si ya intentamos todos los CDNs, usar el fallback local
    if (currentCdnIndex >= cdnNames.length) {
      return loadFallbackModule(moduleName);
    }
    
    const cdnName = cdnNames[currentCdnIndex];
    const cdnBaseUrl = CDN_URLS[cdnName];
    
    // Determinar la URL correcta para este CDN
    let moduleUrl;
    if (cdnName === 'cdnjs' && CDN_SPECIFIC_URLS.cdnjs && CDN_SPECIFIC_URLS.cdnjs[moduleName]) {
      // CDNJS tiene una estructura de URL diferente
      moduleUrl = `${cdnBaseUrl}/${CDN_SPECIFIC_URLS.cdnjs[moduleName]}`;
    } else if (CDN_MODULES[moduleName]) {
      // Usar la URL estándar de la configuración de módulos
      moduleUrl = `${cdnBaseUrl}/${CDN_MODULES[moduleName].url}`;
    } else {
      // Si no tenemos configuración para este módulo, pasar al siguiente CDN
      console.warn(`[ModuleFix] No hay configuración para ${moduleName} en ${cdnName}`);
      return loadModuleFromCDN(moduleName, currentCdnIndex + 1);
    }
    
    console.log(`[ModuleFix] Intentando cargar ${moduleName} desde ${moduleUrl} (CDN: ${cdnName})`);
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = moduleUrl;
      script.async = true;
      script.crossOrigin = 'anonymous'; // Importante para CORS
      
      // Marcar con atributo de datos para identificar
      script.setAttribute('data-module-name', moduleName);
      script.setAttribute('data-cdn-source', cdnName);
      
      // Establecer timeout para detectar cargas lentas
      const timeoutId = setTimeout(() => {
        console.warn(`[ModuleFix] Timeout al cargar ${moduleName} desde ${moduleUrl}`);
        // Intentar con el siguiente CDN
        document.head.removeChild(script);
        loadModuleFromCDN(moduleName, currentCdnIndex + 1)
          .then(resolve)
          .catch(reject);
      }, 5000); // 5 segundos de timeout
      
      script.onload = () => {
        clearTimeout(timeoutId);
        console.log(`[ModuleFix] Módulo ${moduleName} cargado exitosamente desde ${cdnName}`);
        window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`] = true;
        resolve(true);
      };
      
      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`[ModuleFix] Error al cargar ${moduleName} desde ${moduleUrl}`);
        // Intentar con el siguiente CDN
        document.head.removeChild(script);
        loadModuleFromCDN(moduleName, currentCdnIndex + 1)
          .then(resolve)
          .catch(reject);
      };
      
      document.head.appendChild(script);
      
      // Función para intentar con el siguiente CDN o cargar desde fallback local
      function tryNextCDN() {
        // Si hay más CDNs disponibles, intentar con el siguiente
        if (Array.isArray(cdnUrls) && CDN_ATTEMPTS[moduleName] < cdnUrls.length * 2) {
          loadModuleFromCDN(moduleName, cdnUrls).then(resolve).catch(reject);
        } else {
          console.warn(`[ModuleFix] Todos los CDNs fallaron para ${moduleName}, cargando versión local`);
          loadLocalFallback(moduleName).then(resolve).catch(reject);
        }
      }
    });
  }
  
  // Cargar módulo desde fallback local
  function loadLocalFallback(moduleName) {
    const moduleKey = moduleName.replace(/[@\/]/g, '_').toLowerCase();
    const fallbackPath = `/fallback/${moduleKey}.js`;
    
    console.log(`[ModuleFix] Cargando fallback local para ${moduleName} desde ${fallbackPath}`);
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = fallbackPath;
      script.async = true;
      
      script.onload = () => {
        console.log(`[ModuleFix] Fallback local para ${moduleName} cargado correctamente`);
        window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`] = true;
        handleSpecialCases(moduleName);
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error(`[ModuleFix] Error al cargar fallback local para ${moduleName}:`, error);
        
        // Último recurso: crear un módulo vacío
        console.warn(`[ModuleFix] Creando stub mínimo para ${moduleName}`);
        window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`] = true;
        window.__cdnModules = window.__cdnModules || {};
        window.__cdnModules[moduleName] = {};
        
        // Resolver de todas formas para no bloquear la aplicación
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
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
  
  // Inicializar sistema de forma robusta y asincru00f3nica
  function initialize() {
    // Crear contenedor para mu00f3dulos
    window.__cdnModules = window.__cdnModules || {};
    
    // Crear registro del estado del sistema
    window.__MODULE_SYSTEM_STATE__ = {
      initialized: false,
      loadAttempts: 0,
      loadedModules: {},
      errors: []
    };
    
    // Monitorear errores
    monitorModuleErrors();
    
    console.log('[ModuleFix] Iniciando carga de mu00f3dulos esenciales...');
    
    // Precargar mu00f3dulos conocidos de forma asincru00f3nica
    preloadProblematicModules()
      .then(() => {
        window.__MODULE_SYSTEM_STATE__.initialized = true;
        console.log('[ModuleFix] Sistema de carga de mu00f3dulos inicializado correctamente');
        
        // Evento personalizado para notificar que los mu00f3dulos estu00e1n cargados
        const event = new CustomEvent('moduleSystemReady', { detail: { success: true } });
        window.dispatchEvent(event);
      })
      .catch(error => {
        console.error('[ModuleFix] Error en la inicializaciu00f3n del sistema de mu00f3dulos:', error);
        window.__MODULE_SYSTEM_STATE__.errors.push(error);
        
        // Aún así, marcar como inicializado pero con errores
        window.__MODULE_SYSTEM_STATE__.initialized = 'withErrors';
        
        // Evento personalizado para notificar error
        const event = new CustomEvent('moduleSystemReady', { detail: { success: false, error } });
        window.dispatchEvent(event);
      });
  }
  
  // Iniciar inmediatamente
  initialize();
})();
