import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import HelmetWrapper from '../components/Common/HelmetWrapper';
import { ShieldCheckIcon, LockClosedIcon, EyeSlashIcon, FingerPrintIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Seguridad = () => {
  const securityFeatures = [
    {
      title: 'Protecciu00f3n de Datos',
      description: 'Utilizamos encriptaciu00f3n de nivel bancario para proteger toda la informaciu00f3n personal y legal que nos confu00eda.',
      icon: <ShieldCheckIcon className="h-12 w-12 text-primary-600" />
    },
    {
      title: 'Confidencialidad Garantizada',
      description: 'Mantenemos estricta confidencialidad sobre todos sus asuntos legales, cumpliendo con el secreto profesional.',
      icon: <LockClosedIcon className="h-12 w-12 text-primary-600" />
    },
    {
      title: 'Privacidad Reforzada',
      description: 'No compartimos su informaciu00f3n con terceros y cumplimos con todas las normativas de protecciu00f3n de datos personales.',
      icon: <EyeSlashIcon className="h-12 w-12 text-primary-600" />
    },
    {
      title: 'Autenticaciu00f3n Segura',
      description: 'Implementamos sistemas de autenticaciu00f3n de dos factores para garantizar que solo usted pueda acceder a su informaciu00f3n.',
      icon: <FingerPrintIcon className="h-12 w-12 text-primary-600" />
    },
    {
      title: 'Documentaciu00f3n Protegida',
      description: 'Sus documentos legales estu00e1n almacenados en servidores seguros con respaldos periu00f3dicos para prevenir pu00e9rdidas.',
      icon: <DocumentTextIcon className="h-12 w-12 text-primary-600" />
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <HelmetWrapper>
        <title>Seguridad y Confidencialidad | Abogado Wilson Ipiales</title>
        <meta name="description" content="Conozca nuestras medidas de seguridad y confidencialidad para proteger su informaciu00f3n legal. Garantizamos la privacidad de sus datos." />
      </HelmetWrapper>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary-900">Seguridad y Confidencialidad</h1>
        <p className="text-lg text-center mb-12 text-secondary-600 max-w-3xl mx-auto">
          La protecciu00f3n de su informaciu00f3n y la confidencialidad de sus asuntos legales son nuestra prioridad. Implementamos las mu00e1s estrictas medidas de seguridad para garantizar su tranquilidad.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-secondary-900">{feature.title}</h3>
              <p className="text-secondary-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-secondary-900 text-center">Nuestro Compromiso con Su Seguridad</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-700">Secreto Profesional</h3>
              <p className="text-secondary-700">
                Como abogados, estamos sujetos al secreto profesional establecido en el Cu00f3digo de u00c9tica Profesional. Toda la informaciu00f3n que usted comparte con nosotros estu00e1 protegida por esta obligaciu00f3n legal y u00e9tica que nos impide divulgar cualquier dato relacionado con su caso sin su consentimiento expreso.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-700">Infraestructura Tecnolu00f3gica</h3>
              <p className="text-secondary-700">
                Utilizamos servicios de alojamiento de primer nivel con certificaciones ISO 27001 y cumplimiento de estu00e1ndares internacionales de seguridad. Nuestros sistemas implementan encriptaciu00f3n de datos en reposo y en tru00e1nsito para asegurar que su informaciu00f3n siempre estu00e9 protegida.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-700">Protocolos de Acceso</h3>
              <p className="text-secondary-700">
                Implementamos estrictos controles de acceso a la informaciu00f3n. Solo el personal autorizado y directamente involucrado en su caso puede acceder a sus datos, siempre mediante sistemas de autenticaciu00f3n seguros y con registros de auditoru00eda.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-700">Cumplimiento Normativo</h3>
              <p className="text-secondary-700">
                Cumplimos con todas las leyes y regulaciones aplicables sobre protecciu00f3n de datos personales, incluyendo la Ley Orgu00e1nica de Protecciu00f3n de Datos Personales de Ecuador, garantizando que sus derechos estu00e9n protegidos en todo momento.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-primary-50 rounded-lg p-6 md:p-8 mb-12 border border-primary-100">
          <h2 className="text-2xl font-bold mb-4 text-primary-900 text-center">Preguntas Frecuentes sobre Seguridad</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary-800">u00bfQuu00e9 medidas toman para proteger mis comunicaciones?</h3>
              <p className="text-secondary-700">
                Todas las comunicaciones realizadas a travu00e9s de nuestra plataforma estu00e1n encriptadas de extremo a extremo. Para comunicaciones por correo electru00f3nico, utilizamos protocolos seguros y ofrecemos la opciu00f3n de encriptaciu00f3n adicional para documentos sensibles.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary-800">u00bfCu00f3mo aseguran la confidencialidad cuando uso el chat legal con IA?</h3>
              <p className="text-secondary-700">
                Nuestro sistema de chat legal con IA estu00e1 diseu00f1ado con estrictos controles de privacidad. La informaciu00f3n proporcionada no se almacena permanentemente y se utiliza u00fanicamente para generar respuestas relevantes a su consulta. Ademu00e1s, implementamos procesos de anonimizaciu00f3n para proteger su identidad.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary-800">u00bfPor cuu00e1nto tiempo conservan mi informaciu00f3n?</h3>
              <p className="text-secondary-700">
                Mantenemos su informaciu00f3n legal durante el tiempo necesario para prestar nuestros servicios y cumplir con las obligaciones legales. Una vez finalizada la relaciu00f3n profesional, conservamos la documentaciu00f3n por el periodo legalmente establecido, tras el cual procedemos a su eliminaciu00f3n segura o anonimizaciu00f3n.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-secondary-900 mb-4">u00bfTiene mu00e1s preguntas sobre nuestra seguridad?</h3>
          <p className="text-lg text-secondary-600 mb-6 max-w-2xl mx-auto">
            Estaremos encantados de aclarar cualquier duda adicional que pueda tener sobre nuestras medidas de seguridad y confidencialidad.
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

export default Seguridad;
