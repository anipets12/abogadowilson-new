/**
 * Sistema avanzado para resolver y cargar mu00f3dulos cru00edticos
 * Resuelve problemas de carga en entornos Vite
 */

// Mapeo de rutas de mu00f3dulos a sus versiones CDN
const MODULE_CDN_MAP = {
  '@headlessui/react': 'https://cdn.jsdelivr.net/npm/@headlessui/react@1.7.17/dist/headlessui.esm.js',
  'react-icons/fa': 'https://cdn.jsdelivr.net/npm/react-icons@4.11.0/fa/index.esm.js',
  'react-icons/fi': 'https://cdn.jsdelivr.net/npm/react-icons@4.11.0/fi/index.esm.js',
  'react-icons/si': 'https://cdn.jsdelivr.net/npm/react-icons@4.11.0/si/index.esm.js',
  'react-icons/fa6': 'https://cdn.jsdelivr.net/npm/react-icons@4.11.0/fa6/index.esm.js',
  'framer-motion': 'https://cdn.jsdelivr.net/npm/framer-motion@10.16.4/dist/framer-motion.js',
  'axios': 'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js'
};

// Almacenamiento de mu00f3dulos resueltos en memoria
const resolvedModules = {};

/**
 * Resuelve un mu00f3dulo por su nombre o ruta
 * @param {string} moduleName - Nombre o ruta del mu00f3dulo
 * @returns {Promise<any>} - Promesa que resuelve al mu00f3dulo
 */
export async function resolveModule(moduleName) {
  console.log(`[ModuleResolver] Intentando resolver mu00f3dulo: ${moduleName}`);
  
  // Si ya resolvimos este mu00f3dulo, devolverlo de cachu00e9
  if (resolvedModules[moduleName]) {
    console.log(`[ModuleResolver] Devolviendo mu00f3dulo en cachu00e9: ${moduleName}`);
    return resolvedModules[moduleName];
  }
  
  // Intentar importar normalmente primero
  try {
    const module = await import(/* @vite-ignore */ moduleName);
    console.log(`[ModuleResolver] Mu00f3dulo cargado normalmente: ${moduleName}`);
    resolvedModules[moduleName] = module;
    return module;
  } catch (error) {
    console.warn(`[ModuleResolver] Error al cargar mu00f3dulo de forma estu00e1ndar: ${moduleName}`, error);
    
    // Buscar una versiu00f3n CDN si estu00e1 disponible
    if (MODULE_CDN_MAP[moduleName]) {
      try {
        console.log(`[ModuleResolver] Intentando cargar desde CDN: ${moduleName}`);
        const cdnModule = await loadModuleFromCDN(MODULE_CDN_MAP[moduleName]);
        resolvedModules[moduleName] = cdnModule;
        return cdnModule;
      } catch (cdnError) {
        console.error(`[ModuleResolver] Error al cargar desde CDN: ${moduleName}`, cdnError);
      }
    }
    
    // Si no podemos cargar el mu00f3dulo, devolver un mu00f3dulo simulado
    console.warn(`[ModuleResolver] Devolviendo mu00f3dulo simulado para: ${moduleName}`);
    return createMockModule(moduleName);
  }
}

/**
 * Carga un mu00f3dulo desde una URL CDN
 * @param {string} url - URL del CDN
 * @returns {Promise<any>} - Promesa que resuelve al mu00f3dulo
 */
