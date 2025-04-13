import React, { useState } from 'react';
import axios from 'axios';
import img from './images/Bannari.png';
import { FaUserCircle, FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const AdminRegistration = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3009/admin/register', { email, password });
      if (response.data.message === 'Admin registered successfully') {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.log(err);
      setError('An error occurred. Please try again later.');
    }
  };
  
  return (
    <>
      <div className="container-fluid d-flex flex-column vh-100 w-100 align-items-center justify-content-center text-center">
      <div className="image">
          <img id='image' src={img} alt="Bannari Logo" />
        </div>
        <h2 className="text-center">Day's Scholar Transport</h2>
        <div className="container bg-primary-subtle rounded-4" style={{ width: '500px', maxWidth: '90%', padding: '20px' }}>
          <h2>Admin Registration</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3" id='userinput'>
              <input type='email' className="form-control" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
              <span className="input-group-text"><FaEnvelope /></span>
            </div>
            <div className="input-group mb-3" id='userinput'>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="input-group-text"><FaLock /></span>
            </div>
            <div className="input-group mb-3" id='userinput'>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="input-group-text"><FaLock /></span>
            </div>
            <button type='submit' className="btn btn-primary btn-block">Register</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminRegistration;
