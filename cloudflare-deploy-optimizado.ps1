# Script de despliegue optimizado para Cloudflare Workers
# Incluye todas las mejoras y correcciones implementadas
# Autor: Cascade - Abril 2025

Write-Host "===== Iniciando proceso de despliegue optimizado para Abogado Wilson =====" -ForegroundColor Cyan

# Verificar que Node.js y npm estén instalados
$nodeVersion = node --version
$npmVersion = npm --version

if (-not $nodeVersion -or -not $npmVersion) {
    Write-Host "ERROR: Node.js y npm son requeridos para el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "npm: $npmVersion" -ForegroundColor Green

# Verificar que Wrangler esté instalado
$wranglerVersion = wrangler --version

if (-not $wranglerVersion) {
    Write-Host "Instalando Wrangler globalmente..." -ForegroundColor Yellow
    npm install -g wrangler
} else {
    Write-Host "Wrangler: $wranglerVersion" -ForegroundColor Green
}

# Preparar archivos estáticos
Write-Host "Preparando archivos para despliegue..." -ForegroundColor Cyan

# Asegurar que la carpeta dist exista
if (-not (Test-Path -Path "dist")) {
    mkdir dist
}

# Asegurar que _routes.json esté en la carpeta dist
if (Test-Path -Path "_routes.json") {
    Copy-Item "_routes.json" -Destination "dist\" -Force
    Write-Host "Copiado _routes.json a la carpeta dist" -ForegroundColor Green
}

# Asegurar que el directorio functions exista correctamente
if (-not (Test-Path -Path "functions\api\config")) {
    Write-Host "Creando estructura de directorios para funciones..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "functions\api\config"
}

# Construir la aplicación
Write-Host "Construyendo la aplicación para producción..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La construcción ha fallado. Verifica los errores y solucionalos." -ForegroundColor Red
    exit 1
}

# Desplegar a Cloudflare Workers
Write-Host "Desplegando a Cloudflare Workers..." -ForegroundColor Cyan

# Verificar si el usuario está autenticado en Wrangler
$wranglerAuth = wrangler whoami 2>&1

if ($wranglerAuth -like "*You are not logged in*") {
    Write-Host "Es necesario iniciar sesión en Cloudflare. Ejecuta 'wrangler login'" -ForegroundColor Yellow
    wrangler login
}

# Desplegar con Wrangler
Write-Host "Iniciando despliegue con Wrangler..." -ForegroundColor Cyan
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: El despliegue ha fallado. Verifica los errores de Wrangler." -ForegroundColor Red
    exit 1
}

Write-Host "===== Despliegue completado exitosamente =====" -ForegroundColor Green
Write-Host "La aplicación debería estar disponible en: https://abogado-wilson.anipets12.workers.dev" -ForegroundColor Cyan
Write-Host "Verifica las siguientes funcionalidades:" -ForegroundColor Yellow
Write-Host "1. Endpoints de configuración (/api/config, /config.js)" -ForegroundColor Yellow
Write-Host "2. Componente ProtectedDownload" -ForegroundColor Yellow
Write-Host "3. Carga de fuentes de Google sin errores CSP" -ForegroundColor Yellow
Write-Host "4. Conexión correcta con Supabase" -ForegroundColor Yellow

# Instrucciones para solución de problemas
Write-Host "Si encuentras problemas, consulta DEPLOY_INSTRUCTIONS_UPDATED.md" -ForegroundColor Magenta
