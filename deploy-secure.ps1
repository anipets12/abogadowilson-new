# Script profesional de despliegue seguro para Abogado Wilson
# Autor: Cascade AI - 2025-04-22

Write-Host "🔐 Iniciando despliegue seguro del proyecto Abogado Wilson..." -ForegroundColor Cyan

# Verificar si existe un archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️ Archivo .env no encontrado. Creando uno basado en .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "❌ No se encontró .env.example. Creando .env básico..." -ForegroundColor Red
        Set-Content -Path ".env" -Value "# Variables de entorno para Abogado Wilson`n# Creado: $(Get-Date -Format 'yyyy-MM-dd')`n"
    }
}

# Solicitar credenciales necesarias
function Get-SecureInput {
    param(
        [string]$name,
        [string]$envVar,
        [string]$defaultVal
    )

    $currentValue = ""
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        foreach ($line in $envContent) {
            if ($line -match "^$envVar=(.*)$") {
                $currentValue = $matches[1]
                break
            }
        }
    }

    if ([string]::IsNullOrEmpty($currentValue)) {
        $currentValue = $defaultVal
    }

    if ([string]::IsNullOrEmpty($currentValue)) {
        $input = Read-Host "Ingresa $name"
        return $input
    }
    else {
        $input = Read-Host "Ingresa $name (Enter para usar valor existente)"
        if ([string]::IsNullOrEmpty($input)) {
            return $currentValue
        }
        return $input
    }
}

# Solicitar credenciales esenciales
$cloudflareToken = Get-SecureInput -name "token de API de Cloudflare" -envVar "CLOUDFLARE_API_TOKEN" -defaultVal $env:CLOUDFLARE_API_TOKEN
$supabaseKey = Get-SecureInput -name "clave API de Supabase" -envVar "SUPABASE_KEY" -defaultVal $env:SUPABASE_KEY

# Guardar credenciales de forma segura
$env:CLOUDFLARE_API_TOKEN = $cloudflareToken
$env:SUPABASE_KEY = $supabaseKey

# Compilar la aplicación
Write-Host "🛠️ Compilando la aplicación..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error durante la compilación" -ForegroundColor Red
    exit 1
}

# Configurar secretos en Cloudflare Workers
Write-Host "🔒 Configurando secretos en Cloudflare Workers..." -ForegroundColor Cyan

# Usando el CLI de Wrangler para configurar secretos
function Set-CloudflareSecret {
    param(
        [string]$secretName,
        [string]$secretValue
    )
    
    if (-not [string]::IsNullOrEmpty($secretValue)) {
        $secretValue | npx wrangler secret put $secretName
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Secreto $secretName configurado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "⚠️ No se pudo configurar el secreto $secretName" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⏩ Omitiendo configuración del secreto $secretName (valor vacío)" -ForegroundColor Yellow
    }
}

# Configurar secretos principales
Set-CloudflareSecret -secretName "SUPABASE_KEY" -secretValue $supabaseKey
Set-CloudflareSecret -secretName "CLOUDFLARE_API_TOKEN" -secretValue $cloudflareToken
Set-CloudflareSecret -secretName "JWT_SECRET" -secretValue (Get-SecureInput -name "clave secreta JWT" -envVar "JWT_SECRET" -defaultVal "abogadowilsonsecretkeyforsecuritytokens2025")

# Desplegar a Cloudflare Workers
Write-Host "🚀 Desplegando a Cloudflare Workers..." -ForegroundColor Cyan
npx wrangler publish

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sitio desplegado exitosamente" -ForegroundColor Green
    Write-Host "🌐 Visita https://abogado-wilson.anipets12.workers.dev para ver el sitio en vivo" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error durante el despliegue" -ForegroundColor Red
    exit 1
}

# Realizar push al repositorio GitHub
$pushToGithub = Read-Host "¿Deseas hacer push de los cambios a GitHub? (s/n)"
if ($pushToGithub -eq "s") {
    Write-Host "📦 Realizando push a GitHub..." -ForegroundColor Cyan
    
    git add .
    git commit -m "Actualización: $(Get-Date -Format 'yyyy-MM-dd HH:mm') - Despliegue a Cloudflare Workers"
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push a GitHub completado exitosamente" -ForegroundColor Green
        Write-Host "🔗 Repositorio: https://github.com/anipets12/abogadowilson-new" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error durante el push a GitHub" -ForegroundColor Red
    }
}

Write-Host "🎉 Proceso de despliegue completo" -ForegroundColor Green
