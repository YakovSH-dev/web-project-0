// client/src/components/Login.jsx

import React, { useState } from 'react';

// Accept onLoginSuccess function as a prop
function Login({ onLoginSuccess }) { 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setIsLoading(true);
    setMessage('Logging in...');

    const loginApiUrl = 'https://diakstra.onrender.com/api/auth/login'; 

    try {
      const response = await fetch(loginApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Login successful:', data);

      if (data.token) {
        // Store the token locally
        localStorage.setItem('authToken', data.token); 
        setMessage(`Success: ${data.message || 'Logged in!'}`);
        setFormData({ email: '', password: '' }); 

        // Call the callback function passed from App, providing the token
        if (onLoginSuccess) {
          onLoginSuccess(data.token); 
        }
        
        console.log("Token stored in localStorage:", localStorage.getItem('authToken')); 
      } else {
         throw new Error('Login successful, but no token received.');
      }

    } catch (error) {
      console.error('Error during login:', error);
      setMessage(`Error: ${error.message}`);
      localStorage.removeItem('authToken'); 
    } finally {
      setIsLoading(false);
    }
  };

  // Styles (same as before)
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' };
  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
  const buttonStyle = { padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: isLoading ? 'wait' : 'pointer' };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={inputStyle} required />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" style={inputStyle} required />
        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default Login;
