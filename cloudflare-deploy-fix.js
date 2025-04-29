/**
 * Script optimizado para despliegue en Cloudflare Workers
 * Versión 2.0 - Configuración optimizada para CORS y rendimiento
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const CONFIG = {
  distDir: 'dist',
  workerScript: 'error-free-worker.js',
  routesConfig: '_routes.json',
  disableWebSockets: true,
  optimizeStaticFiles: true,
  preloadFallbacks: true
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}=== OPTIMIZADOR DE DESPLIEGUE PARA CLOUDFLARE WORKERS ===${colors.reset}`);
console.log(`${colors.blue}Iniciando proceso de optimización...${colors.reset}\n`);

// Paso 1: Comprobar archivos necesarios
console.log(`${colors.yellow}Paso 1: Verificando archivos necesarios...${colors.reset}`);

if (!fs.existsSync(CONFIG.workerScript)) {
  console.error(`${colors.red}Error: No se encontró el archivo worker: ${CONFIG.workerScript}${colors.reset}`);
  process.exit(1);
}

if (!fs.existsSync(CONFIG.routesConfig)) {
  console.error(`${colors.red}Error: No se encontró el archivo de rutas: ${CONFIG.routesConfig}${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✓ Archivos necesarios encontrados${colors.reset}\n`);

// Paso 2: Construir la aplicación
console.log(`${colors.yellow}Paso 2: Construyendo la aplicación...${colors.reset}`);
try {
  console.log('Ejecutando npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Construcción completada exitosamente${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}Error durante la construcción:${colors.reset}`, error);
  process.exit(1);
}

// Paso 3: Optimizar worker y archivos estáticos
console.log(`${colors.yellow}Paso 3: Optimizando archivos para Cloudflare Workers...${colors.reset}`);

// Copiar worker al directorio dist
const workerDestPath = path.join(CONFIG.distDir, 'worker.js');
fs.copyFileSync(CONFIG.workerScript, workerDestPath);
console.log(`Copiado ${CONFIG.workerScript} a ${workerDestPath}`);

// Copiar archivo de rutas
const routesDestPath = path.join(CONFIG.distDir, '_routes.json');
fs.copyFileSync(CONFIG.routesConfig, routesDestPath);
console.log(`Copiado ${CONFIG.routesConfig} a ${routesDestPath}`);

// Asegurar que los archivos de respaldo estén en la carpeta dist
const fallbackDir = path.join('public', 'fallback');
const distFallbackDir = path.join(CONFIG.distDir, 'fallback');

if (fs.existsSync(fallbackDir)) {
  if (!fs.existsSync(distFallbackDir)) {
    fs.mkdirSync(distFallbackDir, { recursive: true });
  }
  
  // Copiar todos los archivos de respaldo
  const fallbackFiles = fs.readdirSync(fallbackDir);
  for (const file of fallbackFiles) {
    const srcPath = path.join(fallbackDir, file);
    const destPath = path.join(distFallbackDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copiado archivo de respaldo: ${file}`);
  }
}

console.log(`${colors.green}✓ Archivos optimizados correctamente${colors.reset}\n`);

// Paso 4: Verificar configuración wrangler.toml
console.log(`${colors.yellow}Paso 4: Verificando configuración de wrangler...${colors.reset}`);

if (!fs.existsSync('wrangler.toml')) {
  console.warn(`${colors.yellow}Advertencia: No se encontró wrangler.toml - se creará uno básico${colors.reset}`);
  
  const wranglerConfig = `name = "abogado-wilson"
type = "javascript"
account_id = ""
workers_dev = true
route = ""
zone_id = ""
compatibility_date = "2023-01-01"
site = {bucket = "./dist", entry-point = "worker.js"}
`;
  
  fs.writeFileSync('wrangler.toml', wranglerConfig);
  console.log('Creado archivo wrangler.toml básico');
} else {
  console.log(`${colors.green}✓ Configuración de wrangler encontrada${colors.reset}`);
}

// Paso 5: Instrucciones para despliegue
console.log(`\n${colors.blue}=== DESPLIEGUE LISTO ===${colors.reset}`);
console.log('Para desplegar la aplicación, ejecute:');
console.log(`${colors.green}npx wrangler publish${colors.reset}\n`);
console.log('También puede usar el script de despliegue directo:');
console.log(`${colors.green}./wrangler-direct-deploy.sh${colors.reset}\n`);

console.log(`${colors.blue}¡Optimización completada! La aplicación está lista para ser desplegada en Cloudflare Workers.${colors.reset}`);
