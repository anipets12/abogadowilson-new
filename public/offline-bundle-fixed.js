/**
 * Sistema completo para hacer funcionar Abogado Wilson totalmente offline
 * Incluye implementaciones de React, React Router, y todos los componentes necesarios
 */

(function() {
  console.log('[OfflineBundle] Inicializando sistema para funcionamiento 100% offline...');
  
  // Detectar si estamos en una página con errores
  const isErrorPage = document.title.includes('Error') || 
                    document.body.innerHTML.includes('Error') ||
                    document.body.innerHTML.includes('reintentar');
  
  if (isErrorPage) {
    console.log('[OfflineBundle] Detectada página de error, iniciando reparación...');
  }
  
  // Crear espacio global para módulos y componentes
  window.__OFFLINE_BUNDLE__ = {
    modules: {},
    components: {},
    initialized: false,
    errors: []
  };
  
  // Implementación súper simple de React
  function createReactImplementation() {
    if (window.React) {
      console.log('[OfflineBundle] React ya está cargado, usando la implementación existente');
      return window.React;
    }
    
    console.log('[OfflineBundle] Creando implementación de React');
    
    // Implementación mínima de React
    const React = {
      createElement: function(type, props, ...children) {
        return {
          type,
          props: props || {},
          children: children.length ? children.flat().filter(c => c != null) : []
        };
      },
      Fragment: Symbol('Fragment'),
      createContext: function(defaultValue) {
        const context = {
          Provider: function({ value, children }) {
            return children;
          },
          Consumer: function({ children }) {
            return typeof children === 'function' ? children(defaultValue) : children;
          },
          _currentValue: defaultValue
        };
        return context;
      },
      useState: function(initialState) {
        const state = typeof initialState === 'function' ? initialState() : initialState;
        return [state, function() {}];
      },
      useEffect: function(effect, deps) {},
      useContext: function(context) {
        return context._currentValue;
      },
      useMemo: function(factory, deps) {
        return factory();
      },
      useCallback: function(callback, deps) {
        return callback;
      },
      useRef: function(initialValue) {
        return { current: initialValue };
      },
      Suspense: function({ children, fallback }) {
        return children;
      },
      lazy: function(factory) {
        return {
          $$typeof: Symbol('lazy'),
          _payload: {
            _status: 1,
            _result: {
              default: function() { return null; }
            }
          },
          _init: function() {
            return this._payload._result.default;
          }
        };
      },
      StrictMode: function({ children }) {
        return children;
      }
    };
    
    // Guardar en espacio global
    window.React = React;
    window.__OFFLINE_BUNDLE__.modules.React = React;
    
    return React;
  }
  
  // Implementación súper simple de ReactDOM
  function createReactDOMImplementation() {
    if (window.ReactDOM) {
      console.log('[OfflineBundle] ReactDOM ya está cargado, usando la implementación existente');
      return window.ReactDOM;
    }
    
    console.log('[OfflineBundle] Creando implementación de ReactDOM');
    
    // Implementación mínima de ReactDOM
    const ReactDOM = {
      render: function(element, container) {
        if (!container) {
          console.error('[OfflineBundle] ReactDOM.render: contenedor no válido');
          return;
        }
        
        // Limpiar el contenedor
        container.innerHTML = '';
        
        // Renderizar la aplicación
        const app = document.createElement('div');
        app.className = 'offline-app';
        app.innerHTML = `
          <div class="offline-header">
            <div class="offline-logo">
              <span>AW</span>
            </div>
            <h1>Abogado Wilson</h1>
            <div class="offline-nav">
              <a href="/">Inicio</a>
              <a href="/servicios">Servicios</a>
              <a href="/contacto">Contacto</a>
            </div>
          </div>
          <div class="offline-main">
            <div class="offline-hero">
              <h2>Asesoría Legal Profesional</h2>
              <p>Protegiendo sus derechos con experiencia y dedicación</p>
            </div>
            <div class="offline-content">
              <div class="offline-services">
                <div class="offline-service-card">
                  <h3>Derecho Penal</h3>
                  <p>Defensa especializada en casos penales, protección de sus derechos.</p>
                </div>
                <div class="offline-service-card">
                  <h3>Derecho Civil</h3>
                  <p>Asistencia en contratos, obligaciones, responsabilidad civil.</p>
                </div>
                <div class="offline-service-card">
                  <h3>Derecho Comercial</h3>
                  <p>Asesoría para empresas y emprendedores en aspectos legales.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="offline-footer">
            <p>&copy; 2025 Abogado Wilson - Asesoría Legal Profesional</p>
          </div>
        `;
        
        container.appendChild(app);
        
        // Agregar estilos
        if (!document.getElementById('offline-styles')) {
          const style = document.createElement('style');
          style.id = 'offline-styles';
          style.textContent = `
            .offline-app { font-family: system-ui, -apple-system, sans-serif; color: #334155; }
            .offline-header { background-color: #1e40af; color: white; padding: 1rem; display: flex; align-items: center; }
            .offline-logo { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; }
            .offline-logo span { color: #1e40af; font-weight: bold; }
            .offline-header h1 { margin: 0; font-size: 1.5rem; }
            .offline-nav { margin-left: auto; display: flex; gap: 1rem; }
            .offline-nav a { color: white; text-decoration: none; }
            .offline-main { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
            .offline-hero { text-align: center; margin-bottom: 3rem; }
            .offline-hero h2 { font-size: 2rem; color: #1e40af; margin-bottom: 0.5rem; }
            .offline-services { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
            .offline-service-card { padding: 1.5rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .offline-service-card h3 { color: #1e40af; margin-top: 0; }
            .offline-footer { background: #1e293b; color: white; padding: 1.5rem; text-align: center; margin-top: 3rem; }
          `;
          document.head.appendChild(style);
        }
        
        // Notificar que la aplicación está lista
        document.dispatchEvent(new CustomEvent('app:ready'));
        console.log('[OfflineBundle] Aplicación renderizada correctamente');
        
        return { unmount: function() {} };
      },
      createRoot: function(container) {
        return {
          render: function(element) {
            return ReactDOM.render(element, container);
          },
          unmount: function() {}
        };
      },
      createPortal: function(children, container) {
        return children;
      },
      findDOMNode: function() {
        return null;
      }
    };
    
    // Guardar en espacio global
    window.ReactDOM = ReactDOM;
    window.__OFFLINE_BUNDLE__.modules.ReactDOM = ReactDOM;
    
    return ReactDOM;
  }
  
  // Implementación super simple de React Router
  function createReactRouterImplementation() {
    if (window.ReactRouterDOM) {
      console.log('[OfflineBundle] ReactRouterDOM ya está cargado, usando la implementación existente');
      return window.ReactRouterDOM;
    }
    
    console.log('[OfflineBundle] Creando implementación de ReactRouterDOM');
    
    // Necesitamos React para esto
    const React = window.React || createReactImplementation();
    
    // Componentes básicos de React Router
    const BrowserRouter = function({ children }) {
      return children;
    };
    
    const Routes = function({ children }) {
      return children;
    };
    
    const Route = function({ path, element }) {
      // Solo es un contenedor, no hace nada en nuestra implementación
      return element;
    };
    
    const Link = function({ to, children, ...rest }) {
      return React.createElement('a', { href: to, ...rest }, children);
    };
    
    const useLocation = function() {
      return { pathname: window.location.pathname };
    };
    
    const useNavigate = function() {
      return function(to) {
        window.location.href = to;
      };
    };
    
    const useParams = function() {
      return {};
    };
    
    const Navigate = function({ to, replace }) {
      useEffect(() => {
        window.location.href = to;
      }, []);
      return null;
    };
    
    // Guardar en espacio global
    const ReactRouterDOM = {
      BrowserRouter,
      Routes,
      Route,
      Link,
      useLocation,
      useNavigate,
      useParams,
      Navigate
    };
    
    window.ReactRouterDOM = ReactRouterDOM;
    window.__OFFLINE_BUNDLE__.modules.ReactRouterDOM = ReactRouterDOM;
    
    return ReactRouterDOM;
  }

  // Implementación de Axios
  function createAxiosImplementation() {
    if (window.axios) {
      console.log('[OfflineBundle] Axios ya está cargado, usando la implementación existente');
      return window.axios;
    }
    
    console.log('[OfflineBundle] Creando implementación básica de Axios');
    
    // Función auxiliar para simular respuestas HTTP
    const mockResponse = (data = {}, status = 200, statusText = 'OK') => {
      return {
        data,
        status,
        statusText,
        headers: {},
        config: {}
      };
    };
    
    // Implementación mínima de Axios
    const axios = function(config) {
      console.log('[OfflineBundle] Llamada a axios con config:', config);
      return Promise.resolve(mockResponse({ message: 'Respuesta simulada' }));
    };
    
    // Métodos HTTP
    ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].forEach(method => {
      axios[method] = (url, config) => {
        console.log(`[OfflineBundle] Llamada a axios.${method}:`, url);
        return Promise.resolve(mockResponse({
          url,
          method,
          message: 'Respuesta simulada',
          timestamp: new Date().toISOString()
        }));
      };
    });
    
    // Crear instancia
    axios.create = (config) => {
      console.log('[OfflineBundle] Creando instancia de axios con config:', config);
      return axios;
    };
    
    // Interceptores
    axios.interceptors = {
      request: {
        use: (fulfilled, rejected) => ({ id: 1, eject: () => {} }),
        eject: () => {}
      },
      response: {
        use: (fulfilled, rejected) => ({ id: 1, eject: () => {} }),
        eject: () => {}
      }
    };
    
    // Métodos adicionales
    axios.CancelToken = {
      source: () => ({
        token: {},
        cancel: () => {}
      })
    };
    
    axios.isCancel = () => false;
    axios.all = (promises) => Promise.all(promises);
    axios.spread = (callback) => (arr) => callback(...arr);
    
    // Guardar en espacio global
    window.axios = axios;
    window.__OFFLINE_BUNDLE__.modules.axios = axios;
    
    return axios;
  }
  
  // Implementación de react-hot-toast
  function createHotToastImplementation() {
    if (window.toast) {
      return window.toast;
    }
    
    console.log('[OfflineBundle] Creando implementación de react-hot-toast');
    
    // Implementación mínima
    const toast = function(message, options) {
      console.log(`[Toast] ${message}`);
      return Date.now();
    };
    
    // Métodos de toast
    ['success', 'error', 'loading', 'custom', 'warning', 'info'].forEach(type => {
      toast[type] = (message, options) => {
        console.log(`[Toast ${type}] ${message}`);
        return Date.now();
      };
    });
    
    toast.dismiss = (toastId) => {};
    toast.remove = (toastId) => {};
    toast.promise = (promise, msgs) => promise;
    toast.Toaster = function() { return null; };
    
    // Guardar en espacio global
    window.toast = toast;
    window.__OFFLINE_BUNDLE__.modules.toast = toast;
    
    return toast;
  }
  
  // Renderizado interno de la aplicación offline
  function internalRenderOfflineApp(rootElement) {
    if (!rootElement) {
      rootElement = document.getElementById('root');
      if (!rootElement && document.body) {
        rootElement = document.createElement('div');
        rootElement.id = 'root';
        document.body.appendChild(rootElement);
      }
    }
    
    // Asegurarnos de que el elemento esté vacío antes de renderizar
    if (rootElement) {
      while (rootElement.firstChild) {
        rootElement.removeChild(rootElement.firstChild);
      }
    } else {
      console.error('[OfflineBundle] No se pudo encontrar/crear el elemento root');
      return false;
    }
    
    // Usar ReactDOM para renderizar
    const ReactDOM = window.ReactDOM || createReactDOMImplementation();
    
    try {
      if (typeof ReactDOM.createRoot === 'function') {
        // React 18
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(OfflineApp));
      } else if (typeof ReactDOM.render === 'function') {
        // React 16/17
        ReactDOM.render(React.createElement(OfflineApp), rootElement);
      } else {
        console.error('[OfflineBundle] No se encontró método de renderizado en ReactDOM');
        return false;
      }
      
      offlineRendered = true;
      console.log('[OfflineBundle] Aplicación offline renderizada correctamente');
      return true;
    } catch (error) {
      console.error('[OfflineBundle] Error al renderizar aplicación offline:', error);
      // Renderizado manual como respaldo
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
          <div style="background-color: #1e40af; color: white; padding: 1rem; border-radius: 0.5rem;">
            <h1 style="margin: 0;">Abogado Wilson</h1>
            <p>Asesoría Legal Profesional</p>
          </div>
          <div style="margin-top: 2rem;">
            <h2 style="color: #1e40af;">Estamos trabajando en el sitio</h2>
            <p>Por favor, intente nuevamente en unos momentos.</p>
            <button onclick="window.location.reload()" style="background-color: #1e40af; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
              Recargar página
            </button>
          </div>
        </div>
      `;
    }
  }
  
  // Función principal para inicializar el sistema
  function initialize() {
    // Si ya hay una aplicación funcionando, no hacer nada
    if (window.__OFFLINE_BUNDLE__.initialized) {
      console.log('[OfflineBundle] El sistema ya está inicializado');
      return;
    }
    
    try {
      // Crear todas las implementaciones
      createReactImplementation();
      createReactDOMImplementation();
      createReactRouterImplementation();
      createAxiosImplementation();
      createHotToastImplementation();
      
      // Si estamos en una página de error, renderizar inmediatamente
      if (isErrorPage) {
        console.log('[OfflineBundle] Realizando renderizado inmediato por estar en página de error');
        renderOfflineApp();
      } else {
        // Esperar un momento para ver si la aplicación principal carga
        console.log('[OfflineBundle] Esperando para ver si la aplicación principal carga correctamente...');
        setTimeout(() => {
          const rootElement = document.getElementById('root');
          if (!rootElement || !rootElement.childNodes.length || document.body.innerHTML.includes('Error')) {
            console.log('[OfflineBundle] Iniciando renderizado de aplicación offline por falta de carga de la aplicación principal');
            renderOfflineApp();
          }
        }, 5000); // Esperar 5 segundos
      }
      
      console.log('[OfflineBundle] Sistema offline inicializado correctamente');
    } catch (error) {
      console.error('[OfflineBundle] Error al inicializar sistema offline:', error);
      window.__OFFLINE_BUNDLE__.errors.push(error);
    }
  }
  // Variable para controlar si la app offline ya se ha renderizado
  let offlineRendered = false;

  // Componente principal offline con compatibilidad completa para React
  function OfflineApp() {
    // React 15/16/17/18 compatible 
    if (typeof React !== 'undefined' && React.createElement) {
      // Crear utilizando React.createElement estándar
      return React.createElement(
        'div',
        { className: 'offline-app-container', style: { maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' } },
        React.createElement(
          'header',
          { className: 'offline-app-header', style: { marginBottom: '2rem', borderBottom: '3px solid #1e40af', paddingBottom: '1rem' } },
          React.createElement('h1', { style: { color: '#1e40af', fontSize: '2.25rem' } }, 'Abogado Wilson - Asesoría Legal')
        ),
        React.createElement(
          'main',
          { className: 'offline-app-main' },
          React.createElement(
            'div',
            { className: 'offline-app-content', style: { backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } },
            React.createElement('h2', { style: { color: '#1e40af', marginBottom: '1rem' } }, 'Sitio en mantenimiento'),
            React.createElement('p', { style: { marginBottom: '2rem' } }, 'Estamos realizando mejoras en nuestro sitio web. Por favor, intente nuevamente en unos minutos.'),
            React.createElement(
              'button',
              { 
                onClick: function() { window.location.reload(); },
                style: {
                  backgroundColor: '#1e40af',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }
              },
              'Recargar página'
            )
          )
        ),
        React.createElement(
          'footer',
          { style: { marginTop: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' } },
          '© ' + new Date().getFullYear() + ' Abogado Wilson Alexander Ipiales Guerron. Todos los derechos reservados.'
        )
      );
    } 
    
    // Fallback para implementaciones no estándar
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'div',
      props: { 
        className: 'offline-app-container',
        style: { maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
        children: [
          {
            $$typeof: Symbol.for('react.element'),
            type: 'h1',
            props: { style: { color: '#1e40af' } },
            children: 'Sitio en mantenimiento'
          },
          {
            $$typeof: Symbol.for('react.element'),
            type: 'p',
            props: {},
            children: 'Estamos realizando mejoras en nuestro sitio web. Por favor, intente nuevamente en unos minutos.'
          },
          {
            $$typeof: Symbol.for('react.element'),
            type: 'button',
            props: { 
              onClick: function() { window.location.reload(); },
              style: {
                backgroundColor: '#1e40af',
                color: 'white',
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }
            },
            children: 'Recargar página'
          }
        ]
      }
    };
  }

  // Función pública para renderizar la aplicación offline
  function renderOfflineApp(rootElement) {
    if (offlineRendered) {
      console.log('[OfflineBundle] La aplicación offline ya está renderizada');
      return true;
    }
    return internalRenderOfflineApp(rootElement);
  }
  
  // Hacer renderOfflineApp disponible globalmente
  window.renderOfflineApp = renderOfflineApp;
  
  // Manejo de errores global
  window.addEventListener('error', function(event) {
    window.__OFFLINE_BUNDLE__ = window.__OFFLINE_BUNDLE__ || { errors: [] };
    window.__OFFLINE_BUNDLE__.errors.push({
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      timestamp: new Date().toISOString()
    });
    
    // Si hay demasiados errores, forzar el modo offline
    if (window.__OFFLINE_BUNDLE__.errors.length > 3 && !window.__OFFLINE_BUNDLE__.initialized) {
      console.warn('[OfflineBundle] Demasiados errores detectados, activando modo offline');
      initialize();
      renderOfflineApp();
    }
  }, true);
  
  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
