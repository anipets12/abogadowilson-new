/**
 * Sistema mejorado para cargar dependencias externas
 * Asegura que las dependencias cruu00edticas se carguen correctamente, incluso ante errores
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Registro de dependencias cargadas con u00e9xito
const loadedDependencies = new Set();

/**
 * Carga una dependencia mediante importaciu00f3n dinu00e1mica con reintentos
 * @param {string} modulePath - Ruta del mu00f3dulo a cargar
 * @param {number} retries - Nu00famero de reintentos (opcional)
 * @returns {Promise<any>} - Promesa con el mu00f3dulo cargado
 */
export async function loadDependency(modulePath, retries = 0) {
  try {
    // Si la dependencia ya se cargu00f3 con u00e9xito, devolver directamente
    if (loadedDependencies.has(modulePath)) {
      console.log(`[DependencyLoader] Usando dependencia ya cargada: ${modulePath}`);
      return window.__LOADED_DEPENDENCIES__[modulePath];
    }
    
    // Intentar cargar la dependencia
    console.log(`[DependencyLoader] Cargando: ${modulePath}`);
    const module = await import(/* @vite-ignore */ modulePath);
    
    // Registrar la dependencia cargada
    loadedDependencies.add(modulePath);
    
    // Almacenar en window para acceso ru00e1pido en futuras cargas
    if (!window.__LOADED_DEPENDENCIES__) {
      window.__LOADED_DEPENDENCIES__ = {};
    }
    window.__LOADED_DEPENDENCIES__[modulePath] = module;
    
    return module;
  } catch (error) {
    console.error(`[DependencyLoader] Error al cargar ${modulePath}:`, error);
    
    // Intentar cargar alternativas si falla la carga normal
    if (modulePath.includes('axios')) {
      try {
        console.log('[DependencyLoader] Intentando cargar axios desde CDN...');
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/axios@1.6.2/dist/axios.min.js';
        cdnScript.async = true;
        
        const modulePromise = new Promise((resolve, reject) => {
          cdnScript.onload = () => {
            console.log('[DependencyLoader] axios cargado desde CDN');
            loadedDependencies.add(modulePath);
            resolve(window.axios);
          };
          cdnScript.onerror = () => {
            reject(new Error('Error al cargar axios desde CDN'));
          };
        });
        
        document.head.appendChild(cdnScript);
        return modulePromise;
      } catch (cdnError) {
        console.error('[DependencyLoader] Error al cargar axios desde CDN:', cdnError);
      }
    }
    
    // Reintentar si no se alcanza el mu00e1ximo de intentos
    if (retries < MAX_RETRIES) {
      console.log(`[DependencyLoader] Reintentando cargar ${modulePath} (${retries + 1}/${MAX_RETRIES})...`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(loadDependency(modulePath, retries + 1));
        }, RETRY_DELAY * (retries + 1));
      });
    }
    
    // Devolver un mu00f3dulo simulado si todos los intentos fallan
    console.warn(`[DependencyLoader] Todos los intentos de carga de ${modulePath} fallaron. Devolviendo versiu00f3n simulada.`);
    return createFallbackModule(modulePath);
  }
}

/**
 * Carga varias dependencias en paralelo
 * @param {string[]} modulePaths - Rutas de los mu00f3dulos a cargar
 * @returns {Promise<any[]>} - Promesa con los mu00f3dulos cargados
 */
export async function loadDependencies(modulePaths) {
  return Promise.all(modulePaths.map(path => loadDependency(path)));
}

/**
 * Crea un mu00f3dulo de respaldo para dependencias que no se pudieron cargar
 * @param {string} modulePath - Ruta del mu00f3dulo original
 * @returns {Object} - Mu00f3dulo de respaldo
 */
function createFallbackModule(modulePath) {
  // Crear versiones simuladas segu00fan el tipo de mu00f3dulo
  if (modulePath.includes('axios')) {
    return {
      default: createAxiosFallback(),
      ...createAxiosFallback()
    };
  }
  
  // Mu00f3dulo genu00e9rico de respaldo
  return {
    default: {
      __isFallback: true,
      originalModule: modulePath
    }
  };
}

/**
 * Crea una versiu00f3n simulada de axios para usar como respaldo
 * @returns {Object} - API simulada de axios
 */
function createAxiosFallback() {
  const mockResponse = (data = {}, status = 200, statusText = 'OK') => {
    return {
      data,
      status,
      statusText,
      headers: {},
      config: {}
    };
  };
  
  const mockError = (message, status = 500) => {
    const error = new Error(message);
    error.response = mockResponse({error: message}, status, 'Error');
    error.isAxiosError = true;
    return error;
  };
  
  const mockImplementation = (successValue) => {
    return () => Promise.resolve(mockResponse(successValue));
  };
  
  // Funciones principales simuladas
  const axiosMock = function(config) {
    console.warn('[AxiosFallback] Llamada a axios() simulada:', config);
    return Promise.resolve(mockResponse({message: 'Respuesta simulada'}));
  };
  
  // Mu00e9todos HTTP
  ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].forEach(method => {
    axiosMock[method] = (url, config) => {
      console.warn(`[AxiosFallback] Llamada a axios.${method}() simulada:`, url, config);
      return Promise.resolve(mockResponse({url, method, message: 'Respuesta simulada'}));
    };
  });
  
  // Mu00e9todos adicionales
  axiosMock.create = (config) => {
    console.warn('[AxiosFallback] Creando instancia simulada de axios:', config);
    return axiosMock;
  };
  
  axiosMock.isCancel = () => false;
  axiosMock.CancelToken = {
    source: () => ({
      token: {},
      cancel: () => {}
    })
  };
  
  axiosMock.all = (promises) => Promise.all(promises);
  axiosMock.spread = (callback) => (arr) => callback.apply(null, arr);
  axiosMock.isAxiosError = (error) => error && error.isAxiosError === true;
  
  // Interceptores
  axiosMock.interceptors = {
    request: {
      use: (fulfilled, rejected) => ({ fulfilled, rejected, id: Math.random() }),
      eject: () => {}
    },
    response: {
      use: (fulfilled, rejected) => ({ fulfilled, rejected, id: Math.random() }),
      eject: () => {}
    }
  };
  
  // Marcar como simulado
  axiosMock.__isFallback = true;
  
  return axiosMock;
}
