/**
 * Fallback mu00ednimo para axios
 * Proporciona implementaciu00f3n bu00e1sica para peticiones HTTP
 */

(function() {
  console.log('[Fallback] Cargando implementaciu00f3n local de axios');
  
  // Crear objeto global para axios
  window.axios = createAxiosStub();
  
  function createAxiosStub() {
    // Funciu00f3n principal de axios
    const axios = function(config) {
      return makeRequest(config);
    };
    
    // Mu00e9todos principales
    axios.get = function(url, config) {
      return makeRequest({ ...config, method: 'get', url: url });
    };
    
    axios.post = function(url, data, config) {
      return makeRequest({ ...config, method: 'post', url: url, data: data });
    };
    
    axios.put = function(url, data, config) {
      return makeRequest({ ...config, method: 'put', url: url, data: data });
    };
    
    axios.delete = function(url, config) {
      return makeRequest({ ...config, method: 'delete', url: url });
    };
    
    axios.patch = function(url, data, config) {
      return makeRequest({ ...config, method: 'patch', url: url, data: data });
    };
    
    // Funciu00f3n para crear instancias
    axios.create = function(config) {
      const instance = createAxiosStub();
      instance.defaults = { ...axios.defaults, ...config };
      return instance;
    };
    
    // Interceptores
    axios.interceptors = {
      request: createInterceptorManager(),
      response: createInterceptorManager()
    };
    
    // Valores por defecto
    axios.defaults = {
      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        },
        get: {},
        post: {
          'Content-Type': 'application/json'
        },
        put: {
          'Content-Type': 'application/json'
        },
        patch: {
          'Content-Type': 'application/json'
        }
      },
      timeout: 0,
      withCredentials: false
    };
    
    // Implementaciu00f3n bu00e1sica de peticiones
    function makeRequest(config) {
      console.warn('[Fallback Axios] Haciendo peticiU00E3u00B3n con implementaciu00f3n de respaldo', config);
      
      // Usar Fetch API cuando sea posible
      if (window.fetch) {
        const url = config.url || '';
        const method = (config.method || 'get').toUpperCase();
        const headers = new Headers();
        
        // Configurar headers
        if (config.headers) {
          Object.keys(config.headers).forEach(key => {
            headers.append(key, config.headers[key]);
          });
        }
        
        const fetchOptions = {
          method: method,
          headers: headers,
          credentials: config.withCredentials ? 'include' : 'same-origin'
        };
        
        // Agregar body para mu00e9todos que lo requieren
        if (['POST', 'PUT', 'PATCH'].includes(method) && config.data) {
          let body = config.data;
          
          // Convertir a JSON si no es string
          if (typeof body !== 'string') {
            try {
              body = JSON.stringify(body);
            } catch (e) {
              console.error('[Fallback Axios] Error al convertir datos a JSON', e);
            }
          }
          
          fetchOptions.body = body;
        }
        
        return fetch(url, fetchOptions)
          .then(response => {
            // Crear objeto de respuesta similar a axios
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            return response[isJson ? 'json' : 'text']()
              .then(data => {
                return {
                  data: data,
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers,
                  config: config,
                  request: null
                };
              })
              .catch(err => {
                return {
                  data: null,
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers,
                  config: config,
                  request: null
                };
              });
          })
          .catch(error => {
            console.error('[Fallback Axios] Error en la peticiU00E3u00B3n', error);
            
            // Crear un objeto de error compatible con axios
            const axiosError = new Error('Request failed');
            axiosError.isAxiosError = true;
            axiosError.config = config;
            axiosError.request = null;
            axiosError.response = null;
            
            return Promise.reject(axiosError);
          });
      } else {
        // Fallback para navegadores sin Fetch API usando XMLHttpRequest
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(config.method || 'GET', config.url, true);
          
          // Configurar timeout
          if (config.timeout) {
            xhr.timeout = config.timeout;
          }
          
          // Configurar withCredentials
          if (config.withCredentials) {
            xhr.withCredentials = true;
          }
          
          // Configurar headers
          if (config.headers) {
            Object.keys(config.headers).forEach(key => {
              xhr.setRequestHeader(key, config.headers[key]);
            });
          }
          
          // Manejar eventos
          xhr.onload = function() {
            let response;
            try {
              // Intentar parsear como JSON
              response = JSON.parse(xhr.responseText);
            } catch (e) {
              // Si no es JSON, usar texto plano
              response = xhr.responseText;
            }
            
            resolve({
              data: response,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders()),
              config: config,
              request: xhr
            });
          };
          
          xhr.onerror = function() {
            const error = new Error('Network Error');
            error.config = config;
            error.request = xhr;
            error.isAxiosError = true;
            reject(error);
          };
          
          xhr.ontimeout = function() {
            const error = new Error('Timeout of ' + config.timeout + 'ms exceeded');
            error.config = config;
            error.request = xhr;
            error.isAxiosError = true;
            reject(error);
          };
          
          // Enviar la peticiU00E3u00B3n
          if (config.data) {
            let data = config.data;
            if (typeof data !== 'string') {
              try {
                data = JSON.stringify(data);
              } catch (e) {
                console.error('[Fallback Axios] Error al convertir datos a JSON', e);
              }
            }
            xhr.send(data);
          } else {
            xhr.send();
          }
        });
      }
    }
    
    // Funciones auxiliares
    function createInterceptorManager() {
      const handlers = [];
      
      return {
        use: function(fulfilled, rejected) {
          handlers.push({
            fulfilled: fulfilled,
            rejected: rejected
          });
          return handlers.length - 1;
        },
        eject: function(id) {
          if (handlers[id]) {
            handlers[id] = null;
          }
        },
        handlers: function() {
          return handlers;
        }
      };
    }
    
    function parseHeaders(headerStr) {
      const headers = {};
      const headerPairs = (headerStr || '').split('\r\n');
      
      headerPairs.forEach(function(line) {
        const parts = line.split(': ');
        const key = parts.shift();
        const value = parts.join(': ');
        
        if (key && value) {
          headers[key] = value;
        }
      });
      
      return headers;
    }
    
    return axios;
  }
  
  // Compatibilidad con sistemas de mu00f3dulos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.axios;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return window.axios; });
  }
  
  console.log('[Fallback] axios cargado correctamente');
})();
