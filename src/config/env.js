/**
 * Configuración segura de variables de entorno
 * Este archivo gestiona el acceso a las variables de entorno sin exponerlas directamente
 */

const getEnvVariable = (key, defaultValue = undefined) => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    console.warn(`Variable de entorno ${key} no definida`);
  }
  return value;
};

const config = {
  // Configuración de base de datos
  database: {
    url: getEnvVariable('DATABASE_URL'),
    jwtSecret: getEnvVariable('JWT_SECRET', 'default_jwt_secret_for_dev'),
    tursoUrl: getEnvVariable('TURSO_DATABASE_URL'),
    tursoToken: getEnvVariable('TURSO_AUTH_TOKEN'),
  },
  
  // Configuración de Cloudflare
  cloudflare: {
    accountId: getEnvVariable('CLOUDFLARE_ACCOUNT_ID'),
    apiToken: getEnvVariable('CLOUDFLARE_API_TOKEN'),
    kvNamespaceId: getEnvVariable('KV_NAMESPACE_ID'),
    d1DatabaseId: getEnvVariable('D1_DATABASE_ID'),
    turnstileSiteKey: getEnvVariable('TURNSTILE_SITE_KEY', '0x4AAAAAABDkl--Sw4n_bwmU'),
    turnstileSecretKey: getEnvVariable('TURNSTILE_SECRET_KEY'),
  },
  
  // Configuración de Supabase
  supabase: {
    url: getEnvVariable('SUPABASE_URL', 'https://phzldiaohelbyobhjrnc.supabase.co'),
    key: getEnvVariable('SUPABASE_KEY'),
  },
  
  // Configuración de APIs externas
  apis: {
    openrouterKey: getEnvVariable('OPENROUTER_API_KEY'),
    notionKey: getEnvVariable('NOTION_API_KEY'),
    notionDatabaseId: getEnvVariable('NOTION_DATABASE_ID'),
    n8nWebhookUrl: getEnvVariable('N8N_WEBHOOK_URL', 'https://n8nom.onrender.com/webhook/1cfd2baa-f5ec-4bc4-a99d-dfb36793eabd'),
    n8nApiKey: getEnvVariable('N8N_API_KEY'),
  },
  
  // Configuración general de la aplicación
  app: {
    corsOrigin: getEnvVariable('CORS_ORIGIN', '*'),
    environment: getEnvVariable('NODE_ENV', 'development'),
    port: getEnvVariable('PORT', '3000'),
  },
  
  // Configuración social
  social: {
    whatsappNumber: getEnvVariable('WHATSAPP_NUMBER', '+59398835269'),
    facebookPage: getEnvVariable('FACEBOOK_PAGE', 'https://www.facebook.com/share/1AF7jU97kh/'),
    twitterHandle: getEnvVariable('TWITTER_HANDLE', '@wilsonelm'),
    email: getEnvVariable('CONTACT_EMAIL', 'Wifirmalegal@gmail.com'),
  }
};

export default config;
