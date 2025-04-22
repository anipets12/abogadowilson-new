# Script para copiar componentes y archivos esenciales del proyecto original al actual
$origenDir = "C:\Users\Admin\Documents\abogado-wilson-website"
$destinoDir = "C:\Users\Admin\Documents\abogadowilson"

# Crear directorios clave si no existen
$directorios = @(
    "src\components\Services",
    "src\components\Navigation",
    "src\components\Auth",
    "src\components\Footer",
    "src\components\Testimonials",
    "src\components\Blog",
    "src\components\Contact",
    "src\components\Common",
    "src\components\Consultation",
    "src\components\Newsletter",
    "src\context",
    "public\images",
    "public\assets"
)

foreach ($dir in $directorios) {
    $rutaDestino = Join-Path -Path $destinoDir -ChildPath $dir
    if (-not (Test-Path -Path $rutaDestino)) {
        Write-Host "Creando directorio: $rutaDestino" -ForegroundColor Cyan
        New-Item -Path $rutaDestino -ItemType Directory -Force | Out-Null
    }
}

# Copiar componentes principales
$archivosComponentes = @(
    "src\components\Hero.jsx",
    "src\components\Services.jsx",
    "src\components\Testimonials.jsx",
    "src\components\Blog.jsx",
    "src\components\Header.jsx",
    "src\components\Footer\Footer.jsx",
    "src\components\ProcessSearch.jsx",
    "src\components\Navigation\Navbar.jsx",
    "src\components\Newsletter\Newsletter.jsx",
    "src\components\Services\Penal.jsx",
    "src\components\Services\Civil.jsx",
    "src\components\Services\Comercial.jsx",
    "src\components\Services\Transito.jsx"
)

foreach ($archivo in $archivosComponentes) {
    $origen = Join-Path -Path $origenDir -ChildPath $archivo
    $destino = Join-Path -Path $destinoDir -ChildPath $archivo
    
    if (Test-Path -Path $origen) {
        Write-Host "Copiando: $archivo" -ForegroundColor Yellow
        $dirDestino = Split-Path -Path $destino -Parent
        if (-not (Test-Path -Path $dirDestino)) {
            New-Item -Path $dirDestino -ItemType Directory -Force | Out-Null
        }
        Copy-Item -Path $origen -Destination $destino -Force
    } else {
        Write-Host "Archivo no encontrado: $origen" -ForegroundColor Red
    }
}

# Copiar archivos de contexto (AuthContext, etc.)
$archivosContexto = Get-ChildItem -Path "$origenDir\src\context" -File -Recurse -ErrorAction SilentlyContinue
foreach ($archivo in $archivosContexto) {
    $rutaRelativa = $archivo.FullName.Substring($origenDir.Length)
    $destino = Join-Path -Path $destinoDir -ChildPath $rutaRelativa
    
    Write-Host "Copiando contexto: $rutaRelativa" -ForegroundColor Yellow
    $dirDestino = Split-Path -Path $destino -Parent
    if (-not (Test-Path -Path $dirDestino)) {
        New-Item -Path $dirDestino -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path $archivo.FullName -Destination $destino -Force
}

# Copiar imágenes y assets
$directoriasDeRecursos = @(
    "public",
    "public\images",
    "public\assets"
)

foreach ($dir in $directoriasDeRecursos) {
    $origen = Join-Path -Path $origenDir -ChildPath $dir
    $destino = Join-Path -Path $destinoDir -ChildPath $dir
    
    if (Test-Path -Path $origen) {
        Write-Host "Copiando recursos de $dir" -ForegroundColor Green
        if (-not (Test-Path -Path $destino)) {
            New-Item -Path $destino -ItemType Directory -Force | Out-Null
        }
        
        $archivos = Get-ChildItem -Path $origen -File -ErrorAction SilentlyContinue
        foreach ($archivo in $archivos) {
            Copy-Item -Path $archivo.FullName -Destination $destino -Force
        }
    }
}

# Copiar archivos clave (App.jsx, main.jsx, etc.)
$archivosClave = @(
    "src\App.jsx",
    "src\main.jsx",
    "src\index.css",
    "tailwind.config.js"
)

foreach ($archivo in $archivosClave) {
    $origen = Join-Path -Path $origenDir -ChildPath $archivo
    $destino = Join-Path -Path $destinoDir -ChildPath $archivo
    
    if (Test-Path -Path $origen) {
        Write-Host "Copiando archivo clave: $archivo" -ForegroundColor Magenta
        Copy-Item -Path $origen -Destination $destino -Force
    } else {
        Write-Host "Archivo clave no encontrado: $origen" -ForegroundColor Red
    }
}

Write-Host "¡Copia de componentes completada exitosamente!" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar 'npm run build' para reconstruir la aplicación" -ForegroundColor Cyan
