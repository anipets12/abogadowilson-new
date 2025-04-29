/**
 * Fallback para react-icons/fa
 * Implementación mínima que provee íconos básicos
 */

(function() {
  console.log('[Fallback] Cargando implementación local de react-icons/fa');
  
  // Crear un objeto global para react-icons/fa
  window.ReactIconsFa = window.ReactIconsFa || {};
  
  // Implementación mínima de íconos comunes
  const icons = {
    FaUser: createIconComponent('user', 'M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z'),
    FaHome: createIconComponent('home', 'M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z'),
    FaEnvelope: createIconComponent('envelope', 'M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z'),
  };

  // Hacer disponible globalmente
  window.ReactIcons.fa = FaIcons;

  // Exportar todos los iconos individualmente para compatibilidad con imports nombrados
  Object.keys(FaIcons).forEach(key => {
    exports[key] = FaIcons[key];
  });

  // Notificar que el módulo ha sido cargado
  window.__react_icons_fa__loaded = true;
  console.log('[FallbackModule] react-icons/fa cargado exitosamente (fallback)');

  // Parchear el sistema de imports dinámicos
  if (window.__importMapOverride && window.__importMapOverride.addOverride) {
    window.__importMapOverride.addOverride('react-icons/fa', {
      exports: FaIcons
    });
  }

  // Compatibilidad con sistemas que utilizan default export
  exports.default = FaIcons;
})));

// Definir módulo en formato antiguo para compatibilidad
if (typeof window !== 'undefined') {
  window['react-icons/fa'] = window.ReactIcons.fa;
}
