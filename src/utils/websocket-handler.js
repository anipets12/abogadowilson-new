/**
 * Manejador personalizado para conexiones WebSocket
 * Este archivo ayuda a gestionar reconexiones y errores de WebSocket
 */

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 2000; // 2 segundos

/**
 * Inicializa la conexión WebSocket
 * @param {string} url - URL del WebSocket
 * @param {Function} onMessage - Callback para mensajes recibidos
 * @param {Function} onError - Callback para errores
 * @param {Function} onOpen - Callback cuando la conexión se abre
 * @param {Function} onClose - Callback cuando la conexión se cierra
 */
export function initializeWebSocket(url, onMessage, onError, onOpen, onClose) {
  try {
    console.log(`[WebSocketHandler] Iniciando conexión a ${url}`);
    
    // Cerrar socket anterior si existe
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    
    socket = new WebSocket(url);
    
    socket.onopen = (event) => {
      console.log('[WebSocketHandler] Conexión establecida');
      reconnectAttempts = 0;
      if (onOpen) onOpen(event);
    };
    
    socket.onmessage = (event) => {
      if (onMessage) onMessage(event);
    };
    
    socket.onerror = (error) => {
      console.error('[WebSocketHandler] Error de conexión:', error);
      if (onError) onError(error);
    };
    
    socket.onclose = (event) => {
      console.log(`[WebSocketHandler] Conexión cerrada. Código: ${event.code}`);
      
      if (onClose) onClose(event);
      
      // Intentar reconectar automáticamente
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`[WebSocketHandler] Intentando reconectar (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        setTimeout(() => {
          initializeWebSocket(url, onMessage, onError, onOpen, onClose);
        }, RECONNECT_INTERVAL * reconnectAttempts);
      } else {
        console.error('[WebSocketHandler] Se alcanzó el máximo de intentos de reconexión');
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
 * Envía un mensaje a través del WebSocket
 * @param {any} data - Datos a enviar
 * @returns {boolean} - true si se envió correctamente, false en caso contrario
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
 * Cierra manualmente la conexión WebSocket
 */
export function closeConnection() {
  if (socket) {
    console.log('[WebSocketHandler] Cerrando conexión manualmente');
    socket.close();
    socket = null;
  }
}

/**
 * Verifica si la conexión WebSocket está abierta
 * @returns {boolean} - true si está conectado, false en caso contrario
 */
export function isConnected() {
  return socket && socket.readyState === WebSocket.OPEN;
}

/**
 * Reinicia los intentos de reconexión
 */
export function resetReconnectAttempts() {
  reconnectAttempts = 0;
}

/**
 * Clase WebSocketHandler para gestionar conexiones WebSocket
 * Proporciona una interfaz orientada a objetos para el manejo de WebSockets
 */
export class WebSocketHandler {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 10;
    this.RECONNECT_INTERVAL = 2000; // 2 segundos
    this.url = '';
    this.onMessageCallback = null;
    this.onErrorCallback = null;
    this.onOpenCallback = null;
    this.onCloseCallback = null;
  }

  /**
   * Conecta al WebSocket
   * @param {string} url - URL del WebSocket
   * @param {Object} callbacks - Callbacks para los eventos
   * @returns {Promise} - Promesa que se resuelve cuando se establece la conexión
   */
  connect(url, callbacks = {}) {
    this.url = url;
    this.onMessageCallback = callbacks.onMessage;
    this.onErrorCallback = callbacks.onError;
    this.onOpenCallback = callbacks.onOpen;
    this.onCloseCallback = callbacks.onClose;

    return new Promise((resolve, reject) => {
      try {
        console.log(`[WebSocketHandler] Iniciando conexión a ${url}`);
        
        // Cerrar socket anterior si existe
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
          this.socket.close();
        }
        
        this.socket = new WebSocket(url);
        
        this.socket.onopen = (event) => {
          console.log('[WebSocketHandler] Conexión establecida');
          this.reconnectAttempts = 0;
          if (this.onOpenCallback) this.onOpenCallback(event);
          resolve(this);
        };
        
        this.socket.onmessage = (event) => {
          if (this.onMessageCallback) this.onMessageCallback(event);
        };
        
        this.socket.onerror = (error) => {
          console.error('[WebSocketHandler] Error de conexión:', error);
          if (this.onErrorCallback) this.onErrorCallback(error);
          // No rechazar para permitir el manejo mediante onClose
        };
        
        this.socket.onclose = (event) => {
          console.log(`[WebSocketHandler] Conexión cerrada. Código: ${event.code}`);
          
          if (this.onCloseCallback) this.onCloseCallback(event);
          
          // Intentar reconectar automáticamente
          if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            console.log(`[WebSocketHandler] Intentando reconectar (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
            
            setTimeout(() => {
              this.connect(this.url, {
                onMessage: this.onMessageCallback,
                onError: this.onErrorCallback,
                onOpen: this.onOpenCallback,
                onClose: this.onCloseCallback
              }).catch(() => {
                // Ignorar errores de reconexión aquí
              });
            }, this.RECONNECT_INTERVAL * this.reconnectAttempts);
          } else {
            console.error('[WebSocketHandler] Se alcanzó el máximo de intentos de reconexión');
            reject(new Error('Máximo de intentos de reconexión alcanzado'));
          }
        };
      } catch (error) {
        console.error('[WebSocketHandler] Error al inicializar WebSocket:', error);
        if (this.onErrorCallback) this.onErrorCallback(error);
        reject(error);
      }
    });
  }

  /**
   * Envía un mensaje a través del WebSocket
   * @param {any} data - Datos a enviar
   * @returns {boolean} - true si se envió correctamente, false en caso contrario
   */
  send(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('[WebSocketHandler] No se puede enviar mensaje: socket no conectado');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('[WebSocketHandler] Error al enviar mensaje:', error);
      return false;
    }
  }

  /**
   * Cierra manualmente la conexión WebSocket
   */
  close() {
    if (this.socket) {
      console.log('[WebSocketHandler] Cerrando conexión manualmente');
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Verifica si la conexión WebSocket está abierta
   * @returns {boolean} - true si está conectado, false en caso contrario
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Reinicia los intentos de reconexión
   */
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}
