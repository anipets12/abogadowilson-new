import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import HelmetWrapper from '../components/Common/HelmetWrapper';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular carga de artículos
    setTimeout(() => {
      setArticles([
        {
          id: 1,
          title: 'Reformas al Código Penal Ecuatoriano 2025',
          excerpt: 'Análisis detallado de las últimas reformas al COIP y cómo afectan a los procesos penales actuales.',
          date: '15 de abril, 2025',
          author: 'Dr. Wilson Ipiales',
          category: 'Derecho Penal',
          imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000',
        },
        {
          id: 2,
          title: 'Mediación vs. Litigio: ¿Cuál es mejor para su caso?',
          excerpt: 'Comparativa entre los procesos de mediación y litigio para resolver conflictos legales en Ecuador.',
          date: '10 de abril, 2025',
          author: 'Dr. Wilson Ipiales',
          category: 'Consejos Legales',
          imageUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=1000',
        },
        {
          id: 3,
          title: 'Implicaciones legales del uso de IA en procesos judiciales',
          excerpt: 'Cómo la inteligencia artificial está transformando el sistema judicial y qué consideraciones legales debemos tener.',
          date: '5 de abril, 2025',
          author: 'Dr. Wilson Ipiales',
          category: 'Tecnología Legal',
          imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000',
        },
        {
          id: 4,
          title: 'Guía para enfrentar un juicio de tránsito',
          excerpt: 'Pasos a seguir cuando enfrenta un proceso legal por infracciones de tránsito en Ecuador.',
          date: '1 de abril, 2025',
          author: 'Dr. Wilson Ipiales',
          category: 'Tránsito',
          imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <HelmetWrapper>
        <title>Blog Legal | Abogado Wilson Ipiales</title>
        <meta name="description" content="Artículos y noticias sobre temas legales en Ecuador. Información actualizada sobre derecho penal, civil, tránsito y más." />
      </HelmetWrapper>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-primary-900">Blog Legal</h1>
        <p className="text-lg text-center mb-8 text-secondary-600">Artículos y análisis sobre temas legales actuales</p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-800 rounded-full mb-2">
                    {article.category}
                  </span>
                  <h2 className="text-xl font-bold mb-2 text-secondary-900">{article.title}</h2>
                  <p className="text-secondary-600 mb-4">{article.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-secondary-500">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                  </div>
                  <Link 
                    to={`/blog/${article.id}`} 
                    className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors duration-300"
                  >
                    Leer más
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-secondary-900 mb-4">
            ¿Necesita asesoría legal personalizada?
          </h3>
          <p className="text-lg text-secondary-600 mb-6">
            Nuestro equipo de abogados expertos está listo para ayudarle con su caso específico.
          </p>
          <Link
            to="/contacto"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors duration-300"
          >
            Solicitar Consulta
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
