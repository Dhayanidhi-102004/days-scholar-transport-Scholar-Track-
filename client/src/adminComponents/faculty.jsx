import React, { useState } from 'react';
import axios from 'axios';
import img from './images/Bannari.png';
import { FaUserCircle } from "react-icons/fa";
import { FaLock } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa";
import { useNavigate,Link } from 'react-router-dom';

const FacultyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3009/faculty/login', { email, password });
      if (response.data === 'Success') {
        // Store the user's authentication status in session storage
        sessionStorage.setItem('facultyEmail', email);
        sessionStorage.setItem('isFacultyLoggedIn',true);
        navigate('/facultyPage'); // Redirect to dashboard page
        window.location.reload(); // Refresh the page
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.log(err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="container-fluid d-flex flex-column vh-100 w-100 align-items-center justify-content-center text-center">
      <div className="image">
        <img id='image' src={img} alt="Bannari Logo" />
      </div>
      <h2 className="text-center">Dayscholar Transport</h2>
      <div className="container bg-primary-subtle rounded-4" style={{ width: '500px', maxWidth: '90%', padding: '20px' }}>
        <h2>Faculty Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3" id='userinput'>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="input-group-text"><FaUserCircle /></span>
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
          <div className="d-flex justify-content-between mb-3">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label me-5" htmlFor="rememberMe">Remember me</label>
            </div>
            <a className='forgot' href='#'>Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Login</button>
        </form>
        <div className="register-link mt-3">
            <p>Don't have an account? <Link to="/facultyRegister">Create One</Link></p>
          </div>
        <p className="text-center mt-3">Or</p>
        <button className="btn btn-outline-dark btn-block">Continue With Google <FaGoogle /></button>
      </div>
    </div>
  );
};

export default FacultyLogin;
