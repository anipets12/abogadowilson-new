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

# Construir el proyecto
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

# Desplegar a Cloudflare Workers
echo -e "${YELLOW}Desplegando a Cloudflare Workers...${NC}"

# Si hay credenciales de Cloudflare disponibles
if [ -f ".wrangler/config/default.toml" ] || [ -n "$CLOUDFLARE_API_TOKEN" ] || [ -n "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "Usando configuración existente de Wrangler"
  npx wrangler publish
else
  # Solicitar token de API y cuenta ID
  echo -e "${YELLOW}No se encontró configuración de Cloudflare.${NC}"
  echo "Por favor, introduce tu token de API de Cloudflare:"
  read -s CF_API_TOKEN
  echo "Por favor, introduce tu Account ID de Cloudflare:"
  read CF_ACCOUNT_ID
  
  # Guardar temporalmente en variables de entorno
  export CLOUDFLARE_API_TOKEN=$CF_API_TOKEN
  export CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID
  
  # Intentar desplegar
  npx wrangler publish
fi

# Verificar si el despliegue fue exitoso
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Despliegue a Cloudflare Workers completado exitosamente${NC}"
else
  echo -e "${RED}❌ Error: El despliegue a Cloudflare Workers falló${NC}"
  echo -e "${YELLOW}Puedes intentar desplegar manualmente con: npx wrangler publish${NC}"
  exit 1
fi

echo ""
echo "===================================================="
echo -e "${GREEN}✅ ¡Despliegue completado sin GitHub!${NC}"
echo ""
echo "Tu aplicación ahora está disponible en tu dominio de Cloudflare Workers."
echo "Puedes verificar el estado del despliegue en el Dashboard de Cloudflare."
