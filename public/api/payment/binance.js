// API para manejar pagos de Binance Pay

const MERCHANT_ID = '549755069';
const API_KEY = 'dummy_key_for_dev'; // En producción usar variables de entorno
const API_SECRET = 'dummy_secret_for_dev'; // En producción usar variables de entorno

async function handleRequest(req) {
  // Simulación de respuesta para desarrollo
  if (req.url.includes('/create')) {
    return createPayment(req);
  } else if (req.url.includes('/query')) {
    return queryPayment(req);
  } else {
    return new Response(JSON.stringify({
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function createPayment(req) {
  try {
    // En producción, esta lógica debe estar en el servidor
    // Aquí simulamos una respuesta exitosa
    const prepayId = `BP${Date.now()}${Math.floor(Math.random() * 1000000)}`;
    
    return new Response(JSON.stringify({
      code: 'SUCCESS',
      data: {
        prepayId: prepayId,
        terminalType: 'WEB',
        expireTime: Date.now() + 3600000, // 1 hora de validez
        qrCodeUrl: `https://example.com/fake-qr-code/${prepayId}`,
        checkoutUrl: `https://example.com/checkout/${prepayId}`,
        deeplink: `binancepay://checkout?prepayId=${prepayId}`
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      code: 'ERROR',
      message: error.message || 'Error creating payment'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function queryPayment(req) {
  try {
    // Simular respuesta de consulta
    return new Response(JSON.stringify({
      code: 'SUCCESS',
      data: {
        status: 'PAID',
        orderAmount: 100.00,
        currency: 'USDT',
        paidAmount: 100.00,
        transactionId: `TX${Date.now()}`
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      code: 'ERROR',
      message: error.message || 'Error querying payment'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Exportar para entornos donde se usa como módulo
if (typeof addEventListener !== 'undefined') {
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
}

if (typeof module !== 'undefined') {
  module.exports = { handleRequest };
}
