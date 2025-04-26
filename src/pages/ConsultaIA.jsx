import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import HelmetWrapper from '../components/Common/HelmetWrapper';
import { tokenService } from '../services/tokenService';
import { FiSend, FiMessageSquare, FiAlertCircle, FiInfo, FiCpu } from 'react-icons/fi';

const ConsultaIA = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState(null);
  const [tokensUsedInSession, setTokensUsedInSession] = useState(0);
  const messagesEndRef = useRef(null);
  
  // Información ficticia para el modo de ejemplo
  const demoInfo = {
    initialMessage: "¡Hola! Soy el asistente legal de Abogado Wilson, potenciado por Gemini AI. Estoy aquí para responder sus consultas legales generales. ¿En qué puedo ayudarle hoy?",
    responses: {
      "divorcio": "El divorcio en Ecuador puede tramitarse por mutuo consentimiento o de forma contenciosa cuando no hay acuerdo. Por mutuo consentimiento, el proceso es más rápido (aproximadamente 2-3 meses) y puede realizarse ante un notario si no hay hijos menores. El divorcio contencioso puede durar entre 6 meses y 1 año. Es recomendable contar con asesoría legal profesional para gestionar adecuadamente la división de bienes y, si hay hijos menores, establecer la pensión alimenticia y régimen de visitas.",
      "pensión alimenticia": "La pensión alimenticia en Ecuador se calcula según la tabla de pensiones mínimas del MIES, considerando los ingresos del alimentante y el número de hijos. Para 2025, la pensión mínima va desde el 28.12% del SBU para 1 hijo hasta el 60.36% para 3 o más hijos. El proceso inicia presentando una demanda en la Unidad Judicial de Familia, donde se fijará una pensión provisional en 10 días hábiles. En la audiencia única se determinará el monto definitivo, que puede depositarse vía transferencia o consignación judicial.",
      "despido": "En caso de despido intempestivo en Ecuador, usted tiene derecho a una indemnización que depende de su antigüedad: hasta 3 años de servicio, 3 meses de remuneración; más de 3 años, un mes adicional por cada año hasta 25 meses. También corresponde la bonificación del 25% por desahucio y proporcionales de beneficios sociales. El plazo para reclamar es de 3 años. Es recomendable guardar evidencia del despido (correos, mensajes, testigos) y consultar con un abogado laboralista para maximizar la indemnización.",
      "accidente de tránsito": "Si ha sufrido un accidente de tránsito, primero debe precautelar su seguridad y salud. Luego, es importante recopilar evidencia (fotos, video del lugar, datos de testigos), obtener el parte policial, realizarse un chequeo médico y notificar a su aseguradora. Para reclamar indemnización, puede utilizar la vía administrativa a través del seguro SPPAT (para lesiones o muerte) o la vía judicial mediante una demanda por daños y perjuicios. El plazo de prescripción para acciones civiles es de 4 años desde el accidente.",
      "herencia": "En Ecuador, la sucesión puede ser testada (con testamento) o intestada (sin testamento). Sin testamento, la ley establece un orden de herederos: primero descendientes, luego ascendientes y cónyuge, seguido por hermanos y el Estado. El proceso de sucesión inicia con la apertura, seguido por la posesión efectiva (trámite notarial) y culmina con la partición de bienes. Los impuestos a la herencia aplican para montos superiores a la fracción básica (aproximadamente $72,060 para 2025), con tasas progresivas del 5% al 35%. Es recomendable formalizar la sucesión dentro del año siguiente al fallecimiento."
    }
  };
  
  // Simular integración con Gemini AI
  const processGeminiResponse = async (query) => {
    setLoading(true);
    
    try {
      // Buscar palabras clave en la consulta
      const lowerQuery = query.toLowerCase();
      let response = "Lo siento, no tengo información específica sobre esa consulta. Para obtener asesoramiento más preciso, le recomendaría agendar una consulta con el Dr. Wilson Ipiales. ¿Hay algún otro tema general en el que pueda orientarle?";
      
      // Verificar si hay palabras clave coincidentes
      for (const [keyword, answer] of Object.entries(demoInfo.responses)) {
        if (lowerQuery.includes(keyword)) {
          response = answer;
          break;
        }
      }
      
      // Simular espera de respuesta de Gemini
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar tokens usados (simulación)
      const tokensUsed = Math.floor(query.length / 4);
      setTokensUsedInSession(prev => prev + tokensUsed);
      
      // Simular respuesta de la API
      return {
        success: true,
        response: response,
        tokensUsed: tokensUsed
      };
    } catch (error) {
      console.error('Error al procesar la consulta:', error);
      return {
        success: false,
        error: 'Hubo un problema al procesar su consulta. Por favor, inténtelo nuevamente.'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar tokens disponibles al inicio
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // Simulación de carga de tokens
        setTimeout(() => {
          setTokens({
            available: 100,
            used: 0,
            subscription: 'Paquete Estándar'
          });
        }, 1000);
      } catch (err) {
        console.error('Error al cargar tokens:', err);
        setError('No se pudieron cargar sus tokens disponibles');
      }
    };
    
    loadTokens();
    
    // Agregar mensaje inicial
    setMessages([{
      type: 'assistant',
      content: demoInfo.initialMessage,
      timestamp: new Date().toISOString()
    }]);
  }, []);
  
  // Auto-scroll a la última mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    // Verificar si hay tokens suficientes (simulación)
    if (tokens && tokens.available - tokensUsedInSession <= 0) {
      setError('Ha agotado sus tokens disponibles. Por favor, adquiera más tokens para continuar.');
      return;
    }
    
    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Procesar respuesta utilizando Gemini (simulación)
    const result = await processGeminiResponse(input);
    
    if (result.success) {
      const assistantMessage = {
        type: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        tokensUsed: result.tokensUsed
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      setError(result.error);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <HelmetWrapper>
        <title>Consulta Legal con IA | Abogado Wilson Ipiales</title>
        <meta name="description" content="Obtenga respuestas inmediatas a sus consultas legales mediante nuestro sistema de inteligencia artificial. Asesoramiento legal automatizado disponible 24/7." />
      </HelmetWrapper>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary-900">Consulta Legal con IA</h1>
        <p className="text-lg text-center mb-6 text-secondary-600 max-w-3xl mx-auto">
          Obtenga respuestas inmediatas a sus consultas legales generales mediante nuestro asistente impulsado por Gemini AI.
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <FiCpu className="text-primary-600" />
          <span className="text-sm text-primary-600 font-medium">Integrado con Gemini AI</span>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Información de tokens */}
          <div className="bg-secondary-50 p-4 border-b border-secondary-100 flex justify-between items-center">
            <div className="flex items-center text-sm">
              <FiInfo className="text-secondary-500 mr-2" />
              <span className="text-secondary-700">
                {tokens ? (
                  <>Tokens disponibles: <span className="font-medium">{tokens.available - tokensUsedInSession}</span> de {tokens.available} ({tokens.subscription})</>
                ) : 'Cargando información de tokens...'}
              </span>
            </div>
            <a 
              href="/tokens"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Comprar más tokens
            </a>
          </div>
          
          {/* Contenedor de mensajes */}
          <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 max-w-[80%] ${message.type === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-3 ${message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border border-gray-200 text-secondary-800'}`}
                >
                  <div className="mb-1 text-sm">
                    <span className="font-medium">{message.type === 'user' ? 'Usted' : 'Asistente Legal IA'}</span>
                    <span className="text-xs ml-2 opacity-70">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <p className="text-sm md:text-base whitespace-pre-line">{message.content}</p>
                  {message.tokensUsed && (
                    <div className="mt-1 text-xs opacity-70 text-right">
                      Tokens utilizados: {message.tokensUsed}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 p-3 border-t border-red-100 flex items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)} 
                  className="text-xs text-red-600 hover:underline mt-1"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* Formulario de entrada */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || (tokens && tokens.available - tokensUsedInSession <= 0)}
                placeholder="Escriba su consulta legal aquí..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || (tokens && tokens.available - tokensUsedInSession <= 0)}
                className={`px-4 py-2 rounded-md flex items-center justify-center ${loading || !input.trim() || (tokens && tokens.available - tokensUsedInSession <= 0) 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <FiSend />}
              </button>
            </div>
            <p className="mt-2 text-xs text-secondary-500">
              Nota: Este asistente proporciona información legal general. Para asesoramiento específico de su caso, contacte directamente con nuestros abogados.
            </p>
          </form>
        </div>
        
        <div className="max-w-4xl mx-auto mt-8 bg-primary-50 rounded-lg p-6 border border-primary-100">
          <h2 className="text-xl font-bold mb-4 text-primary-900">Información Importante</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <FiMessageSquare className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-secondary-900">Limitaciones del Asistente Legal AI</h3>
                <p className="text-sm text-secondary-700">
                  Este asistente proporciona información legal general basada en la legislación ecuatoriana vigente. No sustituye el asesoramiento profesional personalizado ni considera las particularidades específicas de su caso.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <FiInfo className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-secondary-900">Sistema de Tokens</h3>
                <p className="text-sm text-secondary-700">
                  Cada interacción consume tokens de su cuenta. La cantidad de tokens utilizados depende de la longitud de su consulta y la respuesta generada. Puede adquirir más tokens en cualquier momento desde la sección de pagos.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <FiAlertCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-secondary-900">Consulta Profesional</h3>
                <p className="text-sm text-secondary-700">
                  Para casos complejos o que requieran un análisis específico, le recomendamos agendar una consulta directa con nuestros abogados especialistas. La consulta personal permitirá un análisis detallado de su situación.
                </p>
                <a 
                  href="/contacto"
                  className="text-sm text-primary-600 hover:underline mt-1 inline-block"
                >
                  Solicitar consulta personal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ConsultaIA;
