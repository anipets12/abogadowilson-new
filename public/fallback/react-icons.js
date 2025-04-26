/**
 * Simulaciu00f3n de react-icons
 */
(function() {
  if (window.ReactIcons) return;

  const React = window.React || {};
  
  // Funciu00f3n de ayuda para crear un icono SVG
  function createSvgIcon(props = {}) {
    return React.createElement(
      'svg', 
      { 
        width: '1em',
        height: '1em',
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        ...props
      },
      React.createElement('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' })
    );
  }
  
  // Crear un proxy que devuelva siempre un icono genu00e9rico
  function createIconCollection() {
    return new Proxy({}, {
      get: function(target, prop) {
        // Si la propiedad es una colecciu00f3n de iconos (Fa, Md, etc.)
        if (typeof prop === 'string' && prop.length <= 3) {
          return createIconCollection();
        }
        
        // Si es un icono individual
        return function IconComponent(props) {
          console.log(`[ReactIcons] Renderizando icono simulado: ${prop}`);
          return createSvgIcon(props);
        };
      }
    });
  }
  
  // Crear objeto global de iconos
  window.ReactIcons = createIconCollection();
  
  // Crear atajos para las colecciones mu00e1s comunes
  const collections = ['Fa', 'Md', 'Fi', 'Ai', 'Bi', 'Di', 'Gi', 'Hi', 'Im', 'Si', 'Ti', 'Wi', 'Go', 'Io', 'Ri', 'Ci', 'Bs', 'Vsc'];
  
  // Crear todas las colecciones como propiedades directas
  collections.forEach(collection => {
    window.ReactIcons[collection] = createIconCollection();
  });
  
  // Exponer como mu00f3dulo UMD
  if (typeof window !== 'undefined') {
    window['react-icons'] = window.ReactIcons;
    
    // Tambu00e9n exponer colecciones comunes directamente
    collections.forEach(collection => {
      window[`react-icons/${collection.toLowerCase()}`] = window.ReactIcons[collection];
    });
  }
  
  console.log('[FallbackLoader] ReactIcons simulado cargado correctamente');
})();