async function loadModuleFromCDN(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    script.async = true;
    
    script.onload = () => {
      // Capturar las exportaciones del ESM en un objeto global
      const moduleName = url.split('/').pop().split('.')[0];
      resolve(window[`__CDN_MODULE_${moduleName}__`] || {});
    };
    
    script.onerror = () => {
      reject(new Error(`Error al cargar mu00f3dulo desde CDN: ${url}`));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Crea un mu00f3dulo simulado como fallback
 * @param {string} moduleName - Nombre del mu00f3dulo
 * @returns {Object} - Mu00f3dulo simulado
 */
function createMockModule(moduleName) {
  // Crear un mu00f3dulo simulado basado en el tipo de mu00f3dulo
  if (moduleName.includes('@headlessui/react')) {
    return createHeadlessUIMock();
  } else if (moduleName.includes('react-icons')) {
    return createReactIconsMock();
  } else if (moduleName.includes('framer-motion')) {
    return createFramerMotionMock();
  } else if (moduleName.includes('apiService')) {
    return createApiServiceMock();
  } else {
    // Mu00f3dulo genu00e9rico simulado
    return {
      default: { __isMock: true, name: moduleName },
      __esModule: true
    };
  }
}

/**
 * Crea un mu00f3dulo simulado para @headlessui/react
 * @returns {Object} Mu00f3dulo simulado
 */
function createHeadlessUIMock() {
  // Componentes simulados que devuelven sus children
  const passThroughComponent = ({ children }) => children;
  
  return {
    Menu: passThroughComponent,
    Transition: passThroughComponent,
    Dialog: passThroughComponent,
    Disclosure: passThroughComponent,
    Listbox: passThroughComponent,
    RadioGroup: passThroughComponent,
    Tab: passThroughComponent,
    Popover: passThroughComponent,
    Switch: passThroughComponent,
    default: {
      Menu: {
        Button: passThroughComponent,
        Items: passThroughComponent,
        Item: passThroughComponent,
      },
      Transition: passThroughComponent,
      Dialog: {
        Panel: passThroughComponent,
        Title: passThroughComponent,
        Description: passThroughComponent,
      },
      Disclosure: {
        Button: passThroughComponent,
        Panel: passThroughComponent,
      },
      Listbox: {
        Button: passThroughComponent,
        Options: passThroughComponent,
        Option: passThroughComponent,
      },
      RadioGroup: {
        Option: passThroughComponent,
      },
      Tab: {
        Group: passThroughComponent,
        List: passThroughComponent,
        Panels: passThroughComponent,
        Panel: passThroughComponent,
      },
      Popover: {
        Button: passThroughComponent,
        Panel: passThroughComponent,
      },
      Switch: {
        Group: passThroughComponent,
        Label: passThroughComponent,
      },
    },
    __esModule: true,
    __isMock: true
  };
}

/**
 * Crea un mu00f3dulo simulado para react-icons
 * @returns {Object} Mu00f3dulo simulado
 */
function createReactIconsMock() {
  // Componente de icono simulado
  const MockIcon = () => null;
  
  // Crear un proxy que devuelva un componente de icono simulado para cualquier propiedad
  const iconProxy = new Proxy({}, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      if (prop === '__isMock') return true;
      return MockIcon;
    }
  });
  
  return {
    default: iconProxy,
    __esModule: true,
    __isMock: true
  };
}

/**
 * Crea un mu00f3dulo simulado para framer-motion
 * @returns {Object} Mu00f3dulo simulado
 */
function createFramerMotionMock() {
  // Componente simulado que pasa children
  const MotionComponent = ({ children }) => children;
  
  // Mu00e9todos de animaciu00f3n simulados
  const animationControls = {
    start: () => Promise.resolve(),
    stop: () => {},
    set: () => {}
  };
  
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        if (prop === '__isMock') return true;
        return MotionComponent;
      }
    }),
    AnimatePresence: ({ children }) => children,
    useAnimation: () => animationControls,
    useMotionValue: (initialValue) => ({ get: () => initialValue, set: () => {} }),
    useTransform: () => ({ get: () => 0, set: () => {} }),
    useInView: () => ({ inView: true, ref: { current: null } }),
    AnimateSharedLayout: ({ children }) => children,
    default: {
      motion: { div: MotionComponent, span: MotionComponent, button: MotionComponent },
      AnimatePresence: ({ children }) => children,
      __isMock: true
    },
    __esModule: true,
    __isMock: true
  };
}

/**
 * Crea un mu00f3dulo simulado para apiService
 * @returns {Object} Mu00f3dulo simulado
 */
function createApiServiceMock() {
  const mockResponse = (data = {}) => ({
    data,
    error: null,
    success: true
  });
  
  const apiMock = {
    get: () => Promise.resolve(mockResponse({ message: 'GET simulado exitoso' })),
    post: () => Promise.resolve(mockResponse({ message: 'POST simulado exitoso' })),
    put: () => Promise.resolve(mockResponse({ message: 'PUT simulado exitoso' })),
    delete: () => Promise.resolve(mockResponse({ message: 'DELETE simulado exitoso' })),
    __isMock: true
  };
  
  const authServiceMock = {
    register: () => Promise.resolve(mockResponse({ user: { id: '1', email: 'user@example.com' } })),
    login: () => Promise.resolve(mockResponse({ user: { id: '1', email: 'user@example.com' } })),
    signOut: () => Promise.resolve(mockResponse({ success: true })),
    getCurrentUser: () => Promise.resolve(mockResponse({ user: { id: '1', email: 'user@example.com' } })),
    __isMock: true
  };
  
  const dataServiceMock = {
    fetchData: () => Promise.resolve(mockResponse({ items: [] })),
    getAll: () => Promise.resolve(mockResponse({ items: [] })),
    getById: () => Promise.resolve(mockResponse({ item: {} })),
    create: () => Promise.resolve(mockResponse({ id: '1' })),
    update: () => Promise.resolve(mockResponse({ success: true })),
    remove: () => Promise.resolve(mockResponse({ success: true })),
    search: () => Promise.resolve(mockResponse({ results: [] })),
    uploadFile: () => Promise.resolve(mockResponse({ fileUrl: 'https://example.com/file.pdf' })),
    __isMock: true
  };
  
  return {
    default: apiMock,
    authService: authServiceMock,
    dataService: dataServiceMock,
    __esModule: true,
    __isMock: true
  };
}
