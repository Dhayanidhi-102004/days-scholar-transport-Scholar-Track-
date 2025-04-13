import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function StudentAttendance() {
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3009/attendance', {
        params: { date: historyDate },
      });
      setAttendanceHistory(response.data);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      setError('Failed to load attendance history. Please try again.');
    }
  };
  return (
    <div className="main-container">
            <div className="main-title">
            <h2 className="mt-5">Attendance History</h2>
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
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.length > 0 ? (
              attendanceHistory.map((record, index) => (
                <tr key={index}>
                  <td>{record.rollno}</td>
                  <td>{record.name}</td>
                  <td>{record.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No attendance records found for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        </div>
  )
}
