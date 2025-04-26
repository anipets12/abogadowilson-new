import React, { useState } from 'react';
import binancePayService from '../../services/binancePayService';
import { toast } from 'react-hot-toast';

/**
 * Botón para realizar pagos con Binance Pay
 */
const BinancePayButton = ({ 
  amount, 
  description = 'Servicios legales', 
  orderId = null,
  onPaymentSuccess = () => {},
  onPaymentError = () => {},
  buttonText = 'Pagar con Binance'
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    setLoading(true);
    try {
      const result = await binancePayService.processPayment({
        amount: parseFloat(amount).toFixed(2),
        description,
        orderId: orderId || binancePayService.generateOrderId()
      });

      if (result.success) {
        toast.success('Procesando pago. Serás redirigido a Binance Pay');
        onPaymentSuccess(result);
      } else {
        toast.error(result.error || 'Error al procesar el pago');
        onPaymentError(result);
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      toast.error('Error al procesar el pago');
      onPaymentError({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`flex items-center justify-center px-6 py-3 ${
        loading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'
      } text-white rounded-lg font-medium shadow-md transition duration-200`}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </span>
      ) : (
        <span className="flex items-center">
          <img src="/images/binance-pay-logo.svg" alt="Binance Pay" className="w-6 h-6 mr-2" onError={(e) => {e.target.style.display = 'none'}} />
          {buttonText}
        </span>
      )}
    </button>
  );
};

export default BinancePayButton;
