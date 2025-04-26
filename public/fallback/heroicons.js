/**
 * Simulaciu00f3n de @heroicons/react
 */
(function() {
  if (window.HeroIcons) return;

  const React = window.React || {};
  
  // Funciu00f3n de ayuda para crear un icono SVG
  function createIcon(props = {}) {
    return React.createElement(
      'svg', 
      { 
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...props
      },
      React.createElement('path', { d: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z' })
    );
  }
  
  // Crear un proxy que devuelva siempre un icono genu00e9rico
  function createIconProxy() {
    return new Proxy({}, {
      get: function(target, prop) {
        return function(props) {
          console.log(`[HeroIcons] Renderizando icono simulado: ${prop}`);
          return createIcon(props);
        };
      }
    });
  }
  
  // Crear los tres tipos de iconos
  const solid = createIconProxy();
  const outline = createIconProxy();
  const mini = createIconProxy();
  
  // Configurar objeto global
  window.HeroIcons = {
    solid,
    outline,
    mini
  };
  
  // Exponer como mu00f3dulo UMD
  if (typeof window !== 'undefined') {
    window['@heroicons/react'] = window.HeroIcons;
  }
  
  console.log('[FallbackLoader] HeroIcons simulado cargado correctamente');
})();
