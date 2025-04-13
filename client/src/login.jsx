import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUserCircle, FaLock } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from 'react-router-dom';
import img from './images/Bannari.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [rollno, setRollno] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:3009/login', {
        email: username,
        password: rollno,
      });

      if (response.data === 'Success') {
        sessionStorage.setItem('isUserLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        navigate('/home');
        window.location.reload(); // Optional: only if needed
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google decoded email:", decoded.email); 

      const response = await axios.post('http://localhost:3009/google-auth', {
        token: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
      });

      if (response.data.success) {
        sessionStorage.setItem('isUserLoggedIn', 'true');
        sessionStorage.setItem('username', decoded.email);
        sessionStorage.setItem('userName', decoded.name);
        navigate('/home');
      } else {
        setError('Google authentication failed');
      }
    } catch (error) {
      setError('Failed to authenticate with Google');
    }
  };

  const handleGoogleLoginFailure = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId="530954320025-4klhga9id7rlhl15jat5scaek8o876le.apps.googleusercontent.com" redirectUri={window.location.origin + "/auth/google/callback"}>
      <div className="container-fluid d-flex flex-column vh-100 align-items-center justify-content-center text-center">
        <div className="image mb-3">
          <img id="image" src={img} alt="Bannari Logo" />
        </div>
        <h2>Day's Scholar Transport</h2>
        <div className="container bg-primary-subtle rounded-4 mt-3" style={{ width: '500px', maxWidth: '90%', padding: '20px' }}>
          <h2>Login</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <span className="input-group-text"><FaUserCircle /></span>
            </div>

            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={rollno}
                onChange={(e) => setRollno(e.target.value)}
                required
              />
              <span className="input-group-text"><FaLock /></span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>

          <div className="register-link mt-3">
            <p>Don't have an account? <Link to="/register">Create One</Link></p>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <Link to="/admin">Admin Login</Link>
            <Link to="/faculty">Faculty Login</Link>
          </div>

          <p className="text-center">Or</p>

          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              useOneTap
              text="continue_with"
              shape="rectangular"
              size="large"
              width="300"
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
