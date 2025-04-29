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
  
  // CDN para cargar módulos (URLs absolutas):
  const CDN_URLS = {
    unpkg: 'https://unpkg.com',        // Primario - soporta UMD bien
    jsdelivr: 'https://cdn.jsdelivr.net/npm',  // Secundario - cdn alternativo
    cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs'  // Terciario - otra alternativa
  };

  // Lista de URLs seguras y absolutas para módulos críticos con tipos MIME correctos
  const SAFE_MODULE_URLS = {
    // Evitamos CDNs externos en lo posible debido a problemas de CORS
    'axios': '/fallback/axios.min.js', // Usamos local para evitar CORS
    'framer-motion': '/fallback/framer-motion.js', // Siempre local para evitar MIME type errors
    '@headlessui/react': '/fallback/headlessui.js', // Usamos siempre el local para evitar CORS
    '@heroicons/react': '/fallback/heroicons-react.js', // Usamos siempre el local para evitar CORS
    'react-icons': '/fallback/react-icons.js',
    'react-icons/fa': '/fallback/react-icons-fa.js'
  };

  // URLs de fallback en caso de que falle el CDN principal
  const FALLBACK_URLS = {
    'axios': '/fallback/axios.js', // Siempre usar local como fallback final
    'framer-motion': '/fallback/framer-motion.js',
    '@headlessui/react': '/fallback/headlessui.js',
    '@heroicons/react': '/fallback/heroicons-react.js',
    'react-icons': '/fallback/react-icons.js',
    'react-icons/fa': '/fallback/react-icons-fa.js'
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
  
  // Precargar módulos problemáticos conocidos de forma asíncrona
  function preloadProblematicModules() {
    console.log('[ModuleFix] Precargando módulos con problemas conocidos...');
    
    // Array de promesas de carga
    const loadPromises = [];
    
    // Cargar directamente usando URLs seguras
    Object.keys(SAFE_MODULE_URLS).forEach(moduleName => {
      loadPromises.push(
        loadModuleDirectly(moduleName, SAFE_MODULE_URLS[moduleName])
          .catch(error => {
            console.error(`[ModuleFix] Error al cargar ${moduleName} desde URL principal:`, error);
            
            // Intentar con URL de fallback
            if (FALLBACK_URLS[moduleName]) {
              return loadModuleDirectly(moduleName, FALLBACK_URLS[moduleName])
                .catch(fallbackError => {
                  console.error(`[ModuleFix] Error al cargar fallback de ${moduleName}:`, fallbackError);
                  // Último recurso: cargar desde local
                  return loadLocalFallback(moduleName);
                });
            } else {
              // Si no hay fallback definido, ir directamente a local
              return loadLocalFallback(moduleName);
            }
          })
      );
    });
    
    // Devolver promesa que se resuelve cuando todos los módulos están cargados
    return Promise.all(loadPromises).then(() => {
      console.log('[ModuleFix] Todos los módulos precargados');
    });
  }
  
  // Cargar un módulo desde CDN con sistema mejorado
  function loadModuleFromCDN(moduleName, currentCdnIndex = 0) {
    // Evitar cargar el mismo módulo múltiples veces
    if (window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`]) {
      console.log(`[ModuleFix] Módulo ${moduleName} ya cargado desde CDN`);
      return Promise.resolve(true);
    }
    
    // Siempre usar URLs seguras y absolutas para módulos críticos
    if (SAFE_MODULE_URLS[moduleName]) {
      console.log(`[ModuleFix] Usando URL directa para ${moduleName}: ${SAFE_MODULE_URLS[moduleName]}`);
      return loadModuleDirectly(moduleName, SAFE_MODULE_URLS[moduleName]);
    }
    
    // Si no tenemos una URL segura, usar fallback local
    console.log(`[ModuleFix] No hay URL segura para ${moduleName}, usando fallback local`);
    return loadLocalFallback(moduleName);
  }
  
  // Fallbacks locales (URLs absolutas)
  function getLocalFallbackUrl(moduleName) {
    // Mapa de nombres especiales para módulos que tienen nombres particulares
    const SPECIAL_MODULE_NAMES = {
      '@heroicons/react': 'heroicons-react',
      '@headlessui/react': 'headlessui',
      'react-icons/fa': 'react-icons-fa',
      'framer-motion': 'framer-motion'
    };
    
    // Si el módulo tiene un nombre especial, usarlo directamente
    if (SPECIAL_MODULE_NAMES[moduleName]) {
      return window.location.origin + '/fallback/' + SPECIAL_MODULE_NAMES[moduleName] + '.js';
    }
    
    // Generar un nombre estándar para los demás módulos
    let safeName = moduleName.replace(/[@\/]/g, '-').toLowerCase();
    // Evitar nombres que comienzan con guión
    if (safeName.startsWith('-')) {
      safeName = safeName.substring(1);
    }
    
    return window.location.origin + '/fallback/' + safeName + '.js';
  }

  // Cargar módulo directamente desde una URL absoluta
  function loadModuleDirectly(moduleName, url) {
    console.log(`[ModuleFix] Cargando ${moduleName} directamente desde ${url}`);
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Establecer timeout para detectar cargas lentas
      const timeoutId = setTimeout(() => {
        console.warn(`[ModuleFix] Timeout al cargar ${moduleName} desde ${url}`);
        document.head.removeChild(script);
        // Cargar desde fallback local
        loadLocalFallback(moduleName).then(resolve).catch(reject);
      }, 5000); // 5 segundos de timeout
      
      script.onload = () => {
        clearTimeout(timeoutId);
        console.log(`[ModuleFix] Módulo ${moduleName} cargado exitosamente desde URL directa`);
        window[`__${moduleName.replace(/[@\/\-]/g, '_')}__loaded`] = true;
        resolve(true);
      };
      
      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`[ModuleFix] Error al cargar ${moduleName} desde URL directa ${url}`);
        document.head.removeChild(script);
        // Intentar con fallback local
        loadLocalFallback(moduleName).then(resolve).catch(reject);
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Cargar módulo desde fallback local con URL absoluta
  function loadLocalFallback(moduleName) {
    const fallbackPath = getLocalFallbackUrl(moduleName);
    
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
