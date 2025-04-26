/**
 * Manejador personalizado para conexiones WebSocket
 * Este archivo ayuda a gestionar reconexiones y errores de WebSocket
 */

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 2000; // 2 segundos

/**
 * Inicializa la conexiu00f3n WebSocket
 * @param {string} url - URL del WebSocket
 * @param {Function} onMessage - Callback para mensajes recibidos
 * @param {Function} onError - Callback para errores
 * @param {Function} onOpen - Callback cuando la conexiu00f3n se abre
 * @param {Function} onClose - Callback cuando la conexiu00f3n se cierra
 */
export function initializeWebSocket(url, onMessage, onError, onOpen, onClose) {
  try {
    console.log(`[WebSocketHandler] Iniciando conexiu00f3n a ${url}`);
    
    // Cerrar socket anterior si existe
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    
    socket = new WebSocket(url);
    
    socket.onopen = (event) => {
      console.log('[WebSocketHandler] Conexiu00f3n establecida');
      reconnectAttempts = 0;
      if (onOpen) onOpen(event);
    };
    
    socket.onmessage = (event) => {
      if (onMessage) onMessage(event);
    };
    
    socket.onerror = (error) => {
      console.error('[WebSocketHandler] Error de conexiu00f3n:', error);
      if (onError) onError(error);
    };
    
    socket.onclose = (event) => {
      console.log(`[WebSocketHandler] Conexiu00f3n cerrada. Cu00f3digo: ${event.code}`);
      
      if (onClose) onClose(event);
      
      // Intentar reconectar automáticamente
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`[WebSocketHandler] Intentando reconectar (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        setTimeout(() => {
          initializeWebSocket(url, onMessage, onError, onOpen, onClose);
        }, RECONNECT_INTERVAL * reconnectAttempts);
      } else {
        console.error('[WebSocketHandler] Se alcanzu00f3 el mu00e1ximo de intentos de reconexiu00f3n');
      }
    };
    
    return socket;
  } catch (error) {
    console.error('[WebSocketHandler] Error al inicializar WebSocket:', error);
    if (onError) onError(error);
    return null;
  }
}

/**
 * Envu00eda un mensaje a travu00e9s del WebSocket
 * @param {any} data - Datos a enviar
 * @returns {boolean} - true si se enviu00f3 correctamente, false en caso contrario
 */
export function sendMessage(data) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('[WebSocketHandler] No se puede enviar mensaje: socket no conectado');
    return false;
  }
  
  try {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    socket.send(message);
    return true;
  } catch (error) {
    console.error('[WebSocketHandler] Error al enviar mensaje:', error);
    return false;
  }
}

/**
 * Cierra manualmente la conexiu00f3n WebSocket
 */
export function closeConnection() {
  if (socket) {
    console.log('[WebSocketHandler] Cerrando conexiu00f3n manualmente');
    socket.close();
    socket = null;
  }
}

/**
 * Verifica si la conexiu00f3n WebSocket estu00e1 abierta
 * @returns {boolean} - true si estu00e1 conectado, false en caso contrario
 */
export function isConnected() {
  return socket && socket.readyState === WebSocket.OPEN;
}

/**
 * Reinicia los intentos de reconexiu00f3n
 */
export function resetReconnectAttempts() {
  reconnectAttempts = 0;
}
