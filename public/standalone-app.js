/**
 * Aplicaciu00f3n independiente de Abogado Wilson
 * Esta versiu00f3n de la aplicaciu00f3n funcionara independientemente de los problemas de Vite
 */

(function() {
  console.log('[StandaloneApp] Inicializando aplicaciu00f3n independiente...');
  
  // Detectar si estamos en una pu00e1gina de error
  function isErrorPage() {
    return document.title.includes('Error') || 
           document.body.innerHTML.includes('Error cru00edtico') ||
           document.body.innerHTML.includes('No se pudo inicializar');
  }
  
  // Cargar los scripts de React desde CDN
  function loadReactLibraries() {
    return new Promise((resolve) => {
      // Si ya tenemos React y ReactDOM, no necesitamos cargarlos de nuevo
      if (window.React && window.ReactDOM && window.ReactRouterDOM) {
        console.log('[StandaloneApp] React ya está cargado');
        return resolve();
      }
      
      console.log('[StandaloneApp] Cargando React desde CDN...');
      
      // Lista de bibliotecas críticas a cargar
      const libraries = [
        { name: 'React', url: 'https://unpkg.com/react@18/umd/react.production.min.js' },
        { name: 'ReactDOM', url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js' },
        { name: 'ReactRouter', url: 'https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js' },
        { name: 'ReactHotToast', url: 'https://cdn.jsdelivr.net/npm/react-hot-toast@2.4.1/dist/react-hot-toast.min.js' },
        { name: 'Axios', url: 'https://cdn.jsdelivr.net/npm/axios@1.6.2/dist/axios.min.js' }
      ];
      
      let loadedCount = 0;
      const totalLibraries = libraries.length;
      
      // Cargar cada biblioteca
      libraries.forEach(lib => {
        const script = document.createElement('script');
        script.src = lib.url;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          console.log(`[StandaloneApp] Cargado ${lib.name} correctamente`);
          loadedCount++;
          
          if (loadedCount === totalLibraries) {
            console.log('[StandaloneApp] Todas las bibliotecas cargadas correctamente');
            // Esperar un momento para que todo se inicialice correctamente
            setTimeout(resolve, 800);
          }
        };
        
        script.onerror = (error) => {
          console.error(`[StandaloneApp] Error al cargar ${lib.name}:`, error);
          loadedCount++;
          
          if (loadedCount === totalLibraries) {
            console.warn('[StandaloneApp] Algunas bibliotecas fallaron, pero continuamos');
            setTimeout(resolve, 800);
          }
        };
        
        document.head.appendChild(script);
      });
    });
  }
  
  // Crear o asegurar que existe un elemento root
  function ensureRootElement() {
    let rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.log('[StandaloneApp] Creando elemento root');
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    } else {
      // Limpiar cualquier contenido existente de error
      if (rootElement.innerHTML.includes('Error') || rootElement.innerHTML.includes('reintentar')) {
        rootElement.innerHTML = '';
      }
    }
    
    return rootElement;
  }
  
  // Cargar estilos mu00ednimos para la aplicaciu00f3n
  function loadStyles() {
    const style = document.createElement('style');
    style.textContent = `
      body, html { margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f9fafb; }
      .app-container { display: flex; flex-direction: column; min-height: 100vh; }
      .app-header { background-color: #1e40af; color: white; padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .app-header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; width: 100%; }
      .app-logo { font-size: 1.5rem; font-weight: bold; display: flex; align-items: center; }
      .app-logo-icon { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; color: #1e40af; font-weight: bold; }
      .app-navigation { display: flex; gap: 1.5rem; }
      .app-navigation a { color: white; text-decoration: none; padding: 0.5rem; }
      .app-navigation a:hover { text-decoration: underline; }
      .app-main { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
      .app-footer { background-color: #1e293b; color: white; padding: 2rem; }
      .app-footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
      .app-home-hero { background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3'); background-size: cover; background-position: center; color: white; padding: 6rem 2rem; text-align: center; }
      .app-home-hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
      .app-home-hero p { font-size: 1.2rem; max-width: 600px; margin: 0 auto 2rem; }
      .app-button { display: inline-block; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: background-color 0.3s; }
      .app-button:hover { background-color: #1d4ed8; }
      .app-services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
      .app-service-card { background-color: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
      .app-service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
      .app-service-image { height: 200px; background-color: #e5e7eb; }
      .app-service-content { padding: 1.5rem; }
      .app-service-title { margin-top: 0; color: #1e40af; }
      .app-contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
    `;
    document.head.appendChild(style);
  }
  
  // Renderizar la aplicaciu00f3n sin depender de archivos externos
  function renderStandaloneApp() {
    const rootElement = ensureRootElement();
    
    // Asegurarnos de que React y ReactDOM estu00e1n disponibles
    if (!window.React || !window.ReactDOM || !window.ReactRouterDOM) {
      console.error('[StandaloneApp] React, ReactDOM o ReactRouterDOM no disponibles');
      return;
    }
    
    const { BrowserRouter, Routes, Route, Link } = window.ReactRouterDOM;
    
    // Componentes principales
    const Header = () => {
      return React.createElement('header', { className: 'app-header' },
        React.createElement('div', { className: 'app-header-content' },
          React.createElement('div', { className: 'app-logo' },
            React.createElement('span', { className: 'app-logo-icon' }, 'AW'),
            'Abogado Wilson'
          ),
          React.createElement('nav', { className: 'app-navigation' },
            React.createElement(Link, { to: '/' }, 'Inicio'),
            React.createElement(Link, { to: '/servicios' }, 'Servicios'),
            React.createElement(Link, { to: '/sobre-mi' }, 'Sobre Mu00ed'),
            React.createElement(Link, { to: '/contacto' }, 'Contacto')
          )
        )
      );
    };
    
    const Footer = () => {
      return React.createElement('footer', { className: 'app-footer' },
        React.createElement('div', { className: 'app-footer-content' },
          React.createElement('div', null,
            React.createElement('h3', null, 'Abogado Wilson'),
            React.createElement('p', null, 'Asesoru00eda legal profesional con experiencia y dedicaciu00f3n.')
          ),
          React.createElement('div', null,
            React.createElement('h3', null, 'Contacto'),
            React.createElement('p', null, 'Email: contacto@abogadowilson.com'),
            React.createElement('p', null, 'Telu00e9fono: (123) 456-7890')
          ),
          React.createElement('div', null,
            React.createElement('h3', null, 'Horario'),
            React.createElement('p', null, 'Lunes a Viernes: 9:00 AM - 6:00 PM'),
            React.createElement('p', null, 'Su00e1bados: 9:00 AM - 1:00 PM')
          )
        )
      );
    };
    
    // Pu00e1ginas
    const HomePage = () => {
      return React.createElement('div', null,
        React.createElement('div', { className: 'app-home-hero' },
          React.createElement('h1', null, 'Asesoru00eda Legal Profesional'),
          React.createElement('p', null, 'Protegiendo sus derechos con experiencia y dedicaciu00f3n. Ofrecemos servicios legales en diferentes u00e1reas del derecho.'),
          React.createElement('a', { href: '/contacto', className: 'app-button' }, 'Contactar')
        ),
        React.createElement('div', { className: 'app-main' },
          React.createElement('h2', null, 'Nuestros Servicios'),
          React.createElement('div', { className: 'app-services' },
            React.createElement('div', { className: 'app-service-card' },
              React.createElement('div', { className: 'app-service-image' }),
              React.createElement('div', { className: 'app-service-content' },
                React.createElement('h3', { className: 'app-service-title' }, 'Derecho Penal'),
                React.createElement('p', null, 'Defensa especializada en casos penales, protecciu00f3n de sus derechos y garantu00edas constitucionales.')
              )
            ),
            React.createElement('div', { className: 'app-service-card' },
              React.createElement('div', { className: 'app-service-image' }),
              React.createElement('div', { className: 'app-service-content' },
                React.createElement('h3', { className: 'app-service-title' }, 'Derecho Civil'),
                React.createElement('p', null, 'Asistencia en contratos, obligaciones, responsabilidad civil y procesos de familia.')
              )
            ),
            React.createElement('div', { className: 'app-service-card' },
              React.createElement('div', { className: 'app-service-image' }),
              React.createElement('div', { className: 'app-service-content' },
                React.createElement('h3', { className: 'app-service-title' }, 'Derecho Comercial'),
                React.createElement('p', null, 'Asesoru00eda para empresas y emprendedores en aspectos legales del comercio y los negocios.')
              )
            )
          )
        )
      );
    };
    
    const ServicesPage = () => {
      return React.createElement('div', { className: 'app-main' },
        React.createElement('h1', null, 'Nuestros Servicios'),
        React.createElement('p', null, 'Ofrecemos asistencia legal en las siguientes u00e1reas:'),
        React.createElement('ul', null,
          React.createElement('li', null, 'Derecho Penal'),
          React.createElement('li', null, 'Derecho Civil'),
          React.createElement('li', null, 'Derecho de Tru00e1nsito'),
          React.createElement('li', null, 'Derecho Comercial'),
          React.createElement('li', null, 'Derecho Aduanero'),
          React.createElement('li', null, 'Consultoru00eda Legal')
        )
      );
    };
    
    const AboutPage = () => {
      return React.createElement('div', { className: 'app-main' },
        React.createElement('h1', null, 'Sobre Mu00ed'),
        React.createElement('p', null, 'Abogado Wilson Alexander Ipiales Guerron, profesional con amplia experiencia en el campo legal. Graduado de la Universidad XYZ con especializaciu00f3n en Derecho Penal.')
      );
    };
    
    const ContactPage = () => {
      return React.createElement('div', { className: 'app-main' },
        React.createElement('h1', null, 'Contacto'),
        React.createElement('p', null, 'Estamos disponibles para atender sus consultas legales.'),
        React.createElement('div', { className: 'app-contact-info' },
          React.createElement('div', null,
            React.createElement('h3', null, 'Direcciu00f3n'),
            React.createElement('p', null, 'Calle Principal 123'),
            React.createElement('p', null, 'Ibarra, Ecuador')
          ),
          React.createElement('div', null,
            React.createElement('h3', null, 'Contacto'),
            React.createElement('p', null, 'Email: contacto@abogadowilson.com'),
            React.createElement('p', null, 'Telu00e9fono: (123) 456-7890')
          )
        )
      );
    };
    
    // Aplicaciu00f3n principal
    const App = () => {
      return React.createElement(React.Fragment, null,
        React.createElement(Header, null),
        React.createElement(Routes, null,
          React.createElement(Route, { path: '/', element: React.createElement(HomePage, null) }),
          React.createElement(Route, { path: '/servicios', element: React.createElement(ServicesPage, null) }),
          React.createElement(Route, { path: '/sobre-mi', element: React.createElement(AboutPage, null) }),
          React.createElement(Route, { path: '/contacto', element: React.createElement(ContactPage, null) })
        ),
        React.createElement(Footer, null)
      );
    };
    
    // Renderizar la aplicaciu00f3n completa
    try {
      window.ReactDOM.createRoot(rootElement).render(
        React.createElement(BrowserRouter, null, React.createElement(App, null))
      );
      console.log('[StandaloneApp] Aplicaciu00f3n renderizada correctamente');
    } catch (error) {
      console.error('[StandaloneApp] Error al renderizar con createRoot:', error);
      
      // Intentar con el mu00e9todo de renderizado anterior como fallback
      try {
        window.ReactDOM.render(
          React.createElement(BrowserRouter, null, React.createElement(App, null)),
          rootElement
        );
        console.log('[StandaloneApp] Aplicaciu00f3n renderizada con ReactDOM.render');
      } catch (fallbackError) {
        console.error('[StandaloneApp] Error en renderizado fallback:', fallbackError);
      }
    }
  }
  
  // Arreglar problemas de WebSocket si los hay
  function fixWebSocketIssues() {
    if (window.__SIMULATED_WEBSOCKET__) return;
    
    console.log('[StandaloneApp] Aplicando parche para WebSocket...');
    
    // Crear un WebSocket seguro que no falle
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      console.log(`[StandaloneApp] Interceptando conexión WebSocket a: ${url}`);
      
      try {
        const ws = new originalWebSocket(url, protocols);
        
        // Mejorar manejo de errores
        ws.addEventListener('error', (event) => {
          console.warn('[StandaloneApp] Error en WebSocket, usando modo offline');
          event.preventDefault();
        });
        
        return ws;
      } catch (error) {
        console.warn('[StandaloneApp] Error al crear WebSocket, usando simulado:', error);
        
        // Crear un WebSocket simulado
        const fakeWs = {
          url,
          readyState: 1, // OPEN
          send: () => {},
          close: () => {},
          addEventListener: (event, handler) => {
            if (event === 'open') {
              setTimeout(() => handler({ target: fakeWs }), 10);
            }
          },
          removeEventListener: () => {},
          onopen: null,
          onclose: null,
          onerror: null,
          onmessage: null
        };
        
        // Simular conexión exitosa
        setTimeout(() => {
          if (fakeWs.onopen) fakeWs.onopen({ target: fakeWs });
        }, 10);
        
        window.__SIMULATED_WEBSOCKET__ = true;
        return fakeWs;
      }
    };
    
    // Mantener constantes
    window.WebSocket.CONNECTING = originalWebSocket.CONNECTING;
    window.WebSocket.OPEN = originalWebSocket.OPEN;
    window.WebSocket.CLOSING = originalWebSocket.CLOSING;
    window.WebSocket.CLOSED = originalWebSocket.CLOSED;
  }
  
  // Función principal para inicializar la aplicación independiente
  async function initializeStandaloneApp() {
    // Si ya hay una aplicación funcionando correctamente, no hacer nada
    if (document.getElementById('root') && document.getElementById('root').childNodes.length > 0 && 
        !isErrorPage()) {
      console.log('[StandaloneApp] Ya hay una aplicación cargada correctamente, no se inicializa la versión independiente');
      return;
    }
    
    console.log('[StandaloneApp] Iniciando aplicación independiente...');
    
    // Arreglar problemas de WebSocket
    fixWebSocketIssues();
    
    // Cargar estilos
    loadStyles();
    
    // Cargar React y otras librerías necesarias
    await loadReactLibraries();
    
    // Renderizar la aplicación
    renderStandaloneApp();
  }
  
  // Iniciar la aplicaciu00f3n cuando el DOM estu00e9 listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStandaloneApp);
  } else {
    // Si el documento ya estu00e1 cargado o muestra un error, iniciar inmediatamente
    if (isErrorPage()) {
      console.log('[StandaloneApp] Pu00e1gina de error detectada, inicializando inmediatamente');
      initializeStandaloneApp();
    } else {
      // Esperar un momento para ver si la aplicaciu00f3n principal carga correctamente
      setTimeout(() => {
        if (isErrorPage() || 
            !document.getElementById('root') || 
            document.getElementById('root').childNodes.length === 0) {
          console.log('[StandaloneApp] Aplicaciu00f3n principal no cargada correctamente, iniciando versiu00f3n independiente');
          initializeStandaloneApp();
        }
      }, 3000);
    }
  }
})();
