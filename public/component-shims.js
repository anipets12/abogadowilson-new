/**
 * Componentes simulados para garantizar que la aplicación no falle
 * cuando hay problemas de carga de módulos específicos
 */

(function() {
  console.log('[ComponentShims] Inicializando componentes de respaldo');

  // Espacio global para nuestros componentes simulados
  window.__COMPONENT_SHIMS__ = {
    initialized: false,
    components: {}
  };

  // Esperar a que React esté disponible
  function waitForReact(callback, attempts = 0) {
    if (window.React) {
      callback(window.React);
      return;
    }
    
    if (attempts > 50) {
      console.error('[ComponentShims] React no disponible después de múltiples intentos');
      return;
    }
    
    console.log('[ComponentShims] Esperando que React esté disponible...');
    setTimeout(() => waitForReact(callback, attempts + 1), 100);
  }

  // Crear componentes simulados una vez que React esté disponible
  waitForReact(React => {
    console.log('[ComponentShims] React disponible, creando componentes simulados');
    
    // Simulación básica de AuthContext
    const AuthContext = React.createContext({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      register: () => Promise.resolve()
    });
    
    // Hook useAuth simulado
    const useAuth = () => React.useContext(AuthContext);
    
    // Proveedor de AuthContext simulado
    const AuthProvider = ({ children }) => {
      return React.createElement(
        AuthContext.Provider,
        { value: {
          user: null,
          isAuthenticated: false,
          loading: false,
          login: () => Promise.resolve(),
          logout: () => Promise.resolve(),
          register: () => Promise.resolve()
        }},
        children
      );
    };
    
    // Navbar simulada
    const Navbar = () => {
      return React.createElement(
        'header',
        { 
          className: 'bg-blue-900 text-white p-4 shadow-md',
          style: { position: 'sticky', top: 0, zIndex: 10 }
        },
        React.createElement(
          'div',
          { className: 'container mx-auto flex justify-between items-center' },
          React.createElement(
            'div',
            { className: 'flex items-center' },
            React.createElement(
              'span',
              { className: 'font-bold text-xl mr-2' },
              'AW'
            ),
            React.createElement(
              'h1',
              { className: 'text-lg font-semibold' },
              'Abogado Wilson'
            )
          ),
          React.createElement(
            'nav',
            { className: 'hidden md:flex space-x-4' },
            React.createElement('a', { href: '/', className: 'hover:underline' }, 'Inicio'),
            React.createElement('a', { href: '/servicios', className: 'hover:underline' }, 'Servicios'),
            React.createElement('a', { href: '/consulta', className: 'hover:underline' }, 'Consultas'),
            React.createElement('a', { href: '/contacto', className: 'hover:underline' }, 'Contacto')
          ),
          React.createElement(
            'div',
            { className: 'md:hidden' },
            React.createElement(
              'button',
              { className: 'p-2' },
              'Menú'
            )
          )
        )
      );
    };
    
    // Footer simulado
    const Footer = () => {
      return React.createElement(
        'footer',
        { className: 'bg-gray-800 text-white p-6 mt-10' },
        React.createElement(
          'div',
          { className: 'container mx-auto' },
          React.createElement(
            'div',
            { className: 'flex flex-col md:flex-row justify-between' },
            React.createElement(
              'div',
              { className: 'mb-4 md:mb-0' },
              React.createElement('h3', { className: 'font-bold text-xl mb-2' }, 'Abogado Wilson'),
              React.createElement('p', null, 'Asesoría legal profesional')
            ),
            React.createElement(
              'div',
              null,
              React.createElement('h4', { className: 'font-semibold mb-2' }, 'Contacto'),
              React.createElement('p', null, 'Email: contacto@abogadowilson.com'),
              React.createElement('p', null, 'Teléfono: +593 123 4567')
            )
          ),
          React.createElement(
            'div',
            { className: 'border-t border-gray-700 mt-6 pt-4 text-center' },
            '© 2025 Abogado Wilson. Todos los derechos reservados.'
          )
        )
      );
    };

    // Registrar componentes simulados
    window.__COMPONENT_SHIMS__.components = {
      Navbar,
      Footer,
      AuthContext,
      AuthProvider,
      useAuth
    };
    
    window.__COMPONENT_SHIMS__.initialized = true;
    console.log('[ComponentShims] Componentes simulados inicializados correctamente');
    
    // Intentar reparar los imports dinámicos si el método está disponible
    if (window.import || window.importShim) {
      patchImports();
    }
  });

  // Parchear sistema de importaciones dinámicas para usar nuestros componentes
  function patchImports() {
    // Guardar referencia original
    const originalImport = window.importShim || window.import;
    
    // Función de reemplazo
    const patchedImport = function(specifier) {
      // Para los componentes específicos que fallan
      if (specifier.includes('/components/Navigation/Navbar')) {
        console.log('[ComponentShims] Interceptando importación de Navbar');
        return Promise.resolve({
          default: window.__COMPONENT_SHIMS__.components.Navbar,
          __esModule: true
        });
      }
      
      if (specifier.includes('/components/Footer/Footer')) {
        console.log('[ComponentShims] Interceptando importación de Footer');
        return Promise.resolve({
          default: window.__COMPONENT_SHIMS__.components.Footer,
          __esModule: true
        });
      }
      
      if (specifier.includes('/context/AuthContext')) {
        console.log('[ComponentShims] Interceptando importación de AuthContext');
        return Promise.resolve({
          default: window.__COMPONENT_SHIMS__.components.AuthContext,
          AuthProvider: window.__COMPONENT_SHIMS__.components.AuthProvider,
          useAuth: window.__COMPONENT_SHIMS__.components.useAuth,
          __esModule: true
        });
      }
      
      // Si no es uno de nuestros componentes simulados, usar el import original
      return originalImport(specifier).catch(error => {
        console.warn(`[ComponentShims] Error al importar ${specifier}:`, error);
        
        // Si es un componente pero no tenemos simulación específica
        if (specifier.includes('/components/') || specifier.includes('/context/')) {
          const componentName = specifier.split('/').pop().replace('.jsx', '');
          console.log(`[ComponentShims] Proporcionando componente genérico para: ${componentName}`);
          
          // Crear un componente genérico
          const GenericComponent = window.React ? 
            window.React.createElement('div', { 
              className: 'loading-shim' 
            }, `[${componentName} - Cargando...]`) : 
            {};
          
          return Promise.resolve({
            default: () => GenericComponent,
            __esModule: true
          });
        }
        
        // Para cualquier otro error, reenviar
        return Promise.reject(error);
      });
    };
    
    // Reemplazar la función global
    window.import = window.importShim = patchedImport;
    console.log('[ComponentShims] Sistema de importaciones parcheado');
  }
})();
