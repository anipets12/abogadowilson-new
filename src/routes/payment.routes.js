/**
 * Rutas para manejar pagos en el servidor de la aplicación
 * Este archivo sirve como puente entre el cliente y los servicios de pago
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Configuración
const BINANCE_API_URL = 'https://bpay.binanceapi.com/binancepay/openapi/v2';
let BINANCE_API_KEY, BINANCE_API_SECRET, BINANCE_MERCHANT_ID;

// Cargar configuración del entorno
try {
  BINANCE_API_KEY = process.env.BINANCE_API_KEY || 'dummy_key_for_dev';
  BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || 'dummy_secret_for_dev';
  BINANCE_MERCHANT_ID = process.env.BINANCE_MERCHANT_ID || '549755069';
} catch (error) {
  console.error('Error al cargar las variables de entorno:', error);
}

// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  console.error('Error en la ruta de pagos:', err);
  res.status(500).json({
    success: false,
    error: 'Error al procesar la solicitud',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Crea un pago con Binance Pay
 */
router.post('/binance/create', async (req, res, next) => {
  try {
    const { merchantTradeNo, orderAmount, currency = 'USDT', orderSummary, returnUrl, cancelUrl, orderDescription } = req.body;
    
    // Validación básica
    if (!merchantTradeNo || !orderAmount) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos'
      });
    }
    
    // En entorno de desarrollo, simulamos una respuesta exitosa
    if (process.env.NODE_ENV === 'development' || !BINANCE_API_KEY) {
      console.log('[DEV] Simulando creación de pago Binance:', req.body);
      
      const prepayId = `BP${Date.now()}${Math.floor(Math.random() * 1000000)}`;
      
      return res.json({
        success: true,
        prepayId: prepayId,
        terminalType: 'WEB',
        expireTime: Date.now() + 3600000, // 1 hora de validez
        qrCodeUrl: `https://example.com/fake-qr-code/${prepayId}`,
        checkoutUrl: `https://example.com/checkout/${prepayId}`,
        deeplink: `binancepay://checkout?prepayId=${prepayId}`
      });
    }
    
    // En producción, realizamos la solicitud a Binance Pay
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const payload = {
      env: {
        terminalType: 'WEB'
      },
      merchantTradeNo,
      orderAmount,
      currency,
      goods: {
        goodsType: 'VIRTUAL',
        goodsCategory: 'SERVICES',
        referenceGoodsId: 'legal-services',
        goodsName: orderSummary || 'Servicios Legales',
        goodsDetail: orderDescription || 'Servicios profesionales legales'
      },
      returnUrl,
      cancelUrl,
      webhookUrl: `${process.env.API_BASE_URL || 'https://api.abogadowilson.com'}/payment/binance/webhook`
    };
    
    const payloadString = JSON.stringify(payload);
    
    // Generar firma para la solicitud
    const signature = crypto
      .createHmac('sha512', BINANCE_API_SECRET)
      .update(`${timestamp}\n${nonce}\n${payloadString}\n`)
      .digest('hex');
    
    const headers = {
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': BINANCE_API_KEY,
      'BinancePay-Signature': signature,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(`${BINANCE_API_URL}/order`, payloadString, { headers });
    
    // Verificar respuesta
    if (response.data && response.data.status === 'SUCCESS' && response.data.data) {
      return res.json(response.data.data);
    } else {
      throw new Error(response.data.errorMessage || 'Error desconocido de Binance Pay');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Consulta el estado de un pago en Binance Pay
 */
router.post('/binance/query', async (req, res, next) => {
  try {
    const { merchantTradeNo } = req.body;
    
    // Validación básica
    if (!merchantTradeNo) {
      return res.status(400).json({
        success: false,
        error: 'Falta el número de orden'
      });
    }
    
    // En entorno de desarrollo, simulamos una respuesta exitosa
    if (process.env.NODE_ENV === 'development' || !BINANCE_API_KEY) {
      console.log('[DEV] Simulando consulta de pago Binance:', merchantTradeNo);
      
      return res.json({
        status: 'PAID',
        merchantTradeNo,
        transactionId: `TX${Date.now()}`,
        orderAmount: 100.00,
        currency: 'USDT',
        paidAmount: 100.00,
        payTime: new Date().toISOString()
      });
    }
    
    // En producción, realizamos la consulta a Binance Pay
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const payload = {
      merchantTradeNo
    };
    
    const payloadString = JSON.stringify(payload);
    
    // Generar firma para la solicitud
    const signature = crypto
      .createHmac('sha512', BINANCE_API_SECRET)
      .update(`${timestamp}\n${nonce}\n${payloadString}\n`)
      .digest('hex');
    
    const headers = {
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': BINANCE_API_KEY,
      'BinancePay-Signature': signature,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(`${BINANCE_API_URL}/query`, payloadString, { headers });
    
    // Verificar respuesta
    if (response.data && response.data.status === 'SUCCESS' && response.data.data) {
      return res.json(response.data.data);
    } else {
      throw new Error(response.data.errorMessage || 'Error desconocido de Binance Pay');
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Webhook para recibir notificaciones de Binance Pay
 */
router.post('/binance/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Webhook recibido de Binance Pay:', payload);
    
    // Aquí procesaríamos el webhook (verificar firma, actualizar base de datos, etc.)
    // En este ejemplo solo confirmamos la recepción
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en webhook de Binance Pay:', error);
    res.status(500).json({ success: false });
  }
});

// Aplicar middleware de manejo de errores
router.use(errorHandler);

module.exports = router;
