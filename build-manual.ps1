# Script para crear manualmente un dist funcional sin depender de npm
$srcDir = "C:\Users\Admin\Documents\abogadowilson\src"
$distDir = "C:\Users\Admin\Documents\abogadowilson\dist"
$publicDir = "C:\Users\Admin\Documents\abogadowilson\public"

# Crear o limpiar el directorio dist
if (Test-Path -Path $distDir) {
    Write-Host "Limpiando directorio dist..." -ForegroundColor Yellow
    Get-ChildItem -Path $distDir -Recurse | Remove-Item -Force -Recurse
} else {
    Write-Host "Creando directorio dist..." -ForegroundColor Yellow
    New-Item -Path $distDir -ItemType Directory -Force | Out-Null
}

# Crear directorios necesarios dentro de dist
$directoriosACrear = @(
    "assets",
    "assets\js",
    "assets\css",
    "assets\images",
    "assets\fonts"
)

foreach ($dir in $directoriosACrear) {
    $rutaCompleta = Join-Path -Path $distDir -ChildPath $dir
    if (-not (Test-Path -Path $rutaCompleta)) {
        Write-Host "Creando directorio: $dir" -ForegroundColor Cyan
        New-Item -Path $rutaCompleta -ItemType Directory -Force | Out-Null
    }
}

# Copiar favicon.svg y otros archivos públicos
Write-Host "Copiando archivos públicos..." -ForegroundColor Green
Copy-Item -Path "$publicDir\*" -Destination $distDir -Recurse -Force -ErrorAction SilentlyContinue

# Crear un index.html optimizado
Write-Host "Creando index.html optimizado..." -ForegroundColor Magenta
$indexHtml = @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Abogado Wilson | Asesoría Legal Profesional</title>
  <meta name="description" content="Asesoría legal profesional en derecho penal, civil, tránsito, comercial y aduanas. Protegiendo sus derechos con experiencia y dedicación en Ecuador.">
  <meta name="keywords" content="abogado, derecho penal, derecho civil, derecho de tránsito, derecho comercial, aduanas, asesoría legal, Ecuador">
  <meta name="author" content="Abogado Wilson">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://abogadowilson.com/">
  <meta property="og:title" content="Abogado Wilson - Asesoría Legal Profesional">
  <meta property="og:description" content="Asesoría legal profesional en derecho penal, civil, tránsito, comercial y aduanas. Protegiendo sus derechos con experiencia y dedicación.">
  <meta property="og:image" content="/assets/images/logo.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Estilos inline para garantizar la carga inmediata -->
  <style>
    :root {
      --primary: #2563eb;
      --primary-dark: #1e40af;
      --text: #1f2937;
      --background: #f9fafb;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    body {
      background-color: var(--background);
      color: var(--text);
      line-height: 1.5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .header {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 1rem 0;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
    }
    .nav {
      display: flex;
      gap: 1.5rem;
    }
    .nav-link {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
    }
    .nav-link:hover {
      color: var(--primary);
    }
    .hero {
      padding: 4rem 0;
      text-align: center;
    }
    .hero h1 {
      font-size: 2.5rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    .hero p {
      font-size: 1.25rem;
      max-width: 800px;
      margin: 0 auto 2rem;
    }
    .button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: var(--primary-dark);
    }
    .services {
      padding: 4rem 0;
    }
    .section-title {
      text-align: center;
      font-size: 2rem;
      color: var(--primary);
      margin-bottom: 2rem;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .service-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 2rem;
      transition: transform 0.2s;
    }
    .service-card:hover {
      transform: translateY(-5px);
    }
    .service-card h3 {
      color: var(--primary);
      margin-bottom: 1rem;
    }
    .testimonials {
      background-color: white;
      padding: 4rem 0;
    }
    .testimonial-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .testimonial-card {
      background-color: var(--background);
      padding: 2rem;
      border-radius: 0.5rem;
    }
    .testimonial-text {
      font-style: italic;
      margin-bottom: 1rem;
    }
    .testimonial-author {
      font-weight: 700;
    }
    .footer {
      background-color: var(--primary);
      color: white;
      padding: 3rem 0 1rem;
    }
    .footer a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
    }
    .footer a:hover {
      color: white;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .footer-column h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    .footer-links {
      list-style: none;
    }
    .footer-links li {
      margin-bottom: 0.5rem;
    }
    .copyright {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      .nav {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }
      .hero h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <a href="/" class="logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" rx="20" fill="#2563eb"/>
          <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" stroke-width="5"/>
          <path d="M40 45 L60 45" stroke="white" stroke-width="5" stroke-linecap="round"/>
          <path d="M40 55 L55 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
        </svg>
        Abogado Wilson
      </a>
      <nav class="nav">
        <a href="/" class="nav-link">Inicio</a>
        <a href="/servicios" class="nav-link">Servicios</a>
        <a href="/nosotros" class="nav-link">Nosotros</a>
        <a href="/blog" class="nav-link">Blog</a>
        <a href="/contacto" class="nav-link">Contacto</a>
      </nav>
    </div>
  </header>
  
  <main>
    <section class="hero">
      <div class="container">
        <h1>Asesoría Legal Profesional</h1>
        <p>Soluciones legales efectivas para proteger tus derechos e intereses. Amplia experiencia en diferentes áreas del derecho con un enfoque personalizado.</p>
        <a href="/contacto" class="button">Solicitar Consulta</a>
      </div>
    </section>
    
    <section class="services">
      <div class="container">
        <h2 class="section-title">Nuestros Servicios</h2>
        <div class="services-grid">
          <div class="service-card">
            <h3>Derecho Civil</h3>
            <p>Asesoramiento y representación en contratos, propiedad, sucesiones y resolución de conflictos civiles con enfoque en resultados.</p>
          </div>
          <div class="service-card">
            <h3>Derecho Penal</h3>
            <p>Defensa completa en procesos penales, con estrategias eficaces y respeto a tus derechos en todas las etapas del proceso.</p>
          </div>
          <div class="service-card">
            <h3>Derecho de Tránsito</h3>
            <p>Representación legal en infracciones, accidentes y todo tipo de incidentes relacionados con el tránsito vehicular.</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="testimonials">
      <div class="container">
        <h2 class="section-title">Lo Que Dicen Nuestros Clientes</h2>
        <div class="testimonial-grid">
          <div class="testimonial-card">
            <p class="testimonial-text">"El Dr. Wilson me brindó una asesoría excepcional en mi caso laboral. Su profesionalismo y conocimiento fueron fundamentales para obtener un resultado favorable."</p>
            <p class="testimonial-author">María González</p>
          </div>
          <div class="testimonial-card">
            <p class="testimonial-text">"Gracias al asesoramiento del Dr. Wilson, pude resolver un complicado tema de herencia que llevaba años sin solución. Altamente recomendado."</p>
            <p class="testimonial-author">Carlos Rodríguez</p>
          </div>
          <div class="testimonial-card">
            <p class="testimonial-text">"Un profesional comprometido con sus clientes. Me guió durante todo el proceso legal con claridad y dedicación. Sin duda, el mejor abogado de la ciudad."</p>
            <p class="testimonial-author">Laura Mendoza</p>
          </div>
        </div>
      </div>
    </section>
  </main>
  
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-column">
          <h3>Abogado Wilson</h3>
          <p>Asesoría legal profesional con amplia experiencia y compromiso con nuestros clientes.</p>
        </div>
        <div class="footer-column">
          <h3>Enlaces</h3>
          <ul class="footer-links">
            <li><a href="/">Inicio</a></li>
            <li><a href="/servicios">Servicios</a></li>
            <li><a href="/nosotros">Nosotros</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Contacto</h3>
          <ul class="footer-links">
            <li>Dirección: Av. Principal 123, Quito</li>
            <li>Teléfono: (02) 123-4567</li>
            <li>Email: info@abogadowilson.com</li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        &copy; 2025 Abogado Wilson - Todos los derechos reservados
      </div>
    </div>
  </footer>
  
  <!-- Agregamos un pequeño JavaScript para manejar la navegación SPA -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Capturar clics en enlaces internos para comportamiento SPA
      document.querySelectorAll('a').forEach(anchor => {
        if (anchor.host === window.location.host) {
          anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const path = this.pathname;
            history.pushState(null, '', path);
            // Aquí se actualizaría el contenido en una SPA real
            // Como es estático, solo recargamos la página
            if (path !== window.location.pathname) {
              window.location.reload();
            }
          });
        }
      });

      // Manejar navegación con botones adelante/atrás
      window.addEventListener('popstate', function() {
        window.location.reload();
      });
    });
  </script>
