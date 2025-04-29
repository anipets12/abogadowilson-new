import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Importamos sistemas de optimización y recuperación
import { initErrorFixes } from './utils/fix-errors'
import { loadDependency } from './utils/dependency-loader'

// Precarga de dependencias críticas
const preloadDependencies = async () => {
  try {
    // Cargamos axios y otras dependencias críticas al inicio
    console.log('[Preloader] Precargando dependencias críticas...')
    await loadDependency('/node_modules/.vite/deps/axios.js')
    console.log('[Preloader] Dependencias críticas cargadas correctamente')
    return true
  } catch (error) {
    console.warn('[Preloader] Error al precargar dependencias:', error)
    return false
  }
}

// Fix para WebSocket en navegadores que lo soportan
if (typeof window !== 'undefined' && window.WebSocket) {
  const originalWebSocket = window.WebSocket
  window.WebSocket = function(url, protocols) {
    console.log(`[WebSocketFix] Creando WebSocket para: ${url}`)
    try {
      return new originalWebSocket(url, protocols)
    } catch (error) {
      console.error('[WebSocketFix] Error al crear WebSocket:', error)
      // Simular objetos WebSocket para prevenir errores fatales
      return {
        url,
        readyState: 3, // CLOSED
        send: () => console.warn('[WebSocketFix] Intento de envío en socket simulado'),
        close: () => {},
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null
      }
    }
  }
  window.WebSocket.CONNECTING = originalWebSocket.CONNECTING
  window.WebSocket.OPEN = originalWebSocket.OPEN
  window.WebSocket.CLOSING = originalWebSocket.CLOSING
  window.WebSocket.CLOSED = originalWebSocket.CLOSED
}

// Inicializamos el sistema de recuperación antes de renderizar
if (typeof window !== 'undefined') {
  initErrorFixes()
  
  // Hack para asegurar que Vite HMR funcione
  window.__vite_plugin_react_preamble_installed__ = true
}

// Función para cargar módulos críticos mediante el sistema de resolución
async function loadCriticalModules() {
  console.log('[Main] Cargando módulos críticos...');
  try {
    // Importar directamente para evitar problemas de resolución
    const reactRouter = await import('react-router-dom');
    const App = await import('./App.jsx');
    
    // Importar y preparar el manejador de WebSocket
    let wsHandler = null;
    try {
      const wsModule = await import('./utils/websocket-handler.js');
      wsHandler = new wsModule.WebSocketHandler();
    } catch (wsError) {
      console.warn('[Main] No se pudo cargar el manejador de WebSocket:', wsError);
      // Implementar un manejador simulado para continuar
      wsHandler = {
        connect: () => Promise.resolve(),
        isConnected: () => false,
        send: () => false,
        close: () => {}
      };
    }
    
    // Almacenar módulos cargados para acceso global
    window.__APP_STATE__ = window.__APP_STATE__ || {};
    window.__APP_STATE__.modules = window.__APP_STATE__.modules || {};
    window.__APP_STATE__.modules.reactRouter = reactRouter;
    window.__APP_STATE__.modules.App = App;
    window.__APP_STATE__.modules.wsHandler = wsHandler;
    
    return {
      BrowserRouter: reactRouter.BrowserRouter,
      App: App.default,
      wsHandler
    };
  } catch (error) {
    console.error('[Main] Error al cargar módulos críticos:', error);
    throw error;
  }
}

// Función para inicializar la conexión WebSocket con reintentos
async function initializeWebSocket(wsHandler) {
  try {
    // Determinar si estamos en desarrollo o producción
    const isDev = import.meta.env.DEV;
    const wsUrl = isDev 
      ? 'ws://localhost:' + (import.meta.env.VITE_WS_PORT || '8787') + '/ws'
      : 'wss://' + window.location.host + '/ws';
      
    console.log(`[Main] Inicializando conexión WebSocket a: ${wsUrl}`);
    
    if (wsHandler && typeof wsHandler.connect === 'function') {
      // Pasar callbacks para gestionar eventos
      await wsHandler.connect(wsUrl, {
        onOpen: () => console.log('[Main] Conexión WebSocket establecida'),
        onError: (err) => console.warn('[Main] Error en WebSocket:', err),
        onClose: () => console.log('[Main] Conexión WebSocket cerrada')
      });
    } else {
      console.warn('[Main] Manejador WebSocket no válido, continuando sin WebSocket');
    }
  } catch (error) {
    console.warn('[Main] No se pudo establecer conexión WebSocket, continuando sin ella:', error);
    // No lanzar error para continuar sin WebSocket
  }
}

