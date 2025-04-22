# Instrucciones de Despliegue Actualizadas - Abogado Wilson

Esta guía contiene las instrucciones actualizadas para desplegar la aplicación Abogado Wilson en Cloudflare Workers, tras las mejoras implementadas para resolver los problemas detectados.

## Pre-requisitos

- Node.js v18 o superior
- npm v9 o superior
- Una cuenta de Cloudflare con Workers habilitados
- Las credenciales de API configuradas para Cloudflare

## Pasos para el Despliegue

### 1. Instalación de Dependencias

```bash
# Instalar wrangler globalmente
npm install -g wrangler

# Instalar dependencias del proyecto
npm install
```

### 2. Configuración del Entorno

Configura las variables de entorno necesarias:

```bash
# Iniciar sesión en Cloudflare
wrangler login

# Asegúrate de que el archivo wrangler.toml está correctamente configurado
# con tu ID de cuenta y nombre de proyecto
```

### 3. Compilación para Producción

```bash
# Compilar la aplicación para producción
npm run build
```

### 4. Despliegue en Cloudflare Workers

```bash
# Desplegar utilizando wrangler
wrangler deploy
```

## Verificación Post-despliegue

Después del despliegue, verifica las siguientes funcionalidades:

1. **API de Configuración**: Verifica que los endpoints `/api/config` y `/config.js` estén funcionando
2. **Componente ProtectedDownload**: Confirma que no aparezcan errores relacionados con "ProtectedDownload is not defined"
3. **Carga de Recursos**: Verifica que las fuentes de Google se carguen correctamente sin errores de CSP
4. **Supabase**: Confirma la conexión exitosa con la base de datos Supabase

## Solución de Problemas Comunes

- **Errores de CSP**: Los headers Content-Security-Policy han sido actualizados para permitir fuentes externas
- **Errores de APIs**: Se han implementado endpoints de configuración en múltiples rutas para mayor robustez
- **Componentes no encontrados**: Se ha verificado que todos los componentes estén correctamente importados

## Actualizaciones Implementadas

Las siguientes mejoras se han implementado para resolver los problemas detectados:

1. **Múltiples Endpoints de Configuración**:
   - `/api/config` - Endpoint principal
   - `/api/config/` - Endpoint alternativo
   - `/config` - Endpoint directo
   - `/config.js` - Endpoint compatible con JS

2. **Mejoras en Encabezados CSP**:
   - Se han configurado encabezados que permiten fuentes de Google
   - Se ha mejorado el soporte para scripts externos necesarios

3. **Correcciones de Componentes**:
   - Se ha asegurado que `ProtectedDownload` y otros componentes estén correctamente importados
   - Se ha implementado la protección Turnstile contra bots

## Personalización Adicional

- **Variables de Entorno**: Puedes personalizar las claves API y configuraciones en el archivo `_worker.js`
- **Protección Turnstile**: La clave del sitio de Turnstile puede cambiarse en `TurnstileProtection.jsx`

## Responsables del Mantenimiento

El equipo técnico de Abogado Wilson es responsable del mantenimiento de esta aplicación.
Para preguntas técnicas o asistencia, contacta a:

- Email: soporte@abogadowilson.com
- WhatsApp: +59398835269
