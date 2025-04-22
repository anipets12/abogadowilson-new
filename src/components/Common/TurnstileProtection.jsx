import React, { useEffect } from 'react';

/**
 * Componente de protección Cloudflare Turnstile
 * Implementación profesional para proteger el sitio contra bots
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.siteKey - Clave de sitio Turnstile
 * @param {Function} props.onVerify - Función callback al verificar
 * @param {string} props.theme - Tema (light/dark/auto)
 */
const TurnstileProtection = ({ 
  siteKey = '0x4AAAAAABDkl--Sw4n_bwmU', 
  onVerify = () => {}, 
  theme = 'light' 
}) => {
  useEffect(() => {
    // Cargar el script de Turnstile si no está ya cargado
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        // Cuando el script está cargado, renderizar el widget
        renderTurnstile();
      };
      
      return () => {
        // Limpiar al desmontar
        document.body.removeChild(script);
      };
    } else {
      // Si ya está cargado, renderizar directamente
      renderTurnstile();
    }
  }, [siteKey]);
  
  // Función para renderizar el widget de Turnstile
  const renderTurnstile = () => {
    if (window.turnstile && document.getElementById('cf-turnstile-container')) {
      window.turnstile.render('#cf-turnstile-container', {
        sitekey: siteKey,
        callback: onVerify,
        theme: theme,
      });
    }
  };
  
  return (
    <div className="my-3">
      <div id="cf-turnstile-container" className="flex justify-center"></div>
      <div className="text-xs text-center mt-1 text-gray-500">
        Protegido por Cloudflare Turnstile
      </div>
    </div>
  );
};

export default TurnstileProtection;