// Función principal para inicializar la aplicación
async function initializeApp() {  
  try {
    console.log('[Main] Inicializando aplicación...');
    
    // Precarga de dependencias críticas
    await preloadDependencies();
    
    // Cargar módulos críticos
    const { BrowserRouter, App, wsHandler } = await loadCriticalModules();
    
    // Inicializar conexión WebSocket
    await initializeWebSocket(wsHandler);
    
    // Verificar que el elemento root exista antes de continuar
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      // Si no existe, intentar crearlo
      console.warn('[Main] Elemento raíz no encontrado, creando uno nuevo');
      const newRoot = document.createElement('div');
      newRoot.id = 'root';
      document.body.appendChild(newRoot);
      
      // Usar el nuevo elemento
      const root = ReactDOM.createRoot(newRoot);
      root.render(
        <React.StrictMode>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast-notification'
              }}
            />
          </BrowserRouter>
        </React.StrictMode>
      );
    } else {
      // Usar el elemento existente
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast-notification'
              }}
            />
          </BrowserRouter>
        </React.StrictMode>
      );
    }
    
    console.log('[Main] Aplicación inicializada correctamente');
    window.__APP_STATE__ = window.__APP_STATE__ || {};
    window.__APP_STATE__.loaded = true;
    
    // Limpiar estado de errores si llegamos aquí
    window.__APP_STATE__.failed = false;
    window.__APP_STATE__.retryCount = 0;
    
    // Notificar que la aplicación está lista
    document.dispatchEvent(new CustomEvent('app:ready'));
  } catch (error) {
    handleInitializationError(error);
  }
}

// Manejador de errores de inicialización
function handleInitializationError(error) {
  console.error('[Main] Error fatal al inicializar la aplicación:', error);
  window.__APP_STATE__.failed = true;
  window.__APP_STATE__.errorCount++;
  
  // Verificar si podemos reintentar
  if (window.__APP_STATE__.retryCount < window.__APP_STATE__.maxRetries) {
    window.__APP_STATE__.retryCount++;
    console.log(`[Main] Reintentando inicialización (${window.__APP_STATE__.retryCount}/${window.__APP_STATE__.maxRetries})...`);
    
    // Limpiar timeout anterior si existe
    if (retryTimeout) clearTimeout(retryTimeout);
    
    // Programar reintento
    retryTimeout = setTimeout(() => {
      initializeApp().catch(e => {
        console.error('[Main] Error en reintento:', e);
      });
    }, RETRY_DELAY);
    
    return;
  }
  
  // Si llegamos aquí, fallaron todos los reintentos
  showErrorScreen(error);
}

// Muestra la pantalla de error cuando no se puede inicializar
function showErrorScreen(error) {
  console.log('[Main] Mostrando pantalla de error...');
  
  // Mostrar mensaje de error crítico con opciones de recuperación
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h2 style="color: #e11d48;">Error crítico</h2>
      <p>No se pudo inicializar la aplicación. Por favor, intente nuevamente.</p>
      <p style="color: #6b7280; font-size: 14px;">Detalles técnicos: ${error?.message || 'Error desconocido'}</p>
      <div style="margin-top: 20px;">
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">
          Reintentar
        </button>
        <button onclick="localStorage.clear(); window.location.reload()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">
          Reiniciar datos y reintentar
        </button>
      </div>
    </div>
  `;
}

// Iniciar la aplicación
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Main] Documento cargado, iniciando aplicación...');
  initializeApp().catch(error => {
    console.error('[Main] Error no manejado:', error);
    showErrorScreen(error);
  });
});

// Exportar para pruebas y acceso global
export { initializeApp };
