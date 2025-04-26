import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

/**
 * Componente para generar códigos QR
 */
const QRCodeGenerator = ({
  value,
  size = 128,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'H',
  includeMargin = true,
  renderAs = 'canvas',
  downloadable = false,
  downloadName = 'qr-code'
}) => {
  const [qrValue, setQrValue] = useState(value);

  useEffect(() => {
    setQrValue(value);
  }, [value]);

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${downloadName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center">
      <QRCode
        id="qr-code"
        value={qrValue}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
        renderAs={renderAs}
      />
      
      {downloadable && (
        <button
          onClick={downloadQRCode}
          className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Descargar QR
        </button>
      )}
    </div>
  );
};

export default QRCodeGenerator;
