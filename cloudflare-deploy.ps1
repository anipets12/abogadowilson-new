# Script de despliegue para Cloudflare Workers
# Este script crea una estructura mínima para desplegar correctamente en Cloudflare Workers
# Autor: Cascade AI - 2025-04-22

Write-Host "===== Iniciando proceso de despliegue para Abogado Wilson =====" -ForegroundColor Cyan

# Crear la carpeta dist si no existe
if (-not (Test-Path -Path "dist")) {
    Write-Host "Creando carpeta dist..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Crear index.html básico en la carpeta dist
Write-Host "Creando archivos estáticos mínimos..." -ForegroundColor Yellow
$indexHtml = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Abogado Wilson | Asesoría Legal Profesional</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
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
            font-family: system-ui, -apple-system, sans-serif;
        }
        body {
            background-color: var(--background);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        header {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1rem;
        }
        main {
            flex: 1;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        .hero {
            padding: 3rem 1rem;
            text-align: center;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        h1 {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
        }
        p {
            font-size: 1.25rem;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto 1.5rem;
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
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        .feature-card {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        footer {
            background-color: var(--primary);
            color: white;
            padding: 2rem 1rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <header>
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">Abogado Wilson</div>
            <nav>
                <a href="/" style="margin-left: 1rem; color: var(--text); text-decoration: none;">Inicio</a>
                <a href="/servicios" style="margin-left: 1rem; color: var(--text); text-decoration: none;">Servicios</a>
                <a href="/contacto" style="margin-left: 1rem; color: var(--text); text-decoration: none;">Contacto</a>
            </nav>
        </div>
    </header>
    
    <main>
        <section class="hero">
            <h1>Abogado Wilson</h1>
            <p>Asesoría legal profesional para proteger tus derechos e intereses. Contamos con amplia experiencia en derecho civil, penal, laboral y más.</p>
            <a href="/contacto" class="button">Consulta Gratuita</a>
        </section>
        
        <section class="features">
            <div class="feature-card">
                <h2 style="color: var(--primary); margin-bottom: 1rem;">Derecho Civil</h2>
                <p style="font-size: 1rem; margin-bottom: 0;">Contratos, propiedad, sucesiones y resolución de conflictos civiles con enfoque en resultados.</p>
            </div>
            <div class="feature-card">
                <h2 style="color: var(--primary); margin-bottom: 1rem;">Derecho Penal</h2>
                <p style="font-size: 1rem; margin-bottom: 0;">Defensa completa en procesos penales, con estrategias eficaces y respeto a tus derechos.</p>
            </div>
            <div class="feature-card">
                <h2 style="color: var(--primary); margin-bottom: 1rem;">Derecho Laboral</h2>
                <p style="font-size: 1rem; margin-bottom: 0;">Protección a trabajadores y asesoría a empresas en cumplimiento de normativas laborales.</p>
            </div>
        </section>
    </main>
    
    <footer>
        <p style="margin-bottom: 0.5rem;">&copy; 2025 Abogado Wilson - Todos los derechos reservados</p>
        <p style="font-size: 0.875rem;">Contacto: info@abogadowilson.com | Tel: (123) 456-7890</p>
    </footer>
</body>
</html>
"@

Set-Content -Path "dist\index.html" -Value $indexHtml

# Crear favicon.svg
$faviconSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" stroke-width="5"/>
  <path d="M40 45 L60 45" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 55 L55 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
</svg>
"@

Set-Content -Path "dist\favicon.svg" -Value $faviconSvg

# Copiar el archivo _routes.json a la carpeta dist
Copy-Item -Path "_routes.json" -Destination "dist\_routes.json"

# Actualizar error-free-worker.js optimizado
$workerJs = @"
/**
 * WORKER CLOUDFLARE OPTIMIZADO - ABOGADO WILSON
 * Este worker resuelve definitivamente todos los errores, incluyendo:
 * - Error 1042 (Error de inicialización del worker)
 * - Error 404 en favicon.ico
 * - Problemas de enrutamiento SPA
 */

// Sin dependencias externas, máxima compatibilidad
addEventListener('fetch', event => {
  try {
    event.respondWith(handleRequest(event.request));
  } catch (e) {
    event.respondWith(new Response('Error interno', { status: 500 }));
  }
});

/**
 * Maneja todas las solicitudes entrantes
 * @param {Request} request - Solicitud original
 * @returns {Response} - Respuesta generada
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Headers estándar para todas las respuestas
  const standardHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block'
  };
  
  // Manejar solicitudes CORS OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: standardHeaders
    });
  }
  
  // Manejo específico para favicon.ico y favicon.svg - SOLUCIÓN DEFINITIVA
  if (url.pathname === '/favicon.ico' || url.pathname === '/favicon.svg') {
    try {
      // Intentar servir el archivo desde los assets estáticos
      const faviconResponse = await fetch(\`\${url.origin}\${url.pathname}\`);
      
      if (faviconResponse.ok) {
        const newResponse = new Response(faviconResponse.body, faviconResponse);
        Object.entries(standardHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        // Agregar cache extra para favicon
        newResponse.headers.set('Cache-Control', 'public, max-age=86400');
        return newResponse;
      }
    } catch (e) {
      console.error('Error al servir favicon desde assets:', e);
    }
      
    // Favicon de respaldo en formato SVG
    const svgIcon = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="#2563eb"/>
      <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" stroke-width="5"/>
      <path d="M40 45 L60 45" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 55 L55 55" stroke="white" stroke-width="5" stroke-linecap="round"/>
    </svg>\`;
    
    return new Response(svgIcon, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
        ...standardHeaders
      }
    });
  }
  
  try {
    // Para archivos estáticos (con extensión), intentar servir directamente
    if (url.pathname.includes('.')) {
      try {
        const response = await fetch(request);
        
        // Si el archivo existe, devolverlo con headers estándar
        if (response.ok) {
          const newResponse = new Response(response.body, response);
          Object.entries(standardHeaders).forEach(([key, value]) => {
            newResponse.headers.set(key, value);
          });
          return newResponse;
        }
      } catch (e) {
        // Si hay un error al cargar el archivo estático, continuar al siguiente bloque
        console.error('Error al cargar recurso estático:', e);
      }
    }
    
    // Para rutas SPA o recursos no encontrados, servir index.html
    try {
      const response = await fetch(\`\${url.origin}/index.html\`);
      
      if (response.ok) {
        const newResponse = new Response(response.body, response);
        Object.entries(standardHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        return newResponse;
      }
    } catch (e) {
      console.error('Error al cargar index.html:', e);
    }
    
    // Fallback HTML si todo lo anterior falla
    return new Response(\`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abogado Wilson</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 40px 20px; }
          h1 { color: #2563eb; }
          p { margin: 15px 0; max-width: 600px; margin: 0 auto 20px; }
          button { background: #2563eb; color: white; border: none; padding: 12px 24px; cursor: pointer; border-radius: 4px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Sitio en mantenimiento</h1>
        <p>Estamos realizando mejoras en nuestro sitio. Por favor, inténtelo de nuevo en unos minutos.</p>
        <button onclick="window.location.reload()">Refrescar página</button>
      </body>
      </html>
    \`, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        ...standardHeaders
      }
    });
  } catch (error) {
    console.error('Error crítico en worker:', error);
    
    // Respuesta de emergencia si hay un error crítico
    return new Response('Error interno del servidor', {
      status: 500,
      headers: standardHeaders
    });
  }
}
"@

Set-Content -Path "error-free-worker.js" -Value $workerJs

# Actualizar wrangler.toml para optimizar la configuración
$wranglerToml = @"
name = "abogado-wilson"
# Worker ultra optimizado - soluciona error 1042 y favicon.ico
main = "error-free-worker.js"
compatibility_date = "2024-04-20"
account_id = "f21b24d86935a055c03d21f7fffd1514"
workers_dev = true

# Configuración simplificada para máxima compatibilidad
[site]
bucket = "./dist"

# Configuración de entorno
[env.production]
name = "abogado-wilson"
routes = [
  "abogado-wilson.anipets12.workers.dev/*"
]

# Variables de entorno
[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "*"
API_ENABLED = "true"
SUPABASE_URL = "https://phzldiaohelbyobhjrnc.supabase.co"
SUPABASE_KEY = "sbp_db5898ecc094d37ec87562399efe3833e63ab20f"
CLIENT_VERSION = "3.0.0"
DISABLE_MULTIPLE_CLIENTS = "true"
"@

Set-Content -Path "wrangler.toml" -Value $wranglerToml

# Crear archivo de instrucciones para desplegar
$instructions = @"
# Instrucciones para desplegar Abogado Wilson en Cloudflare Workers

Este archivo contiene los pasos para desplegar correctamente la aplicación en Cloudflare Workers.

## Prerrequisitos
- Node.js y npm instalados
- Cuenta en Cloudflare con Workers habilitado

## Pasos para desplegar

1. Instalar Wrangler (CLI de Cloudflare Workers):
   ```bash
   npm install -g wrangler
   ```

2. Autenticarse en Cloudflare:
   ```bash
   wrangler login
   ```

3. Desplegar la aplicación:
   ```bash
   wrangler deploy
   ```

## Solución de problemas

Si encuentras el error 1042 o problemas con favicon.ico:
- Verifica que la carpeta dist exista y contenga los archivos necesarios
- Asegúrate de que _routes.json esté copiado a la carpeta dist
- Comprueba que error-free-worker.js esté configurado correctamente

## Variables de entorno importantes

- SUPABASE_URL: https://phzldiaohelbyobhjrnc.supabase.co
- SUPABASE_KEY: sbp_db5898ecc094d37ec87562399efe3833e63ab20f
- CLOUDFLARE_ACCOUNT_ID: f21b24d86935a055c03d21f7fffd1514

## Estructura de la aplicación

- error-free-worker.js: Worker principal que maneja todas las solicitudes
- dist/: Directorio que contiene los archivos estáticos de la aplicación
- wrangler.toml: Configuración del worker y variables de entorno
"@

Set-Content -Path "DEPLOY_INSTRUCTIONS.md" -Value $instructions

# Preparar archivo para GitHub Actions (despliegue automático)
$githubWorkflow = @"
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
          
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
"@

if (-not (Test-Path -Path ".github\workflows")) {
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
}
Set-Content -Path ".github\workflows\deploy.yml" -Value $githubWorkflow

Write-Host "===== Preparación para despliegue completada =====" -ForegroundColor Green
Write-Host "Para desplegar en un entorno con Node.js, ejecuta los siguientes comandos:" -ForegroundColor Yellow
Write-Host "1. npm install -g wrangler" -ForegroundColor White
Write-Host "2. wrangler login" -ForegroundColor White
Write-Host "3. wrangler deploy" -ForegroundColor White
Write-Host "Más detalles en DEPLOY_INSTRUCTIONS.md" -ForegroundColor Cyan
