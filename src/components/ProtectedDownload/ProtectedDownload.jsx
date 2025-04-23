import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '../../services/supabase';

/**
 * Componente ProtectedDownload - Maneja descargas protegidas por autenticación
 * 
 * Este componente permite descargar recursos protegidos verificando primero
 * si el usuario tiene acceso al contenido solicitado.
 */
const ProtectedDownload = ({ fileKey, fileName, children, requireAuth = true, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar autenticación si es requerida
      if (requireAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Redirigir a login con retorno a esta página
          const returnUrl = encodeURIComponent(window.location.pathname);
          navigate(`/login?returnUrl=${returnUrl}`);
          return;
        }
      }

      // Generar URL firmada para descargar el archivo
      const { data, error: downloadError } = await supabase
        .storage
        .from('protected-downloads')
        .createSignedUrl(fileKey, 60);

      if (downloadError) {
        throw new Error(`Error al obtener enlace de descarga: ${downloadError.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error('No se pudo obtener el enlace para la descarga');
      }

      // Registrar evento de descarga
      await supabase
        .from('download_events')
        .insert([{
          file_key: fileKey,
          file_name: fileName,
          user_id: supabase.auth.user()?.id || 'anonymous'
        }]);

      // Iniciar descarga del archivo
      const downloadLink = document.createElement('a');
      downloadLink.href = data.signedUrl;
      downloadLink.download = fileName || fileKey.split('/').pop();
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (err) {
      console.error('Error en descarga protegida:', err);
      setError(err.message || 'Error al descargar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div onClick={handleDownload} className="cursor-pointer">
        {children || (
          <button
            disabled={isLoading}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
          >
            {isLoading ? 'Procesando...' : 'Descargar ahora'}
          </button>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProtectedDownload;
