/**
 * Simulación de @headlessui/react - Compatible con UMD
 */
(function (global, factory) {
  // Soporte para UMD (Universal Module Definition)
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.HeadlessUI = {}));
}(this, (function (exports) { 'use strict';
  
  // Si ya existe HeadlessUI, configurar exports y salir
  if (window.HeadlessUI) {
    Object.keys(window.HeadlessUI).forEach(key => {
      exports[key] = window.HeadlessUI[key];
    });
    exports.default = window.HeadlessUI;
    console.log('[FallbackModule] Usando instancia existente de @headlessui/react');
    return;
  }

  const React = window.React || {};
  
  // Componentes simulados de Headless UI
  const HeadlessUI = {
    Transition: {
      Root: function(props) { return props.children; },
      Child: function(props) { return props.children; },
      show: true
    },
    Menu: {
      Button: function(props) { 
        return React.createElement('button', props, props.children); 
      },
      Items: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Item: function(props) { 
        return React.createElement('div', props, props.children); 
      }
    },
    Listbox: {
      Button: function(props) { 
        return React.createElement('button', props, props.children); 
      },
      Options: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Option: function(props) { 
        return React.createElement('div', props, props.children); 
      }
    },
    Dialog: {
      Root: function(props) { return props.children; },
      Panel: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Overlay: function(props) { 
        return React.createElement('div', {
          ...props,
          className: 'fixed inset-0 bg-black bg-opacity-25'
        }); 
      },
      Title: function(props) { 
        return React.createElement('h3', {
          ...props,
          className: 'text-lg font-medium leading-6 text-gray-900'
        }, props.children); 
      },
      Description: function(props) { 
        return React.createElement('p', {
          ...props,
          className: 'mt-2 text-sm text-gray-500'
        }, props.children); 
      }
    },
    Disclosure: {
      Button: function(props) { 
        return React.createElement('button', props, props.children); 
      },
      Panel: function(props) { 
        return React.createElement('div', props, props.children); 
      }
    },
    Combobox: {
      Input: function(props) { 
        return React.createElement('input', props); 
      },
      Options: function(props) { 
        return React.createElement('ul', props, props.children); 
      },
      Option: function(props) { 
        return React.createElement('li', props, props.children); 
      }
    },
    Switch: {
      Group: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Label: function(props) { 
        return React.createElement('label', props, props.children); 
      }
    },
    Tab: {
      Group: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      List: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Panels: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Panel: function(props) { 
        return React.createElement('div', props, props.children); 
      }
    }
  };

  // Notificar que el módulo ha sido cargado
  window.__headlessui_react__loaded = true;
  console.log('[FallbackModule] @headlessui/react cargado exitosamente (fallback)');
  
  // Exportar todos los componentes
  Object.keys(HeadlessUI).forEach(key => {
    exports[key] = HeadlessUI[key];
  });
  
  // Compatibilidad con sistemas que utilizan default export
  exports.default = HeadlessUI;
})));

// Definir módulo en formato antiguo para compatibilidad
if (typeof window !== 'undefined') {
  window['@headlessui/react'] = window.HeadlessUI;
  console.log('[FallbackLoader] HeadlessUI simulado cargado correctamente');
}
