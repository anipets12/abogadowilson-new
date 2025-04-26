import axios from 'axios';
import { toast } from 'react-hot-toast';

const BINANCE_MERCHANT_ID = '549755069';
const BINANCE_PAY_API_URL = 'https://bpay.binanceapi.com/binancepay/openapi/v2';

/**
 * Servicio para integraciones con Binance Pay
 */
class BinancePayService {
  constructor() {
    this.merchantId = BINANCE_MERCHANT_ID;
    this.apiUrl = BINANCE_PAY_API_URL;
    this.init();
  }

  /**
   * Inicializa el servicio
   */
  init() {
    console.log('Inicializando BinancePayService');
    // Cargar script de Binance Pay
    this.loadBinancePayScript();
  }

  /**
   * Carga el script de Binance Pay dinámicamente
   */
  async loadBinancePayScript() {
    try {
      // Importar el cargador de scripts dinámicamente
      const { loadBinancePayScript } = await import('../utils/loadExternalScripts');
      await loadBinancePayScript();
      console.log('Script de Binance Pay cargado correctamente');
      return true;
    } catch (error) {
      console.error('Error al cargar el script de Binance Pay:', error);
      
      // Usar el sistema de fallback si está disponible
      if (window.__FALLBACK_APIS && window.__FALLBACK_APIS.BinancePay) {
        console.log('Usando sistema de fallback para Binance Pay');
        window.BinancePay = window.__FALLBACK_APIS.BinancePay;
        return true;
      }
      
      toast.error('Error al cargar el sistema de pagos. Intente más tarde.');
      return false;
    }
  }

  /**
   * Genera un ID de orden único
   */
  generateOrderId() {
    return `AW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Crea una transacción de pago
   * @param {Object} orderDetails Detalles del pedido
   * @returns {Promise<Object>}
   */
  async createPayment(orderDetails) {
    try {
      const orderId = this.generateOrderId();
      
      const payload = {
        merchantId: this.merchantId,
        merchantTradeNo: orderId,
        orderAmount: orderDetails.amount,
        currency: 'USDT',
        orderSummary: `Pago ${orderDetails.description || 'Servicios legales'} - Abogado Wilson`,
        returnUrl: `${window.location.origin}/gracias?order=${orderId}`,
        cancelUrl: `${window.location.origin}/pago?canceled=true`,
        orderDescription: orderDetails.description || 'Servicios profesionales'
      };

      // En un entorno real, esta llamada debería hacerse desde el servidor
      // para proteger las credenciales de la API
      const response = await axios.post('/api/payment/binance/create', payload);

      if (response.data && response.data.prepayId) {
        return {
          success: true,
          orderId,
          prepayId: response.data.prepayId,
          qrCodeUrl: response.data.qrCodeUrl
        };
      } else {
        throw new Error('No se pudo obtener el ID de prepago');
      }
    } catch (error) {
      console.error('Error al crear pago con Binance:', error);
      return {
        success: false,
        error: error.message || 'Error al procesar el pago'
      };
    }
  }

  /**
   * Procesa un pago directamente en la página usando Binance Pay
   */
  async processPayment(orderDetails) {
    try {
      // En desarrollo simulamos un pago exitoso
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Simulando pago exitoso en entorno de desarrollo:', orderDetails);
        toast.success('Pago simulado con éxito en entorno de desarrollo');
        
        // Simulamos procesamiento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirigimos a la página de gracias
        window.location.href = `/gracias?order=${this.generateOrderId()}`;
        return { success: true };
      }
      
      // Crear el pago
      const paymentResult = await this.createPayment(orderDetails);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Error al crear el pago');
      }
      
      // Si estamos en el navegador y el script de Binance Pay está cargado
      if (typeof window !== 'undefined' && window.BinancePay) {
        window.BinancePay.checkout({
          prepayId: paymentResult.prepayId,
          returnUrl: `${window.location.origin}/gracias?order=${paymentResult.orderId}`
        });
        return { success: true };
      } else {
        // Fallback si no se cargó el script
        window.location.href = paymentResult.qrCodeUrl;
        return { success: true };
      }
    } catch (error) {
      console.error('Error al procesar pago con Binance Pay:', error);
      toast.error('Error al procesar el pago. Por favor intente nuevamente.');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verifica el estado de un pago
   */
  async verifyPayment(orderId) {
    try {
      // En desarrollo simulamos verificación exitosa
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Simulando verificación exitosa en entorno de desarrollo:', orderId);
        return { 
          success: true, 
          status: 'PAID',
          orderAmount: 100.00
        };
      }
      
      const response = await axios.post('/api/payment/binance/query', {
        merchantId: this.merchantId,
        merchantTradeNo: orderId
      });
      
      if (response.data && response.data.status) {
        return {
          success: true,
          status: response.data.status,
          orderAmount: response.data.orderAmount
        };
      } else {
        throw new Error('No se pudo verificar el estado del pago');
      }
    } catch (error) {
      console.error('Error al verificar pago con Binance:', error);
      return {
        success: false,
        error: error.message || 'Error al verificar el pago'
      };
    }
  }
}

// Exportar instancia única
const binancePayService = new BinancePayService();
export default binancePayService;
