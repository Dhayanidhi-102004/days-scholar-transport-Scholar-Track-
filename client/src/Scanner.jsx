import React from 'react';
import QrReader from 'react-qr-scanner';
import axios from 'axios';

const ScanQRCode = ({ onAttendanceMarked }) => {
  const handleScan = (data) => {
    if (data) {
      // Send scanned QR data to backend for validation
      axios.post('http://localhost:3009/api/mark-attendance', { qrValue: data.text })
        .then(response => {
          alert(response.data.message);
          if (onAttendanceMarked) onAttendanceMarked();
        })
        .catch(err => console.error('Error marking attendance:', err));
    }
  };

  const handleError = (err) => {
    console.error('Error scanning QR code:', err);
  };

  return (
    <div>
      <h4>Scan QR Code:</h4>
      <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} />
    </div>
  );
};

export default ScanQRCode;