</body>
</html>
"@

Set-Content -Path (Join-Path -Path $distDir -ChildPath "index.html") -Value $indexHtml -Force

# Crear _routes.json para Cloudflare Workers
Write-Host "Creando _routes.json para Cloudflare Workers..." -ForegroundColor Magenta
$routesJson = @"
{
  "version": 1,
  "include": [
    "/*"
  ],
  "exclude": [
    "/assets/*"
  ],
  "routes": [
    {
      "src": "/favicon.ico",
      "headers": {
        "cache-control": "max-age=86400"
      }
    },
    {
      "src": "/favicon.svg",
      "headers": {
        "cache-control": "max-age=86400"
      }
    },
    {
      "src": "/assets/.*",
      "headers": {
        "cache-control": "max-age=31536000"
      }
    },
    {
      "src": ".*",
      "headers": {
        "content-type": "text/html; charset=utf-8",
        "access-control-allow-origin": "*",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin"
      },
      "continue": true
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
"@

Set-Content -Path (Join-Path -Path $distDir -ChildPath "_routes.json") -Value $routesJson -Force

# Crear un CSS mínimo de respaldo (por si acaso)
Write-Host "Creando archivo CSS de respaldo..." -ForegroundColor Magenta
$cssContent = @"
/* Estilos de respaldo para Abogado Wilson */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --text: #1f2937;
  --background: #f9fafb;
}
body, html {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--background);
  color: var(--text);
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
"@

Set-Content -Path (Join-Path -Path $distDir -ChildPath "assets\css\styles.css") -Value $cssContent -Force

# Crear una imagen de logo sencilla en SVG
Write-Host "Creando logo SVG..." -ForegroundColor Magenta
$logoSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" stroke-width="5"/>
  <path d="M40 45 L60 45" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 55 L55 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
</svg>
"@

Set-Content -Path (Join-Path -Path $distDir -ChildPath "favicon.svg") -Value $logoSvg -Force

Write-Host "Construcción manual completada exitosamente!" -ForegroundColor Green
Write-Host "Los archivos están listos para ser desplegados en Cloudflare Workers." -ForegroundColor Cyan
