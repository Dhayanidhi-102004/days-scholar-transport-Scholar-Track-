import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function StudentDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { student } = state;
  console.log(student._id);

  return (
    <div className="student-details-container">
      <h3>Student Details</h3>
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>Gender:</strong> {student.gender}</p>
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Roll No:</strong> {student.rollno}</p>
      <p><strong>Bus Source:</strong> {student.busSource}</p>
      <p><strong>Bus No:</strong> {student.busNo}</p>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}

export default StudentDetails;
