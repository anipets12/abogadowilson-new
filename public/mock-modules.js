/**
 * Implementaciu00f3n de mu00f3dulos simulados para evitar errores CORS
 * Esta soluciu00f3n crea implementaciones locales de bibliotecas problema
 */

(function() {
  console.log('[MockModules] Inicializando sistema de simulaciu00f3n de mu00f3dulos...');
  
  // Espacio global para mu00f3dulos
  window.__MOCK_MODULES__ = {};
  
  // Implementar @headlessui/react manualmente
  function createHeadlessUI() {
    console.log('[MockModules] Creando implementaciu00f3n de @headlessui/react');
    
    // Componente simple que renderiza sus hijos
    const PassthroughComponent = function(props) {
      return props.children || null;
    };
    
    // Crear componentes Headless UI
    const Menu = PassthroughComponent;
    Menu.Button = PassthroughComponent;
    Menu.Items = PassthroughComponent;
    Menu.Item = PassthroughComponent;
    
    const Dialog = PassthroughComponent;
    Dialog.Panel = PassthroughComponent;
    Dialog.Title = PassthroughComponent;
    Dialog.Description = PassthroughComponent;
    
    const Transition = PassthroughComponent;
    Transition.Child = PassthroughComponent;
    
    const Disclosure = PassthroughComponent;
    Disclosure.Button = PassthroughComponent;
    Disclosure.Panel = PassthroughComponent;
    
    const Listbox = PassthroughComponent;
    Listbox.Button = PassthroughComponent;
    Listbox.Options = PassthroughComponent;
    Listbox.Option = PassthroughComponent;
    
    const headlessUI = {
      Menu,
      Dialog,
      Transition,
      Disclosure,
      Listbox,
      Tab: PassthroughComponent,
      Popover: PassthroughComponent,
      RadioGroup: PassthroughComponent,
      Switch: PassthroughComponent,
      Combobox: PassthroughComponent,
      // Marcar como simulado
      __isMocked: true
    };
    
    // Exportaciones para importaciu00f3n con "import {...} from '@headlessui/react'"
    Object.keys(headlessUI).forEach(key => {
      headlessUI[key].__isMocked = true;
    });
    
    // Guardar en el espacio global
    window.__MOCK_MODULES__['@headlessui/react'] = headlessUI;
    
    return headlessUI;
  }
  
  // Implementar react-icons/fa manualmente
  function createReactIcons() {
    console.log('[MockModules] Creando implementaciu00f3n de react-icons');
    
    // Crear un icono simulado
    function MockIcon(props) {
      return {
        type: 'svg',
        props: Object.assign({}, props, {
          style: Object.assign({}, props?.style, {
            display: 'inline-block',
            width: '1em',
            height: '1em',
            verticalAlign: 'middle'
          })
        }),
        children: []
      };
    }
    
    // Criar iconos FA comunes
    const faIcons = new Proxy({}, {
      get: function(target, prop) {
        if (prop.startsWith('Fa')) {
          return MockIcon;
        }
        return undefined;
      }
    });
    
    // Icones FI
    const fiIcons = new Proxy({}, {
      get: function(target, prop) {
        if (prop.startsWith('Fi')) {
          return MockIcon;
        }
        return undefined;
      }
    });
    
    // Guardar en el espacio global
    window.__MOCK_MODULES__['react-icons/fa'] = faIcons;
    window.__MOCK_MODULES__['react-icons/fi'] = fiIcons;
    window.__MOCK_MODULES__['react-icons/si'] = new Proxy({}, {
      get: function(target, prop) {
        if (prop.startsWith('Si')) {
          return MockIcon;
        }
        return undefined;
      }
    });
    
    return {
      fa: faIcons,
      fi: fiIcons,
      __isMocked: true
    };
  }
  
  // Implementar @heroicons/react/24/outline manualmente
  function createHeroIcons() {
    console.log('[MockModules] Creando implementaciu00f3n de @heroicons/react');
    
    // Crear un icono simulado
    function MockHeroIcon(props) {
      return {
        type: 'svg',
        props: Object.assign({}, props, {
          style: Object.assign({}, props?.style, {
            display: 'inline-block',
            width: '1em',
            height: '1em',
            verticalAlign: 'middle'
          }),
          viewBox: '0 0 24 24'
        }),
        children: []
      };
    }
    
    // Crear un proxy para manejar cualquier nombre de icono
    const outlineIcons = new Proxy({}, {
      get: function(target, prop) {
        // Si es una propiedad interna de JavaScript, retornar undefined
        if (prop === 'then' || prop === 'catch' || prop === '__proto__') {
          return undefined;
        }
        return MockHeroIcon;
      }
    });
    
    const solidIcons = new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'then' || prop === 'catch' || prop === '__proto__') {
          return undefined;
        }
        return MockHeroIcon;
      }
    });
    
    // Guardar en el espacio global
    window.__MOCK_MODULES__['@heroicons/react/24/outline'] = outlineIcons;
    window.__MOCK_MODULES__['@heroicons/react/24/solid'] = solidIcons;
    
    return {
      outline: outlineIcons,
      solid: solidIcons,
      __isMocked: true
    };
  }
  
  // Implementar framer-motion manualmente
  function createFramerMotion() {
    console.log('[MockModules] Creando implementaciu00f3n de framer-motion');
    
    // Componente motion simulado
    function MotionComponent(props) {
      return props.children || null;
    }
    
    // Crear proxy para cualquier elemento HTML (motion.div, motion.span, etc.)
    const motion = new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'then' || prop === 'catch' || prop === '__proto__') {
          return undefined;
        }
        return MotionComponent;
      }
    });
    
    // Hooks simulados
    const useAnimation = function() {
      return {
        start: function() { return Promise.resolve(); },
        stop: function() {},
        set: function() {}
      };
    };
    
    const useMotionValue = function(initialValue) {
      return {
        get: function() { return initialValue; },
        set: function() {},
        subscribe: function() { return function() {}; },
        value: initialValue
      };
    };
    
    const useTransform = function(value, input, output) {
      return useMotionValue(0);
    };
    
    const useInView = function(options) {
      return { inView: true, ref: { current: null } };
    };
    
    // Componente AnimatePresence
    function AnimatePresence(props) {
      return props.children || null;
    }
    
    const framerMotion = {
      motion,
      AnimatePresence,
      useAnimation,
      useMotionValue,
      useTransform,
      useInView,
      // Marcar como simulado
      __isMocked: true
    };
    
    // Guardar en el espacio global
    window.__MOCK_MODULES__['framer-motion'] = framerMotion;
    
    return framerMotion;
  }
  
  // Redefinir import para interceptar mu00f3dulos problema
  const originalDynamicImport = window.import;
  window.import = function(modulePath) {
    // Verificar si es un mu00f3dulo que tenemos simulado
    const modulePathStr = modulePath.toString();
    
    // Resolver mu00f3dulos problema
    if (modulePathStr === '@headlessui/react') {
      console.log('[MockModules] Interceptando importación de @headlessui/react');
      if (!window.__MOCK_MODULES__['@headlessui/react']) {
        createHeadlessUI();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['@headlessui/react'],
        __esModule: true
      });
    } 
    else if (modulePathStr === 'react-icons/fa' || modulePathStr.startsWith('react-icons/fa/')) {
      console.log('[MockModules] Interceptando importación de react-icons/fa');
      if (!window.__MOCK_MODULES__['react-icons/fa']) {
        createReactIcons();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['react-icons/fa'],
        __esModule: true
      });
    }
    else if (modulePathStr === 'react-icons/fi') {
      console.log('[MockModules] Interceptando importación de react-icons/fi');
      if (!window.__MOCK_MODULES__['react-icons/fi']) {
        createReactIcons();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['react-icons/fi'],
        __esModule: true
      });
    }
    else if (modulePathStr === 'react-icons/si') {
      console.log('[MockModules] Interceptando importación de react-icons/si');
      if (!window.__MOCK_MODULES__['react-icons/si']) {
        createReactIcons();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['react-icons/si'],
        __esModule: true
      });
    }
    else if (modulePathStr === '@heroicons/react/24/outline') {
      console.log('[MockModules] Interceptando importación de @heroicons/react/24/outline');
      if (!window.__MOCK_MODULES__['@heroicons/react/24/outline']) {
        createHeroIcons();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['@heroicons/react/24/outline'],
        __esModule: true
      });
    }
    else if (modulePathStr === '@heroicons/react/24/solid') {
      console.log('[MockModules] Interceptando importación de @heroicons/react/24/solid');
      if (!window.__MOCK_MODULES__['@heroicons/react/24/solid']) {
        createHeroIcons();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['@heroicons/react/24/solid'],
        __esModule: true
      });
    }
    else if (modulePathStr === 'framer-motion') {
      console.log('[MockModules] Interceptando importación de framer-motion');
      if (!window.__MOCK_MODULES__['framer-motion']) {
        createFramerMotion();
      }
      return Promise.resolve({
        default: window.__MOCK_MODULES__['framer-motion'],
        __esModule: true
      });
    }
    
    // Usar import original para otros mu00f3dulos
    return originalDynamicImport.apply(this, arguments);
  };
  
  // Registrar resoluciu00f3n de mu00f3dulos para Vite
  if (window.__vite__resolveModuleMap) {
    Object.keys(window.__MOCK_MODULES__).forEach(moduleName => {
      window.__vite__resolveModuleMap[moduleName] = moduleName;
    });
  }
  
  // Inicializar mu00f3dulos simulados inmediatamente
  createHeadlessUI();
  createReactIcons();
  createHeroIcons();
  createFramerMotion();
  
  console.log('[MockModules] Sistema de simulaciu00f3n inicializado correctamente');
})();
