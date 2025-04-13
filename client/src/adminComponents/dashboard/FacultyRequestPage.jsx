import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FacultyRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:3009/faculty/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3009/approve/${id}`);
      setMessage(res.data.message);
      fetchRequests(); // refresh the list
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:3009/reject/${id}`);
      setMessage(res.data.message);
      fetchRequests(); // refresh the list
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Pending Faculty Requests</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {requests.length === 0 ? (
        <div className="text-muted text-center">No pending requests.</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Place</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.name}</td>
                <td>{req.department}</td>
                <td>{req.contact}</td>
                <td>{req.place}</td>
                <td>{req.email}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleApprove(req._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(req._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FacultyRequestPage;
