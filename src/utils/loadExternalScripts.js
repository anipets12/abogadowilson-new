/**
 * Utilidad para cargar scripts externos de manera controlada
 * con sistemas de reintentos y fallbacks incorporados.
 */

// Registro de scripts cargados exitosamente
const loadedScripts = new Set();

/**
 * Carga un script externo con sistema de reintentos integrado
 * @param {string} src - URL del script a cargar
 * @param {Object} options - Opciones de configuración
 * @returns {Promise} - Promesa que se resuelve cuando el script se carga
 */
export const loadScript = (src, options = {}) => {
  const {
    id = src.split('/').pop().replace(/[^a-zA-Z0-9]/g, '-'),
    async = true,
    defer = false,
    timeout = 5000,
    retries = 2,
    onSuccess = () => {},
    onError = () => {},
    fallbackSrc = null
  } = options;
  
  // Si el script ya está cargado, retornar inmediatamente
  if (loadedScripts.has(src)) {
    console.log(`Script ${id} ya está cargado`);
    return Promise.resolve();
  }
  
  // Si ya existe un elemento con este ID, eliminar para evitar duplicados
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }
  
  return new Promise((resolve, reject) => {
    let attempts = 0;
    let timeoutId;
    
    const loadAttempt = () => {
      attempts++;
      console.log(`Intentando cargar script ${id} (intento ${attempts}/${retries + 1})`);
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = async;
      script.defer = defer;
      
      // Controlar timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          console.warn(`Timeout al cargar script ${id}`);
          retry();
        }, timeout);
      }
      
      script.onload = () => {
        clearTimeout(timeoutId);
        console.log(`Script ${id} cargado correctamente`);
        loadedScripts.add(src);
        onSuccess();
        resolve();
      };
      
      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`Error al cargar script ${id}`);
        retry();
      };
      
      document.body.appendChild(script);
    };
    
    const retry = () => {
      if (attempts < retries + 1) {
        console.log(`Reintentando cargar script ${id}...`);
        setTimeout(loadAttempt, 1000); // Esperar 1 segundo antes de reintentar
      } else if (fallbackSrc) {
        // Intentar con URL alternativa
        console.log(`Usando URL alternativa para ${id}`);
        src = fallbackSrc;
        attempts = 0;
        loadAttempt();
      } else {
        const error = new Error(`Falló la carga del script ${id} después de ${attempts} intentos`);
        onError(error);
        reject(error);
      }
    };
    
    // Comenzar carga
    loadAttempt();
  });
};

/**
 * Carga específica del script de Binance Pay
 */
export const loadBinancePayScript = () => {
  return loadScript('https://public.bnbstatic.com/static/js/binancepay.js', {
    id: 'binance-pay-script',
    timeout: 8000,
    retries: 3,
    onError: () => {
      console.log('Activando fallback para Binance Pay');
      // Si falla la carga, activar el fallback
      if (window.__FALLBACK_APIS && window.__FALLBACK_APIS.BinancePay) {
        window.BinancePay = window.__FALLBACK_APIS.BinancePay;
      }
    }
  });
};

/**
 * Carga el script de Supabase
 */
export const loadSupabaseScript = () => {
  return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/dist/umd/supabase.min.js', {
    id: 'supabase-script',
    timeout: 5000,
    retries: 2,
    fallbackSrc: 'https://unpkg.com/@supabase/supabase-js@2.38.4/dist/umd/supabase.min.js',
    onError: () => {
      console.log('Activando fallback para Supabase');
      // Si falla la carga, activar el fallback
      if (window.__FALLBACK_APIS && window.__FALLBACK_APIS.supabase) {
        window.supabaseClient = window.__FALLBACK_APIS.supabase;
      }
    }
  });
};

// Exportar utilitarios
export default {
  loadScript,
  loadBinancePayScript,
  loadSupabaseScript
};
