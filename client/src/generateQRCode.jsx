import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';

const GenerateQRCode = ({ studentDetails }) => {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (studentDetails.email) {
      // Generate QR value using email and timestamp
      const uniqueValue = `${studentDetails.email}-${Date.now()}`;
      setQrValue(uniqueValue);

      // Optionally, send the generated value to the backend to store temporarily
      axios.post('http://localhost:3009/api/save-qr', { qrValue })
        .catch(err => console.error('Error saving QR value:', err));
    }
  }, [studentDetails]);

  return (
    <div>
      <h4>Scan this QR Code to mark your attendance:</h4>
      {qrValue ? <QRCode value={qrValue} /> : <p>Generating QR Code...</p>}
    </div>
  );
};

export default GenerateQRCode;
