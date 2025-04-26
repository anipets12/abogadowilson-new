/**
 * Fallback mu00ednimo para @heroicons/react
 * Proporciona implementaciu00f3n bu00e1sica para los iconos mu00e1s comunes
 */

(function() {
  console.log('[Fallback] Cargando implementaciu00f3n local de @heroicons/react');
  
  // Crear objeto global para heroicons
  window.HeroiconsReact = {};
  
  // Crear colecciones para outline y solid
  window.HeroiconsReact.outline = {};
  window.HeroiconsReact.solid = {};
  
  // Lista de iconos comunes
  const commonIcons = [
    'Home', 'User', 'Document', 'DocumentText', 'Calendar', 'Clock', 
    'Mail', 'Phone', 'Chat', 'ChatBubbleLeft', 'CheckCircle', 'Check',
    'XCircle', 'X', 'ExclamationCircle', 'QuestionMarkCircle', 'ArrowRight',
    'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft',
    'ChevronUp', 'ChevronDown', 'Menu', 'Adjustments', 'Cog', 'Bell',
    'Search', 'Plus', 'Minus', 'Pencil', 'Trash', 'ShoppingCart', 'Heart',
    'Star', 'CloudUpload', 'CloudDownload', 'Link', 'Globe', 'LockClosed',
    'LockOpen', 'EyeSlash', 'Eye', 'Photograph', 'Camera', 'Microphone',
    'Video', 'Speaker', 'Play', 'Pause', 'VolumeUp', 'VolumeOff'
  ];
  
  // Crear los iconos para outline y solid
  commonIcons.forEach(iconName => {
    window.HeroiconsReact.outline[iconName] = createIconComponent(iconName, 'outline');
    window.HeroiconsReact.solid[iconName] = createIconComponent(iconName, 'solid');
  });
  
  // Funciu00f3n para crear componentes de iconos
  function createIconComponent(name, variant) {
    return function(props) {
      props = props || {};
      const size = props.width || props.height || props.size || '24';
      const className = props.className || '';
      
      // SVG bu00e1sico para outline
      const outlineSvg = `<svg width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/></svg>`;
      
      // SVG bu00e1sico para solid
      const solidSvg = `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/></svg>`;
      
      // Contenido basado en la variante
      const svgContent = variant === 'outline' ? outlineSvg : solidSvg;
      
      // Crear wrapper con dangerouslySetInnerHTML para el SVG
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'span',
        props: {
          className: className,
          style: { display: 'inline-block', verticalAlign: 'middle' },
          dangerouslySetInnerHTML: { __html: svgContent },
          'aria-hidden': 'true'
        }
      };
    };
  }
  
  // Compatibilidad con sistemas de mu00f3dulos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.HeroiconsReact;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return window.HeroiconsReact; });
  }
  
  console.log('[Fallback] @heroicons/react cargado correctamente');
})();
