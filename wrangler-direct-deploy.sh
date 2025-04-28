#!/bin/bash

# Script para desplegar directamente a Cloudflare Workers sin depender de GitHub
# Este script usa wrangler para desplegar directamente a Cloudflare

echo "🚀 Despliegue directo a Cloudflare Workers sin GitHub"
echo "===================================================="

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si wrangler está instalado
if ! command -v npx &> /dev/null; then
  echo -e "${RED}❌ Error: npx no está instalado. Instala Node.js primero.${NC}"
  exit 1
fi

# Validación previa al despliegue
echo -e "${YELLOW}⚙️ Realizando verificaciones previas al despliegue...${NC}"

# Verificar archivos críticos
CRITICAL_FILES=("error-free-worker.js" "_routes.json" "wrangler.toml")
for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Error: Archivo crítico $file no encontrado.${NC}"
    exit 1
  fi
done

# Verificar la estructura de directorios
if [ ! -d "public" ] || [ ! -d "src" ]; then
  echo -e "${YELLOW}⚠️ Advertencia: Estructura de directorios incompleta.${NC}"
fi

# Verificar que los fallbacks estén presentes
if [ ! -d "public/fallback" ]; then
  echo -e "${YELLOW}⚠️ Advertencia: Directorio de fallbacks no encontrado, creándolo...${NC}"
  mkdir -p public/fallback
fi

# Construir el proyecto con validaciones
echo -e "${YELLOW}🔨 Construyendo el proyecto...${NC}"
echo -e "${YELLOW}Construyendo el proyecto...${NC}"
npm run build

# Verificar si la construcción fue exitosa
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error: La construcción falló${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Proyecto construido correctamente${NC}"

# Verificar existencia de _routes.json en dist
if [ ! -f "dist/_routes.json" ]; then
  echo -e "${YELLOW}⚠️ _routes.json no encontrado en dist, copiándolo...${NC}"
  cp _routes.json dist/
fi

# Desplegar a Cloudflare Workers con validaciones y manejo de errores
echo -e "${GREEN}🚀 Desplegando a Cloudflare Workers...${NC}"

# Actualizar timestamp para forzar un despliegue limpio
sed -i "s/Updated on .* –/Updated on $(date +"%Y-%m-%d") –/" error-free-worker.js

# Validar wrangler.toml
if grep -q "name = \"abogado-wilson\"" wrangler.toml; then
  echo -e "${GREEN}✅ Configuración de wrangler.toml validada${NC}"
else
  echo -e "${YELLOW}⚠️ Advertencia: Nombre del proyecto no coincide con 'abogado-wilson' en wrangler.toml${NC}"
fi

# Verificar credenciales
if [ -f ".wrangler/config/default.toml" ] || [ -n "$CLOUDFLARE_API_TOKEN" ] || [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo -e "${GREEN}✅ Usando configuración existente de Wrangler${NC}"
else
  # Solicitar token de API y cuenta ID
  echo -e "${YELLOW}No se encontró configuración de Cloudflare.${NC}"
  echo "Por favor, introduce tu token de API de Cloudflare:"
  read -s CF_API_TOKEN
  echo "Por favor, introduce tu Account ID de Cloudflare:"
  read CF_ACCOUNT_ID
  
  # Desplegar usando las credenciales proporcionadas
  export CLOUDFLARE_API_TOKEN=$CF_API_TOKEN
  export CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID
  
  echo -e "${GREEN}Usando credenciales proporcionadas para el despliegue${NC}"
fi

# Realizar despliegue con manejo de errores
echo -e "${GREEN}💾 Ejecutando despliegue final optimizado...${NC}"

# Usar flags para optimización y depuración mejorada
npx wrangler publish --minify --env production 2>&1 | tee deploy-log.txt

# Verificar resultado del despliegue
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo -e "${GREEN}✨ ¡Despliegue completado con éxito! ✨${NC}"
  echo -e "${GREEN}🔗 URL de la aplicación: https://abogado-wilson.anipets12.workers.dev${NC}"
  
  # Extraer URL del log de despliegue (alternativa)
  DEPLOY_URL=$(grep -o 'https://.*workers.dev' deploy-log.txt | head -1)
  if [ ! -z "$DEPLOY_URL" ]; then
    echo -e "${GREEN}🌐 URL alternativa: $DEPLOY_URL${NC}"
  fi
else
  echo -e "${RED}❌ Error en el despliegue. Revisa deploy-log.txt para más información.${NC}"
  exit 1
fi

# Verificación posterior al despliegue
echo -e "${YELLOW}🔍 Realizando verificaciones posteriores al despliegue...${NC}"
sleep 5  # Esperar a que se propague

# Verificar accesibilidad básica del sitio
curl -s -o /dev/null -w "${GREEN}✅ Estado del sitio: %{http_code}${NC}
" https://abogado-wilson.anipets12.workers.dev || echo -e "${RED}❌ No se pudo conectar al sitio desplegado${NC}"

echo -e "${GREEN}👍 Despliegue optimizado finalizado correctamente${NC}"

# Limpiar archivos temporales
rm -f .env.tmp deploy-log.txt

echo ""
echo "===================================================="
echo -e "${GREEN}✅ ¡Despliegue completado sin GitHub!${NC}"
echo ""
echo "Tu aplicación ahora está disponible en tu dominio de Cloudflare Workers."
echo "Puedes verificar el estado del despliegue en el Dashboard de Cloudflare."
