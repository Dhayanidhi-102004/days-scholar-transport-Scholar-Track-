import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import "./facultyDashboard.css";

const FacultyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [facultyDetails, setFacultyDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isFacultyLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/faculty');
    }
    //const facultyEmail = sessionStorage.getItem('facultyEmail');

    

    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:3009/students");
        setStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load student list. Please try again.");
      }
    };

    //fetchFacultyDetails();
    fetchStudents();
  }, [navigate]);

  const handleAttendanceChange = (studentId, isChecked) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: isChecked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sessionId = `manual-${Date.now()}`;
    try {
      const response = await axios.post("http://localhost:3009/attendance", {
        date,
        attendance,
        sessionId,
      });
      if (response.status === 200) {
        alert("Attendance submitted successfully!");
        setAttendance({});
      }
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setError("Failed to submit attendance. Please try again.");
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get("http://localhost:3009/attendance", {
        params: { date: historyDate },
      });
      setAttendanceHistory(response.data);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setError("Failed to load attendance history. Please try again.");
    }
  };

  const generateOtp = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const facultyEmail = sessionStorage.getItem('facultyEmail');
    console.log(facultyEmail);
    setOtp(newOtp);
    setTimer(30); // 5 minutes in seconds

    try {
      await axios.post("http://localhost:3009/store-otp", {
        email: facultyEmail,
        otp: newOtp,
      });
      alert("OTP generated and will expire in 5 minutes!");
    } catch (error) {
      console.error("Error storing OTP:", error);
      alert("Failed to generate OTP.");
    }
  };

  const generateQrCode = async () => {
    const sessionId = `qr-${Date.now()}`;
    const date = new Date().toISOString().slice(0, 10);
    const facultyEmail = sessionStorage.getItem('facultyEmail');
  
    const qrData = {
      sessionId,
      date,
      facultyEmail,
      type: "qr-attendance",
    };
  
    try {
      await axios.post("http://localhost:3009/qr-session", qrData);
      setQrValue(JSON.stringify(qrData));
      setTimer(30);  // start QR expiration countdown
    } catch (err) {
      console.error("Error generating QR session:", err);
      setError("Failed to generate QR code. Please try again.");
    }
  };
  
  
  


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setOtp('');
      setQrValue('');
    }
  }, [timer]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="d-flex vh-100">
      <div className="sidebar bg-primary text-white p-3">
        <h3>Faculty Dashboard</h3>
        <ul className="list-unstyled">
          <li>
            <button className="btn btn-link text-white w-100 text-start">Home</button>
          </li>
          <li>
            <button className="btn btn-link text-white w-100 text-start" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="flex-grow-1 p-4">
        <h2>Welcome, {facultyDetails.name || 'Faculty'}</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h4>Manual Attendance</h4>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="attendanceDate">Date:</label>
                    <input
                      type="date"
                      id="attendanceDate"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Name</th>
                          <th>Present</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student._id}>
                            <td>{student.rollno}</td>
                            <td>{student.name}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={attendance[student._id] || false}
                                onChange={(e) =>
                                  handleAttendanceChange(student._id, e.target.checked)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3">
                    Submit Attendance
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h4>QR Code Attendance</h4>
                <button className="btn btn-primary mb-3" onClick={generateQrCode}>
                  Generate QR Code
                </button>
                {qrValue && (
                  <div className="text-center">
                    <QRCode value={qrValue} size={200} />
                    <p>Expires in: {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}</p>
                    <p>Session ID: {JSON.parse(qrValue).sessionId}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h4>OTP Attendance</h4>
                <button className="btn btn-primary mb-3" onClick={generateOtp}>
                  Generate OTP
                </button>
                {otp && (
                  <div className="alert alert-info">
                    <h5>OTP: {otp}</h5>
                    <p>Expires in: {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}</p>
                    <p>Share this OTP with students</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <h4>Attendance History</h4>
            <div className="mb-3">
              <label htmlFor="historyDate">Select Date:</label>
              <input
                type="date"
                id="historyDate"
                className="form-control"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
              />
              <button
                className="btn btn-secondary mt-2"
                onClick={fetchAttendanceHistory}
              >
                View Attendance
              </button>
            </div>
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.length > 0 ? (
                    attendanceHistory.map((record, index) => (
                      <tr key={index}>
                        <td>{record.rollno}</td>
                        <td>{record.name}</td>
                        <td>{record.status}</td>
                        <td>{record.markedBy}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No attendance records found for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;