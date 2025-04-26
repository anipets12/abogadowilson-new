import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Chatbot de Inteligencia Artificial para consultas legales
 */
const AILegalChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // Mensaje inicial del bot al cargar
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: '¡Hola! Soy el asistente legal virtual de Abogado Wilson. ¿En qué puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulación de respuestas del bot (en producción esto se conectaría a una API de IA)
  const generateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Diccionario de respuestas predefinidas para simulación
    const responseDictionary = {
      'hola': '¡Hola! ¿En qué puedo ayudarte con temas legales hoy?',
      'ayuda': 'Puedo ayudarte con consultas sobre derecho penal, civil, tránsito, y más. ¿Sobre qué área necesitas información?',
      'consulta': 'Para una consulta detallada, puedes agendar una cita en nuestra sección de Consultas o llamar al número +59398835269.',
      'precio': 'Los precios varían según el tipo de servicio. Para una cotización personalizada, te recomiendo completar el formulario en la sección de contacto.',
      'horario': 'Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM.',
      'ubicación': 'Estamos ubicados en Av. Principal 123, Quito, Ecuador. También ofrecemos consultas virtuales.',
      'servicio': 'Ofrecemos servicios en diversas áreas del derecho: penal, civil, tránsito, laboral, administrativo, entre otros.',
      'documento': 'Para revisar un documento, por favor agenda una consulta. Durante la consulta podremos analizar tu caso específico.',
      'pago': 'Aceptamos pagos por transferencia bancaria, tarjeta de crédito/débito, PayPal y ahora también Binance Pay.'
    };

    // Simular tiempo de respuesta
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Buscar una respuesta predefinida o generar una genérica
    let botResponse = 'Lo siento, no puedo responder esa consulta específica. Para mejor asistencia, programa una consulta con uno de nuestros abogados.';
    
    // Buscar palabras clave en el mensaje del usuario
    for (const keyword in responseDictionary) {
      if (userMessage.toLowerCase().includes(keyword)) {
        botResponse = responseDictionary[keyword];
        break;
      }
    }
    
    setIsTyping(false);
    return botResponse;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Agregar mensaje del usuario
    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    try {
      // Generar respuesta del bot
      const botResponse = await generateBotResponse(inputMessage);
      
      // Agregar respuesta del bot
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error al generar respuesta del bot:', error);
      toast.error('Hubo un problema al procesar tu consulta. Intenta nuevamente.');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('es', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón del chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* Encabezado */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <h3 className="font-medium">Asistente Legal Virtual</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Área de mensajes */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto"
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className={`text-xs mt-1 block ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Indicador de "escribiendo" */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Área de entrada de texto */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-2 flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={`px-4 py-2 ${
                !inputMessage.trim() || isTyping
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-r-lg`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          
          {/* Nota legal */}
          <div className="bg-gray-50 text-gray-500 text-xs text-center p-2 border-t border-gray-200">
            Este chatbot proporciona información general y no constituye asesoría legal.
          </div>
        </div>
      )}
    </div>
  );
};

export default AILegalChatbot;
