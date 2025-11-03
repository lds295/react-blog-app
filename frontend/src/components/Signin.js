import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signin({ onLogin }) { // Receives onLogin from App.js
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/login', {
          userId: formData.userId,
          password: formData.password
      });
      
      onLogin(response.data.user); // Pass the user data up to App.js
      navigate('/blogs'); // Redirect to blog feed
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">User ID</label>
          <input
            type="text"
            className="form-control"
            id="userId"
            name="userId"
            placeholder="Enter your user ID"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Login</button>
      </form>
      <div className="auth-switch">
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Signin;