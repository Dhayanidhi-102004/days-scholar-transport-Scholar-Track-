import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';
import './Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentDashboard = () => {
  const [studentDetails, setStudentDetails] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [scanResult, setScanResult] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
const [cameraReady, setCameraReady] = useState(false); // Add this


  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isUserLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/');
    }

    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get('http://localhost:3009/studentDetails', {
          params: { email: sessionStorage.getItem('username') }
        });
        setStudentDetails(response.data.details);
        setAttendance(response.data.attendance || []);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to load student details. Please try again later.');
      }
    };

    fetchStudentDetails();
  }, [navigate, success]);

  const handleScan = (data) => {
    if (data && !scanResult) {
      setScanResult(data);
      setScanning(false);
      console.log("QR Scan Result:", data);
    }
  };
  
  const handleError = (err) => {
    console.error("QR Scan Error:", err);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleSubmitAttendance = async (method) => {
    if (method === 'qr' && !scanResult) {
      setError('Please scan the QR code first!');
      return;
    }

    if (method === 'otp' && !otp) {
      setError('Please enter the OTP!');
      return;
    }

    try {
      const endpoint = method === 'qr' 
        ? '/mark-attendance-qr' 
        : '/mark-attendance-otp';
      
      const payload = method === 'qr'
        ? { sessionId: scanResult, studentEmail: sessionStorage.getItem('username') }
        : { otp, studentEmail: sessionStorage.getItem('username') };

      const response = await axios.post(`http://localhost:3009${endpoint}`, payload);

      if (response.status === 200) {
        setSuccess(`Attendance marked successfully via ${method.toUpperCase()}!`);
        setError('');
        setScanResult('');
        setOtp('');
        
        // Refresh attendance data
        const updatedResponse = await axios.get('http://localhost:3009/studentDetails', {
          params: { email: sessionStorage.getItem('username') }
        });
        setAttendance(updatedResponse.data.attendance || []);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Error marking attendance. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="d-flex">
      <div className="sidebar bg-primary text-white p-3">
        <h3>Student Dashboard</h3>
        <ul className="list-unstyled">
          <li>
            <button className="btn btn-link text-white w-100 text-start" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content flex-grow-1 p-4">
        <h2>Welcome, {studentDetails.name || 'Student'}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h4>Student Details</h4>
                {studentDetails ? (
                  <>
                    <p><strong>Name:</strong> {studentDetails.name}</p>
                    <p><strong>Roll Number:</strong> {studentDetails.rollno}</p>
                    <p><strong>Degree:</strong> {studentDetails.degree}</p>
                    <p><strong>Department:</strong> {studentDetails.dept}</p>
                    <p><strong>Year of Study:</strong> {studentDetails.year}</p>
                    <p><strong>Email:</strong> {studentDetails.email}</p>
                  </>
                ) : (
                  <p>Loading student details...</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h4>Attendance History</h4>
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.length > 0 ? (
                        attendance.map((entry, index) => (
                          <tr key={index}>
                            <td>{new Date(entry.date).toLocaleDateString()}</td>
                            <td>{entry.status}</td>
                            <td>{entry.markedBy}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No attendance records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h4>Mark Attendance via QR Code</h4>
                <div className="mb-3 position-relative" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
  {scanning && (
    <>
      <div className="scanner-frame position-absolute top-0 start-0 w-100 h-100 border border-light rounded" style={{
        border: '3px dashed #0d6efd',
        borderRadius: '12px',
        zIndex: 2,
        pointerEvents: 'none'
      }}></div>

      <QrReader
        constraints={{ facingMode: 'environment' }}
        scanDelay={500}
        onResult={(result, error) => {
          if (result?.text) {
            handleScan(result.text);
            setScanning(false); // Stop scanning after success
          }
          if (error) handleError(error);
        }}
        videoStyle={{ borderRadius: '12px' }}
        style={{ width: '100%' }}
      />
    </>
  )}

  {!scanning && !scanResult && (
    <p className="text-muted mt-2">Scanner paused. Click to rescan.</p>
  )}
</div>

{scanResult ? (
  <>
    <p className="text-success mt-2">QR Code scanned successfully!</p>
    <button 
      className="btn btn-primary"
      onClick={() => handleSubmitAttendance('qr')}
    >
      Submit QR Attendance
    </button>
    <button 
      className="btn btn-secondary ms-2"
      onClick={() => {
        setScanResult('');
        setScanning(true); // Rescan
      }}
    >
      Scan Again
    </button>
  </>
) : (
  !scanning && (
    <button 
      className="btn btn-outline-primary"
      onClick={() => setScanning(true)}
    >
      Start Scanning
    </button>
  )
)}


                
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h4>Mark Attendance via OTP</h4>
                <div className="mb-3">
                  <label htmlFor="otpInput" className="form-label">Enter OTP:</label>
                  <input
                    type="text"
                    id="otpInput"
                    className="form-control"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSubmitAttendance('otp')}
                  disabled={!otp}
                >
                  Submit OTP Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;