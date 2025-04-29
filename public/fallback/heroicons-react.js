/**
 * Fallback mejorado para @heroicons/react con compatibilidad UMD
 * Proporciona implementación básica para los iconos más comunes
 */

(function (global, factory) {
  // Soporte para UMD (Universal Module Definition)
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.HeroiconsReact = {}));
}(this, (function (exports) { 'use strict';
  
  console.log('[Fallback] Cargando implementación local de @heroicons/react');
  
  // Crear objeto global para heroicons si no existe
  window.HeroiconsReact = window.HeroiconsReact || {};
  
  // Crear colecciones para outline y solid
  const outline = {};
  const solid = {};
  exports.outline = outline;
  exports.solid = solid;
  window.HeroiconsReact.outline = outline;
  window.HeroiconsReact.solid = solid;
  
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
      // Si React está disponible, usar createElement
      if (typeof React !== 'undefined') {
        return React.createElement('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          'aria-hidden': 'true',
          width: props.size || '1em',
          height: props.size || '1em',
          ...props
        }, React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: svgPath
        }));
      }
      
      // Fallback para cuando React no está disponible
      return {
        $$typeof: Symbol.for('react.element'),
        type: 'svg',
        props: {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          'aria-hidden': 'true',
          width: '1em',
          height: '1em',
          children: [{
            $$typeof: Symbol.for('react.element'),
            type: 'path',
            props: {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: svgPath
            }
          }]
        }
      };
    };
  }
  
  // Función para generar paths de SVG para diferentes iconos
  function getIconPath(name) {
    // Definir paths para los iconos más comunes
    const iconPaths = {
      'Home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'User': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'Document': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      'DocumentText': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'Calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'Clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'Mail': 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'Phone': 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      'Chat': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      'ChatBubbleLeft': 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      'CheckCircle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'Check': 'M5 13l4 4L19 7',
      'XCircle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'X': 'M6 18L18 6M6 6l12 12',
      'ExclamationCircle': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'QuestionMarkCircle': 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'ArrowRight': 'M14 5l7 7m0 0l-7 7m7-7H3',
      'ArrowLeft': 'M10 19l-7-7m0 0l7-7m-7 7h18',
      'ArrowUp': 'M5 10l7-7m0 0l7 7m-7-7v18',
      'ArrowDown': 'M19 14l-7 7m0 0l-7-7m7 7V3',
      'ChevronRight': 'M9 5l7 7-7 7',
      'ChevronLeft': 'M15 19l-7-7 7-7'
    };
    
    // Si tenemos el path para este icono, devolverlo
    if (iconPaths[name]) {
      return iconPaths[name];
    }
    
    // Path genérico para iconos no definidos
    console.warn(`[Heroicons] Path no encontrado para ${name}, usando genérico`);
    return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
  
  // Crear una función para generar iconos a partir de paths SVG
  function createIcon(name, svgPath) {
    return createIconComponent(name, 'outline');
  }

  // Generar iconos para outline y solid
  commonIcons.forEach(name => {
    const path = getIconPath(name);
    outline[name] = createIconComponent(name, 'outline');
    solid[name] = createIconComponent(name, 'solid');
  });
  
  // Notificar que el módulo ha sido cargado
  window.__heroicons_react__loaded = true;
  console.log('[FallbackModule] @heroicons/react cargado exitosamente (fallback)');
  
  // Exponer todos los iconos como exports individuales
  commonIcons.forEach(name => {
    exports[name] = outline[name];  // Exportar principalmente los outline por default
  });
  
  // Añadir soporte para imports default
  exports.default = {
    outline,
    solid
  };
  
  // Compatibilidad con sistemas que utilizan import específico
  if (typeof window.__importMapOverride !== 'undefined') {
    window.__importMapOverride.addOverride('@heroicons/react', {
      exports: exports
    });
  }
  
  // Compatibilidad con sistemas de módulos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.HeroiconsReact;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return window.HeroiconsReact; });
  }
  
  console.log('[Fallback] @heroicons/react cargado correctamente');
})));

// Definir módulo en formato antiguo para compatibilidad
if (typeof window !== 'undefined') {
  window['@heroicons/react'] = window.HeroiconsReact;
}
