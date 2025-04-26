import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import HelmetWrapper from '../components/Common/HelmetWrapper';
import { ScaleIcon, ClockIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ConsultaGeneral = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoConsulta: 'Penal',
    mensaje: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tiposConsulta = [
    'Penal',
    'Civil',
    'Familia',
    'Laboral',
    'Tránsito',
    'Comercial',
    'Administrativo',
    'Otro'
  ];

  const beneficios = [
    {
      title: 'Rapidez',
      description: 'Respuesta en menos de 24 horas hábiles para consultas urgentes.',
      icon: <ClockIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Asequibilidad',
      description: 'Tarifas transparentes y accesibles con opciones flexibles de pago.',
      icon: <ScaleIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Personalización',
      description: 'Asesoramiento adaptado específicamente a su situación legal.',
      icon: <ChatBubbleLeftRightIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Documentación',
      description: 'Reciba un resumen escrito con las recomendaciones legales.',
      icon: <DocumentTextIcon className="h-10 w-10 text-primary-600" />
    },
    {
      title: 'Confidencialidad',
      description: 'Garantía total de privacidad y protección de su información.',
      icon: <ShieldCheckIcon className="h-10 w-10 text-primary-600" />
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error cuando el usuario comienza a corregir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Por favor ingrese un email válido';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.mensaje.trim()) newErrors.mensaje = 'Por favor describa su consulta';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      
      // Simulación de envío
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        // Limpiar formulario
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          tipoConsulta: 'Penal',
          mensaje: '',
        });
      }, 1500);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <HelmetWrapper>
        <title>Consulta General | Abogado Wilson Ipiales</title>
        <meta name="description" content="Solicite una consulta legal general para resolver sus dudas jurídicas. Asesoramiento especializado en derecho penal, civil, tránsito y más." />
      </HelmetWrapper>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary-900">Consulta Legal General</h1>
        <p className="text-lg text-center mb-12 text-secondary-600 max-w-3xl mx-auto">
          Obtenga asesoramiento legal profesional para resolver sus dudas e inquietudes jurídicas. Complete el formulario a continuación y nuestro equipo se pondrá en contacto con usted en breve.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-secondary-900">Beneficios de Nuestra Consulta</h2>
              
              <div className="space-y-6">
                {beneficios.map((beneficio, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {beneficio.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">{beneficio.title}</h3>
                      <p className="text-secondary-600">{beneficio.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
              <h3 className="text-xl font-bold mb-4 text-primary-900">¿Necesita una consulta especializada?</h3>
              <p className="text-secondary-700 mb-4">
                Si su caso requiere un análisis más profundo o especializado, considere programar una consulta personalizada con nuestros abogados expertos.
              </p>
              <div className="flex gap-4">
                <a 
                  href="/consulta-ia"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-300"
                >
                  Consulta con IA
                </a>
                <a 
                  href="/contacto"
                  className="px-4 py-2 bg-white border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-300"
                >
                  Contacto Directo
                </a>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">¡Solicitud Enviada!</h2>
                <p className="text-secondary-600 mb-6">
                  Su solicitud de consulta ha sido recibida correctamente. Nos pondremos en contacto con usted en breve para coordinar los detalles.
                </p>
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                >
                  Enviar Otra Consulta
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-secondary-900">Formulario de Solicitud</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-secondary-700 mb-1">Nombre Completo*</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Ingrese su nombre completo"
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">Correo Electrónico*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="ejemplo@correo.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-secondary-700 mb-1">Teléfono*</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="+593 XX XXX XXXX"
                    />
                    {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="tipoConsulta" className="block text-sm font-medium text-secondary-700 mb-1">Área Legal</label>
                    <select
                      id="tipoConsulta"
                      name="tipoConsulta"
                      value={formData.tipoConsulta}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {tiposConsulta.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-secondary-700 mb-1">Descripción de su Consulta*</label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full px-4 py-2 border ${errors.mensaje ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Describa brevemente su situación legal y las dudas que desea resolver..."
                    ></textarea>
                    {errors.mensaje && <p className="mt-1 text-sm text-red-600">{errors.mensaje}</p>}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-6 py-3 text-white font-medium rounded-md transition-colors duration-300 ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : 'Enviar Solicitud'}
                  </button>
                </div>
                
                <p className="mt-4 text-xs text-secondary-500 text-center">
                  Al enviar este formulario, acepta nuestras <a href="/politicas-condiciones" className="text-primary-600 hover:underline">Políticas y Condiciones</a> y nuestra <a href="/seguridad" className="text-primary-600 hover:underline">Política de Privacidad</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ConsultaGeneral;
