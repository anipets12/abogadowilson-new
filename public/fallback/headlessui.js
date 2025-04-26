/**
 * Simulación de @headlessui/react
 */
(function() {
  if (window.HeadlessUI) return;

  const React = window.React || {};
  
  // Componentes simulados de Headless UI
  window.HeadlessUI = {
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
      Root: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Overlay: function(props) { 
        return React.createElement('div', props, props.children); 
      },
      Title: function(props) { 
        return React.createElement('h3', props, props.children); 
      },
      Description: function(props) { 
        return React.createElement('p', props, props.children); 
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

  // Exponer como módulo UMD
  if (typeof window !== 'undefined') {
    window['@headlessui/react'] = window.HeadlessUI;
  }

  console.log('[FallbackLoader] HeadlessUI simulado cargado correctamente');
})();
