/**
 * Manejadores de API para el proyecto Abogado Wilson
 * Este archivo contiene las implementaciones de los endpoints de la API
 */

// Funciones para servicios legales
export const legalServicesHandlers = {
  // Obtener todos los servicios legales
  getAll: async (supabaseClient) => {
    try {
      return await supabaseClient
        .from('legal_services')
        .select('*')
        .order('order', { ascending: true });
    } catch (error) {
      console.error('Error al obtener servicios legales:', error);
      throw new Error('Error al obtener servicios legales');
    }
  },
  
  // Obtener un servicio legal por ID
  getById: async (supabaseClient, id) => {
    try {
      return await supabaseClient
        .from('legal_services')
        .select('*')
        .eq('id', id)
        .single();
    } catch (error) {
      console.error(`Error al obtener servicio legal ${id}:`, error);
      throw new Error(`Error al obtener servicio legal ${id}`);
    }
  }
};

// Funciones para blog y artículos
export const blogHandlers = {
  // Obtener todos los artículos del blog
  getAll: async (supabaseClient, options = {}) => {
    try {
      const { limit = 10, offset = 0, category = null } = options;
      let query = supabaseClient
        .from('blog_articles')
        .select('id, title, slug, excerpt, featured_image, category, published_at, author')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (category) {
        query = query.eq('category', category);
      }
      
      return await query;
    } catch (error) {
      console.error('Error al obtener artículos del blog:', error);
      throw new Error('Error al obtener artículos del blog');
    }
  },
  
  // Obtener un artículo por slug
  getBySlug: async (supabaseClient, slug) => {
    try {
      return await supabaseClient
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .single();
    } catch (error) {
      console.error(`Error al obtener artículo ${slug}:`, error);
      throw new Error(`Error al obtener artículo ${slug}`);
    }
  }
};

// Funciones para eBooks
export const ebooksHandlers = {
  // Obtener todos los eBooks
  getAll: async (supabaseClient) => {
    try {
      return await supabaseClient
        .from('ebooks')
        .select('id, title, description, cover_image, price, is_free, slug')
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('Error al obtener eBooks:', error);
      throw new Error('Error al obtener eBooks');
    }
  },
  
  // Obtener un eBook por slug
  getBySlug: async (supabaseClient, slug) => {
    try {
      return await supabaseClient
        .from('ebooks')
        .select('*')
        .eq('slug', slug)
        .single();
    } catch (error) {
      console.error(`Error al obtener eBook ${slug}:`, error);
      throw new Error(`Error al obtener eBook ${slug}`);
    }
  }
};

// Funciones para consultas legales
export const consultationsHandlers = {
  // Crear una nueva consulta
  create: async (supabaseClient, data) => {
    try {
      const { name, email, phone, message, service_type } = data;
      
      // Validaciones básicas
      if (!name || !email || !message) {
        throw new Error('Campos requeridos faltantes');
      }
      
      return await supabaseClient
        .from('consultations')
        .insert([
          {
            name,
            email,
            phone: phone || '',
            message,
            service_type: service_type || 'general',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Error al crear consulta:', error);
      throw new Error('Error al crear consulta: ' + error.message);
    }
  }
};

// Funciones para citas y reservas
export const appointmentsHandlers = {
  // Obtener slots disponibles
  getAvailableSlots: async (supabaseClient, date) => {
    try {
      // Validar formato de fecha
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Formato de fecha inválido. Utilice YYYY-MM-DD');
      }
      
      // Obtener citas existentes para la fecha
      const existingAppointments = await supabaseClient
        .from('appointments')
        .select('time_slot')
        .eq('date', date);
      
      // Definir todos los slots posibles (9 AM a 5 PM, cada hora)
      const allSlots = [
        '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
      ];
      
      // Filtrar slots ocupados
      const bookedSlots = existingAppointments.data.map(app => app.time_slot);
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
      
      return { 
        date, 
        available_slots: availableSlots,
        booked_slots: bookedSlots
      };
    } catch (error) {
      console.error(`Error al obtener slots disponibles para ${date}:`, error);
      throw new Error(`Error al obtener slots disponibles: ${error.message}`);
    }
  },
  
  // Crear una nueva cita
  create: async (supabaseClient, data) => {
    try {
      const { name, email, phone, date, time_slot, service_type, message } = data;
      
      // Validaciones básicas
      if (!name || !email || !date || !time_slot) {
        throw new Error('Campos requeridos faltantes');
      }
      
      // Verificar disponibilidad del slot
      const existingAppointment = await supabaseClient
        .from('appointments')
        .select('id')
        .eq('date', date)
        .eq('time_slot', time_slot);
      
      if (existingAppointment.data && existingAppointment.data.length > 0) {
        throw new Error('El horario seleccionado ya no está disponible');
      }
      
      // Crear la cita
      return await supabaseClient
        .from('appointments')
        .insert([
          {
            name,
            email,
            phone: phone || '',
            date,
            time_slot,
            service_type: service_type || 'general',
            message: message || '',
            status: 'scheduled',
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw new Error('Error al crear cita: ' + error.message);
    }
  }
};

// Funciones para sistema de afiliados
export const affiliatesHandlers = {
  // Registrar nuevo afiliado
  register: async (supabaseClient, data) => {
    try {
      const { name, email, phone, website, tax_id } = data;
      
      // Validaciones básicas
      if (!name || !email) {
        throw new Error('Campos requeridos faltantes');
      }
      
      // Verificar si el email ya está registrado
      const existingAffiliate = await supabaseClient
        .from('affiliates')
        .select('id')
        .eq('email', email);
      
      if (existingAffiliate.data && existingAffiliate.data.length > 0) {
        throw new Error('Este email ya está registrado como afiliado');
      }
      
      // Crear código de afiliado único
      const affiliateCode = 'AW' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Registrar afiliado
      return await supabaseClient
        .from('affiliates')
        .insert([
          {
            name,
            email,
            phone: phone || '',
            website: website || '',
            tax_id: tax_id || '',
            affiliate_code: affiliateCode,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Error al registrar afiliado:', error);
      throw new Error('Error al registrar afiliado: ' + error.message);
    }
  }
};

// Funciones para autenticación
export const authHandlers = {
  // Iniciar sesión
  login: async (supabaseClient, data) => {
    try {
      const { email, password } = data;
      
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      return await supabaseClient.auth.signIn({ email, password });
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      throw new Error('Error en inicio de sesión: ' + error.message);
    }
  }
};
