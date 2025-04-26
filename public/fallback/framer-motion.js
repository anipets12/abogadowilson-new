/**
 * Fallback mu00ednimo para framer-motion
 * Proporciona stubs para las funcionalidades mu00e1s utilizadas
 */

(function() {
  console.log('[Fallback] Cargando implementaciu00f3n local de framer-motion');
  
  // Crear objeto global para framer-motion
  window.FramerMotion = {};
  
  // Crear un objeto motion con componentes comunes
  const motion = {};
  const components = ['div', 'span', 'button', 'a', 'ul', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'svg', 'path'];
  
  // Crear componentes motion bu00e1sicos
  components.forEach(comp => {
    motion[comp] = createMotionComponent(comp);
  });
  
  // Helpers y funciones utilitarias
  const utils = {
    // Animaciu00f3n bu00e1sica sin comportamiento real
    animate: function() { return { stop: function() {} }; },
    useAnimation: function() { 
      return { 
        start: function() { return Promise.resolve(); },
        stop: function() {}
      }; 
    },
    // Variantes vacu00edas
    variants: {},
    // Transiciones predefinidas
    transition: {
      ease: 'easeInOut',
      duration: 0.3
    }
  };
  
  // Funciones para crear componentes de motion
  function createMotionComponent(type) {
    return function(props) {
      // Filtrar propiedades de motion para que no interfieran con React
      const filteredProps = {};
      for (const key in props) {
        if (key !== 'animate' && key !== 'initial' && key !== 'exit' && key !== 'transition' && key !== 'variants') {
          filteredProps[key] = props[key];
        }
      }
      
      // Devolver un elemento React
      return {
        $$typeof: Symbol.for('react.element'),
        type: type,
        props: filteredProps
      };
    };
  }
  
  // Exportar objetos y funciones
  window.FramerMotion.motion = motion;
  Object.assign(window.FramerMotion, utils);
  
  // Compatibilidad con sistemas de mu00f3dulos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.FramerMotion;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return window.FramerMotion; });
  }
  
  console.log('[Fallback] framer-motion cargado correctamente');
})();
