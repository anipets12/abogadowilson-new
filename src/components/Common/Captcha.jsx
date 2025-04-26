import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente de Captcha personalizado
 * Genera un captcha visual para validación de formularios
 */
const Captcha = ({ onVerify, difficulty = 'normal' }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const canvasRef = useRef(null);

  // Generar un nuevo captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    
    // La dificultad determina la longitud del captcha
    const length = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 8 : 6;
    
    for (let i = 0; i < length; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setCaptchaText(captcha);
    setUserInput('');
    setIsVerified(false);
    setErrorMessage('');
    
    // Dibujar el captcha en el canvas
    setTimeout(() => {
      if (canvasRef.current) {
        drawCaptcha(captcha);
      }
    }, 100);
  };

  // Dibujar el captcha en el canvas
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Color de fondo
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Añadir líneas de distorsión
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineWidth = Math.random() * 2;
      ctx.stroke();
    }
    
    // Dibujar el texto
    ctx.font = difficulty === 'hard' 
      ? 'italic 22px Arial' 
      : '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dibujar cada carácter con rotación aleatoria
    const textWidth = ctx.measureText(text).width;
    const startX = (canvas.width - textWidth) / 2 + 10;
    
    for (let i = 0; i < text.length; i++) {
      // Rotar ligeramente cada carácter
      const charWidth = ctx.measureText(text[i]).width;
      const x = startX + i * 20;
      const y = canvas.height / 2 + Math.random() * 8 - 4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      
      // Usar colores diferentes para cada carácter
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
    
    // Añadir puntos de ruido
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
  };

  // Verificar el captcha
  const verifyCaptcha = () => {
    if (userInput.toLowerCase() === captchaText.toLowerCase()) {
      setIsVerified(true);
      setErrorMessage('');
      onVerify && onVerify(true);
    } else {
      setErrorMessage('El código no coincide. Intenta nuevamente.');
      generateCaptcha();
      onVerify && onVerify(false);
    }
  };

  // Generar captcha inicial al montar el componente
  useEffect(() => {
    generateCaptcha();
  }, [difficulty]);

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="mb-4">
        <canvas 
          ref={canvasRef}
          width={200}
          height={70}
          className="bg-gray-100 rounded-lg shadow-inner mx-auto"
        />
      </div>
      
      <div className="mb-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ingresa el código"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isVerified}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={verifyCaptcha}
          disabled={userInput.length < 1 || isVerified}
          className={`px-4 py-2 rounded-md text-white flex-grow ${
            isVerified ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isVerified ? '✓ Verificado' : 'Verificar'}
        </button>
        
        <button
          onClick={generateCaptcha}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          ↻
        </button>
      </div>
      
      {errorMessage && (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default Captcha;
