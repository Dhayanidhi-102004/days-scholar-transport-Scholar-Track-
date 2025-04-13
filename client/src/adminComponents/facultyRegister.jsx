import React, { useState } from 'react';
import axios from 'axios';
import img from './images/Bannari.png';
import { FaUserCircle, FaLock, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const FacultyRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    contact: '',
    place: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [place, setPlace] = useState('');


  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3009/faculty/register-request', formData);
  
      if (response.data.message === 'Registration request sent to admin') {
        setSuccess('Request sent to admin! Awaiting approval...');
        setFormData({
          name: '',
          department: '',
          contact: '',
          place: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => navigate('/faculty'), 3000);
      } else {
        setError('Request failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An error occurred. Please try again later.');
    }
  };
  return (
    <div className="container-fluid d-flex flex-column vh-100 w-100 align-items-center justify-content-center text-center">
      <div className="image">
        <img id='image' src={img} alt="Bannari Logo" />
      </div>
      <h2 className="text-center">Day Scholar Transport</h2>
      <div className="container bg-primary-subtle rounded-4" style={{ width: '500px', maxWidth: '90%', padding: '20px' }}>
        <h2>Faculty Registration</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
  <input type="text" className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
  <span className="input-group-text"><FaUserCircle /></span>
</div>
<div className="input-group mb-3">
  <input type="text" className="form-control" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
  <span className="input-group-text"><FaUserCircle /></span>
</div>
<div className="input-group mb-3">
  <input type="tel" className="form-control" placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
  <span className="input-group-text"><FaUserCircle /></span>
</div>
<div className="input-group mb-3">
  <input type="text" className="form-control" placeholder="Place" value={place} onChange={(e) => setPlace(e.target.value)} required />
  <span className="input-group-text"><FaUserCircle /></span>
</div>


          <div className="input-group mb-3">
            <input type='email' className="form-control" name="email" placeholder='Email' value={formData.email} onChange={handleChange} required />
            <span className="input-group-text"><FaEnvelope /></span>
          </div>

          <div className="input-group mb-3">
            <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <span className="input-group-text"><FaLock /></span>
          </div>

          <div className="input-group mb-3">
            <input type="password" className="form-control" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            <span className="input-group-text"><FaLock /></span>
          </div>

          <button type='submit' className="btn btn-primary btn-block">Register</button>
        </form>
      </div>
    </div>
  );
};

export default FacultyRegistration;
