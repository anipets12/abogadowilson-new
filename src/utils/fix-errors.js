/**
 * fix-errors.js - Sistema de recuperación y prevención de errores comunes 
 * en aplicaciones React con Vite y Cloudflare Workers
 */

// Variables de control
const MAX_RETRIES = 5;
let retryCount = 0;
let pendingRetryTimeout = null;

/**
 * Inicializa el sistema de recuperación automática
 */
export function initErrorFixes() {
  console.log('Inicializando sistema de recuperación de errores...');
  
  // Evita ejecutar más de una vez
  if (window._errorFixesInitialized) return;
  window._errorFixesInitialized = true;

  // Intercepta errores globales
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handlePromiseRejection);
  
  // Soluciona problemas específicos de los módulos
  fixModuleLoading();
  
  // Monitorea la conexión
  window.addEventListener('online', () => {
    console.log('Conexión restaurada, intentando recuperar sistema...');
    retryLoadingApp();
  });
  
  console.log('Sistema de recuperación inicializado correctamente');
}

/**
 * Maneja errores globales de la aplicación
 */
function handleGlobalError(event) {
  // Errores específicos de carga de módulos
  if (event.message && (
      event.message.includes('Failed to fetch dynamically imported module') ||
      event.message.includes('Failed to resolve import') ||
      event.message.includes('Cannot find module') ||
      event.message.includes('Failed to load')
  )) {
    console.warn('Error detectado en carga de módulos:', event.message);
    
    // Intenta recuperar si es un error específico de módulos
    if (++retryCount <= MAX_RETRIES) {
      event.preventDefault(); // Evita que el error se muestre en la consola
      retryLoadingApp();
      return false;
    }
  }
  
  // Si es un script externo que falló, no detener la aplicación
  if (event.target && event.target.tagName === 'SCRIPT') {
    console.warn('Error en script externo:', event.target.src);
    event.preventDefault();
    return false;
  }
}

/**
 * Maneja promesas rechazadas no capturadas
 */
function handlePromiseRejection(event) {
  const errorMsg = event.reason?.message || String(event.reason);
  
  // Errores específicos de carga de módulos
  if (errorMsg.includes('Failed to fetch') || 
      errorMsg.includes('NetworkError') ||
      errorMsg.includes('import') ||
      errorMsg.includes('module')) {
    console.warn('Error de red en carga de módulos:', errorMsg);
    
    if (++retryCount <= MAX_RETRIES) {
      event.preventDefault();
      retryLoadingApp();
    }
  }
}

/**
 * Aplica soluciones específicas para problemas de carga de módulos
 */
function fixModuleLoading() {
  // Proporciona implementaciones falsas de módulos que puedan fallar
  // y no sean críticos para la funcionalidad principal
  window._virtual_modules = window._virtual_modules || {};
  
  // Añade soporte para ESM condicional
  if (typeof window.require !== 'function') {
    window.require = function(moduleName) {
      console.warn(`Módulo ${moduleName} solicitado pero require no está disponible`);
      // Devuelve un objeto vacío para evitar errores
      return window._virtual_modules[moduleName] || {};
    };
  }
  
  // Registra componentes de respaldo para evitar errores en importación
  window._regBackup = function(name, component) {
    window._virtual_modules[name] = component;
  };
  
  // Maneja problemas específicos con React Icons
  handleReactIconsPolyfill();
}

/**
 * Polyfill específico para React Icons que a veces falla en cargar
 */
function handleReactIconsPolyfill() {
  if (!window.ReactIconsPolyfill) {
    window.ReactIconsPolyfill = true;
    
    // Crea un icono genérico de respaldo
    const GenericIcon = (props) => {
      return React.createElement('span', {
        ...props,
        style: {
          display: 'inline-block',
          width: '1em',
          height: '1em',
          verticalAlign: 'middle',
          ...props.style
        }
      }, '•');
    };
    
    // Registra componentes de respaldo para iconos
    const iconLibraries = ['fa', 'fi', 'md', 'ai', 'bi', 'bs', 'di', 'gi'];
    iconLibraries.forEach(lib => {
      window._virtual_modules[`react-icons/${lib}`] = {
        default: GenericIcon
      };
      
      // Añadir tipos de iconos comunes
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        window._virtual_modules[`react-icons/${lib}`][`${lib.toUpperCase()}${letter}`] = GenericIcon;
      });
    });
  }
}

/**
 * Intenta recargar la aplicación o sólo los módulos fallidos
 */
function retryLoadingApp() {
  // Evitar múltiples intentos simultáneos
  if (pendingRetryTimeout) {
    clearTimeout(pendingRetryTimeout);
  }
  
  pendingRetryTimeout = setTimeout(() => {
    console.log(`Intentando recuperar aplicación (intento ${retryCount} de ${MAX_RETRIES})...`);
    
    // Si superamos el número máximo de intentos, hacemos una recarga completa
    if (retryCount >= MAX_RETRIES) {
      console.warn('Máximo de intentos alcanzado, recargando página...');
      window.location.reload();
      return;
    }
    
    // Intenta una recuperación a nivel de módulo primero
    try {
      // Forzar actualización del estado interno de Vite
      if (window.__vite_plugin_react_preamble_installed__) {
        console.log('Actualizando estado interno de Vite...');
        document.dispatchEvent(new CustomEvent('vite:invalidate'));
      }
      
      // Emitir evento personalizado para componentes que escuchen
      document.dispatchEvent(new CustomEvent('app:retry-load'));
      
    } catch (e) {
      console.error('Error durante intento de recuperación:', e);
    }
    
    pendingRetryTimeout = null;
  }, 1500); // Esperar 1.5 segundos entre intentos
}

export default {
  initErrorFixes
};
