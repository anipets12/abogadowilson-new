import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import HelmetWrapper from '../components/Common/HelmetWrapper';

const PoliticasCondiciones = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <HelmetWrapper>
        <title>Políticas y Condiciones | Abogado Wilson Ipiales</title>
        <meta name="description" content="Políticas y condiciones de uso de nuestros servicios legales. Términos legales, privacidad y condiciones generales." />
      </HelmetWrapper>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary-900">Políticas y Condiciones</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary-900">1. Términos de Servicio</h2>
          <p className="text-secondary-700 mb-4">
            Al acceder y utilizar los servicios ofrecidos por el Dr. Wilson Alexander Ipiales Guerron, ya sea a través de nuestro sitio web, servicios de consultoría legal, o cualquier otro canal, usted acepta cumplir con los siguientes términos y condiciones de uso.
          </p>
          <p className="text-secondary-700 mb-4">
            Los servicios ofrecidos están destinados exclusivamente para personas mayores de edad y con capacidad legal para contratar. Si usted no cumple con estos requisitos, deberá abstenerse de utilizar nuestros servicios.
          </p>
          <p className="text-secondary-700 mb-4">
            Nos reservamos el derecho de modificar estos términos en cualquier momento, siendo efectivos inmediatamente después de su publicación. Es responsabilidad del usuario revisar periódicamente los términos actualizados.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary-900">2. Política de Privacidad</h2>
          <p className="text-secondary-700 mb-4">
            Respetamos su privacidad y nos comprometemos a proteger sus datos personales. La información proporcionada será utilizada únicamente para los fines específicos para los que fue recolectada.
          </p>
          <p className="text-secondary-700 mb-4">
            Recopilamos información personal como nombre, dirección, correo electrónico y número telefónico con el propósito de brindar nuestros servicios legales, responder consultas y mejorar la experiencia del usuario.
          </p>
          <p className="text-secondary-700 mb-4">
            Sus datos están protegidos mediante medidas de seguridad diseñadas para prevenir el acceso no autorizado o divulgación de información personal. No compartimos su información con terceros sin su consentimiento, excepto cuando sea requerido por ley.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary-900">3. Condiciones de Consultas</h2>
          <p className="text-secondary-700 mb-4">
            Las consultas legales realizadas a través de nuestra plataforma están sujetas a disponibilidad y capacidad operativa. El tiempo de respuesta puede variar según la complejidad del caso y la carga de trabajo actual.
          </p>
          <p className="text-secondary-700 mb-4">
            La información proporcionada durante las consultas tiene carácter informativo y no constituye un consejo legal formal ni establece una relación abogado-cliente hasta que se formalice mediante un contrato específico.
          </p>
          <p className="text-secondary-700 mb-4">
            Para las consultas que utilizan el sistema de tokens o créditos, estos tienen una validez de 12 meses desde la fecha de adquisición. Los tokens no utilizados durante este periodo expirarán automáticamente sin derecho a reembolso.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary-900">4. Política de Reembolsos</h2>
          <p className="text-secondary-700 mb-4">
            Los servicios legales prestados son finales y no admiten reembolso una vez iniciados. En caso de adquisición de paquetes de tokens o consultas prepagadas, se podrá solicitar un reembolso dentro de los 7 días posteriores a la compra, siempre y cuando no se hayan utilizado.
          </p>
          <p className="text-secondary-700 mb-4">
            Las solicitudes de reembolso deben realizarse por escrito al correo electrónico: contacto@abogadowilson.com, indicando el motivo y los datos de la transacción. El procesamiento de reembolsos puede tomar hasta 15 días hábiles.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-secondary-900">5. Limitación de Responsabilidad</h2>
          <p className="text-secondary-700 mb-4">
            El Dr. Wilson Alexander Ipiales Guerron se compromete a ofrecer servicios de alta calidad profesional, sin embargo, no garantiza resultados específicos en procesos legales, los cuales dependen de múltiples factores incluyendo la legislación aplicable, criterios judiciales y circunstancias particulares de cada caso.
          </p>
          <p className="text-secondary-700 mb-4">
            No asumimos responsabilidad por decisiones tomadas por el cliente basadas en la información proporcionada sin haber formalizado una relación profesional mediante un contrato específico que delimite el alcance de los servicios.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-secondary-600 mb-4">
            Si tiene preguntas sobre nuestras políticas y condiciones, no dude en contactarnos:
          </p>
          <Link
            to="/contacto"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors duration-300"
          >
            Contactar
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PoliticasCondiciones;
