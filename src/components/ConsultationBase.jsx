import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaComments, FaRobot, FaFileAlt, FaCalendarAlt, FaVideo } from 'react-icons/fa';

const ConsultationBase = () => {
  const consultationOptions = [
    {
      id: 'chat',
      title: 'Chat en Vivo',
      description: 'Converse con un abogado en tiempo real a través de nuestro sistema de chat.',
      icon: <FaComments className="h-8 w-8 text-blue-500" />,
      link: '/chat'
    },
    {
      id: 'ai',
      title: 'Consulta con IA',
      description: 'Obtenga respuestas inmediatas a través de nuestro asistente legal con inteligencia artificial.',
      icon: <FaRobot className="h-8 w-8 text-blue-500" />,
      link: '/consulta-ia'
    },
    {
      id: 'form',
      title: 'Formulario de Consulta',
      description: 'Envíe su consulta a través de un formulario y reciba una respuesta personalizada.',
      icon: <FaFileAlt className="h-8 w-8 text-blue-500" />,
      link: '/consulta-general'
    },
    {
      id: 'appointment',
      title: 'Agendar Cita',
      description: 'Reserve una cita personal con uno de nuestros abogados especialistas.',
      icon: <FaCalendarAlt className="h-8 w-8 text-blue-500" />,
      link: '/calendario'
    },
    {
      id: 'video',
      title: 'Videollamada',
      description: 'Consulta por videollamada desde la comodidad de su hogar u oficina.',
      icon: <FaVideo className="h-8 w-8 text-blue-500" />,
      link: '/videollamada'
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Opciones de Consulta Legal
          </motion.h2>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Elija la modalidad que más se ajuste a sus necesidades para obtener asesoría legal especializada.
          </motion.p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {consultationOptions.map((option, index) => (
              <motion.div
                key={option.id}
                className="pt-6 border border-gray-200 rounded-lg bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="px-6 py-8">
                  <div className="flex justify-center mb-4">
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{option.title}</h3>
                  <p className="text-gray-600 text-center mb-6">{option.description}</p>
                  <div className="mt-auto">
                    <Link
                      to={option.link}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Seleccionar
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Si tiene dudas sobre qué opción elegir, llámenos para asesorarle:
          </p>
          <a 
            href="tel:+593XXXXXXXXX" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-800"
          >
            +593 XX XXX XXXX
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConsultationBase;
