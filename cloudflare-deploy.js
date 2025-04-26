#!/usr/bin/env node

/**
 * Script automatizado de despliegue a Cloudflare Workers
 * Este script se encarga de optimizar el código y desplegarlo automáticamente
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuración
const config = {
  projectDir: __dirname,
  outputDir: path.join(__dirname, 'dist'),
  cloudflareDir: path.join(__dirname, 'workers-site'),
  routesFile: path.join(__dirname, '_routes.json'),
  moduleFixFile: path.join(__dirname, 'public', 'module-fix.js'),
  fallbackDir: path.join(__dirname, 'public', 'fallback')
};

// Asegurarse de que todas las carpetas existan
function ensureDirectories() {
  const dirs = [config.outputDir, config.cloudflareDir, config.fallbackDir];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creando directorio: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Verificar que todos los archivos de respaldo estén presentes
function checkFallbackFiles() {
  const requiredFallbacks = [
    'react-icons-fa.js',
    'framer-motion.js',
    'axios.js',
    'heroicons-react.js',
    'headlessui.js'
  ];
  
  let missingFiles = [];
  
  requiredFallbacks.forEach(file => {
    const filePath = path.join(config.fallbackDir, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  return missingFiles;
}

// Copiar archivos estáticos a la carpeta de distribución
async function copyStaticFiles() {
  const staticFiles = [
    'favicon.ico',
    'favicon.svg',
    'manifest.json',
    'robots.txt',
    'sitemap.xml'
  ];
  
  for (const file of staticFiles) {
    const sourcePath = path.join(config.projectDir, 'public', file);
    const destPath = path.join(config.outputDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copiado ${file} a ${destPath}`);
    } else {
      console.warn(`⚠️ Archivo estático no encontrado: ${sourcePath}`);
    }
  }
}

// Optimizar archivos JS
function optimizeJS() {
  console.log('🔧 Optimizando archivos JavaScript...');
  
  // Leer el archivo module-fix.js para verificar que contiene la función loadFallbackModule
  const moduleFixPath = config.moduleFixFile;
  if (fs.existsSync(moduleFixPath)) {
    let content = fs.readFileSync(moduleFixPath, 'utf8');
    
    // Verificar que todas las funciones críticas estén definidas
    const requiredFunctions = [
      'loadModuleFromCDN',
      'loadFallbackModule',
      'loadLocalFallback'
    ];
    
    const missingFunctions = [];
    requiredFunctions.forEach(func => {
      if (!content.includes(`function ${func}`)) {
        missingFunctions.push(func);
      }
    });
    
    if (missingFunctions.length > 0) {
      console.warn(`⚠️ Funciones faltantes en module-fix.js: ${missingFunctions.join(', ')}`);
    } else {
      console.log('✅ Todas las funciones críticas están presentes en module-fix.js');
    }
  } else {
    console.error('❌ No se encontró module-fix.js');
  }
}

// Verificar rutas de Cloudflare
function verifyCloudflareRoutes() {
  const routesPath = config.routesFile;
  if (fs.existsSync(routesPath)) {
    let routes;
    try {
      routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
      console.log('✅ Archivo _routes.json cargado correctamente');
      
      // Verificar que contiene una sección de "exclude"
      if (!routes.exclude || routes.exclude.length === 0) {
        console.warn('⚠️ La sección "exclude" en _routes.json está vacía o no existe');
      } else {
        console.log(`ℹ️ El archivo _routes.json excluye ${routes.exclude.length} patrones`);
      }
    } catch (error) {
      console.error('❌ Error al parsear _routes.json', error);
    }
  } else {
    console.error('❌ No se encontró el archivo _routes.json');
  }
}

// Ejecutar comandos de despliegue
async function executeDeployCommands() {
  console.log('🚀 Iniciando proceso de construcción y despliegue...');
  
  try {
    console.log('📦 Instalando dependencias...');
    await execPromise('npm install');
    
    console.log('🔧 Construyendo la aplicación...');
    await execPromise('npm run build');
    
    console.log('✅ Aplicación construida correctamente');
    
    // Verificar si las variables de entorno para Cloudflare están configuradas
    if (process.env.CF_API_TOKEN || (process.env.CF_EMAIL && process.env.CF_API_KEY)) {
      console.log('🚀 Desplegando en Cloudflare Workers...');
      try {
        await execPromise('npx wrangler publish');
        console.log('✅ Despliegue en Cloudflare Workers completado correctamente');
      } catch (err) {
        console.error('❌ Error al desplegar en Cloudflare Workers', err);
        console.log('ℹ️ Puedes desplegar manualmente con: npx wrangler publish');
      }
    } else {
      console.log('⚠️ No se encontraron credenciales de Cloudflare');
      console.log('ℹ️ Puedes desplegar manualmente con: npx wrangler publish');
    }
  } catch (error) {
    console.error('❌ Error durante el proceso de construcción', error);
  }
}

// Función principal
async function main() {
  console.log('🔧 Iniciando proceso de optimización y despliegue');
  
  // Verificar directorios
  ensureDirectories();
  
  // Verificar archivos de respaldo
  const missingFallbacks = checkFallbackFiles();
  if (missingFallbacks.length > 0) {
    console.warn(`⚠️ Archivos de respaldo faltantes: ${missingFallbacks.join(', ')}`);
  } else {
    console.log('✅ Todos los archivos de respaldo están presentes');
  }
  
  // Optimizar JS
  optimizeJS();
  
  // Verificar rutas de Cloudflare
  verifyCloudflareRoutes();
  
  // Copiar archivos estáticos
  await copyStaticFiles();
  
  // Ejecutar comandos de despliegue
  await executeDeployCommands();
  
  console.log('\n✅ Proceso completado. La aplicación está lista para ser desplegada en Cloudflare Workers.');
  console.log('Para desplegar manualmente, ejecuta: npx wrangler publish');
}

// Ejecutar el script
main().catch(err => {
  console.error('❌ Error inesperado durante la ejecución del script', err);
  process.exit(1);
});
