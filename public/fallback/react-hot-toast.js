/**
 * Implementaciu00f3n simulada de react-hot-toast
 * @version 2.4.1
 */

(function() {
  if (window.toast) return;
  
  const React = window.React || {};
  
  // Implementaciu00f3n simple de toast
  const toast = {
    // Mu00e9todos principales
    success: function(message, options) {
      console.log('[Toast] Success:', message);
      showToastMessage('success', message, options);
      return 'toast-id-' + Math.random().toString(36).substr(2, 9);
    },
    error: function(message, options) {
      console.log('[Toast] Error:', message);
      showToastMessage('error', message, options);
      return 'toast-id-' + Math.random().toString(36).substr(2, 9);
    },
    loading: function(message, options) {
      console.log('[Toast] Loading:', message);
      showToastMessage('loading', message, options);
      return 'toast-id-' + Math.random().toString(36).substr(2, 9);
    },
    dismiss: function(toastId) {
      console.log('[Toast] Dismiss:', toastId);
      removeToastMessage(toastId || 'all');
    },
    promise: function(promise, msgs, opts) {
      console.log('[Toast] Promise:', msgs);
      const id = toast.loading(msgs.loading || 'Cargando...');
      promise
        .then(() => {
          toast.success(msgs.success || 'u00a1Completado!', { id });
          return promise;
        })
        .catch(() => {
          toast.error(msgs.error || 'Error', { id });
        });
      return promise;
    },
    // Componente Toaster
    Toaster: function(props) {
      return React.createElement('div', { id: 'react-hot-toast', style: { position: 'fixed', top: '16px', right: '16px', zIndex: 9999 } });
    }
  };
  
  // Mu00e9todos auxiliares
  function showToastMessage(type, message, options) {
    // Crear contenedor si no existe
    let container = document.getElementById('react-hot-toast');
    if (!container) {
      container = document.createElement('div');
      container.id = 'react-hot-toast';
      container.style.position = 'fixed';
      container.style.top = '16px';
      container.style.right = '16px';
      container.style.zIndex = '9999';
      document.body && document.body.appendChild(container);
    }
    
    // Crear el toast
    const toastId = options && options.id ? options.id : 'toast-id-' + Math.random().toString(36).substr(2, 9);
    const toastEl = document.createElement('div');
    toastEl.id = toastId;
    toastEl.style.padding = '8px 12px';
    toastEl.style.marginBottom = '8px';
    toastEl.style.borderRadius = '4px';
    toastEl.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
    toastEl.style.fontSize = '14px';
    toastEl.style.pointerEvents = 'all';
    toastEl.style.cursor = 'pointer';
    
    // Estilo segu00fan tipo
    if (type === 'success') {
      toastEl.style.backgroundColor = '#10B981';
      toastEl.style.color = 'white';
    } else if (type === 'error') {
      toastEl.style.backgroundColor = '#EF4444';
      toastEl.style.color = 'white';
    } else {
      toastEl.style.backgroundColor = '#F3F4F6';
      toastEl.style.color = '#111827';
    }
    
    // Texto
    toastEl.textContent = message;
    
    // Click para cerrar
    toastEl.addEventListener('click', function() {
      toastEl.remove();
    });
    
    // Agregar al contenedor
    container.appendChild(toastEl);
    
    // Auto-dismiss
    if (!options || options.duration !== Infinity) {
      setTimeout(() => {
        toastEl.remove();
      }, options && options.duration ? options.duration : 3000);
    }
    
    return toastId;
  }
  
  function removeToastMessage(id) {
    if (id === 'all') {
      const container = document.getElementById('react-hot-toast');
      if (container) {
        container.innerHTML = '';
      }
      return;
    }
    
    const toastEl = document.getElementById(id);
    if (toastEl) {
      toastEl.remove();
    }
  }
  
  // Exportar globalmente
  window.toast = toast;
  
  // Exponer como mu00f3dulo UMD
  if (typeof window !== 'undefined') {
    window['react-hot-toast'] = toast;
  }
  
  console.log('[FallbackLoader] ReactHotToast simulado cargado correctamente');
})();
