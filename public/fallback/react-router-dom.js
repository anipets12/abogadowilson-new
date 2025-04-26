/**
 * Simulaciu00f3n completa de react-router-dom
 * @version 6.20.1
 */

(function() {
  if (window.ReactRouterDOM) return;
  
  const React = window.React || {};
  
  // Componentes principales de React Router DOM
  const BrowserRouter = function(props) {
    return React.createElement('div', props, props.children);
  };
  
  const Routes = function(props) {
    return React.createElement('div', props, props.children);
  };
  
  const Route = function(props) {
    return React.createElement('div', props, props.children);
  };
  
  const Link = function(props) {
    return React.createElement('a', {
      href: props.to,
      className: props.className,
      style: props.style,
      onClick: function(e) {
        e.preventDefault();
        if (typeof props.onClick === 'function') props.onClick(e);
      }
    }, props.children);
  };
  
  const NavLink = function(props) {
    return React.createElement(Link, props, props.children);
  };
  
  // Hooks simulados
  const useNavigate = function() {
    return function(to) {
      console.log(`[ReactRouter] Navegando a: ${to}`);
      if (typeof to === 'string' && to.startsWith('/')) {
        window.location.hash = `#${to}`;
      }
    };
  };
  
  const useParams = function() {
    return {};
  };
  
  const useLocation = function() {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null
    };
  };
  
  const useSearchParams = function() {
    return [new URLSearchParams(window.location.search), function() {}];
  };
  
  const useRoutes = function() {
    return null;
  };
  
  // Simulaciu00f3n del contexto de navegaciu00f3n
  const NavigationContext = React.createContext ? React.createContext(null) : {};
  const LocationContext = React.createContext ? React.createContext(null) : {};
  const RouteContext = React.createContext ? React.createContext(null) : {};
  
  // Exportaciones
  window.ReactRouterDOM = {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    Outlet: function(props) { return React.createElement('div', props); },
    useNavigate,
    useParams,
    useLocation,
    useSearchParams,
    useRoutes,
    useMatch: function() { return null; },
    useResolvedPath: function() { return { pathname: '', search: '', hash: '' }; },
    createRoutesFromChildren: function() { return []; },
    generatePath: function(path) { return path; },
    matchPath: function() { return null; },
    matchRoutes: function() { return null; },
    renderMatches: function() { return null; },
    resolvePath: function(to) { return typeof to === 'string' ? to : ''; },
    NavigationContext,
    LocationContext,
    RouteContext
  };
  
  // Exponer para imports directos
  if (typeof window !== 'undefined') {
    window['react-router-dom'] = window.ReactRouterDOM;
    window['react-router'] = window.ReactRouterDOM;
  }
  
  console.log('[FallbackLoader] ReactRouterDOM simulado cargado correctamente');
})();
