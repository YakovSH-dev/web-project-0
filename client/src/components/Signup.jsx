// client/src/components/Signup.jsx

import React, { useState } from 'react';

function Signup() {
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  // State for loading indicator during submission
  const [isLoading, setIsLoading] = useState(false);
  // State for displaying success or error messages
  const [message, setMessage] = useState('');

  // Handler for input field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default page reload on form submission
    setIsLoading(true);
    setMessage('Creating account...');

    const signupApiUrl = 'https://diakstra.onrender.com/api/auth/signup'; // Your backend signup URL

    try {
      const response = await fetch(signupApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send name, email, password
      });

      const data = await response.json(); // Attempt to parse JSON response body

      if (!response.ok) {
        // If response status is not 2xx, throw an error using the message from backend
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful signup
      console.log('Signup successful:', data);
      setMessage(`Success: ${data.message || 'Account created!'}`);
      // Clear the form on success
      setFormData({ name: '', email: '', password: '' }); 

    } catch (error) {
      // Handle errors from fetch or non-ok response
      console.error('Error during signup:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      // Set loading back to false regardless of success or error
      setIsLoading(false);
    }
  };

  // Basic styling (can be moved to CSS)
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginTop: '20px', // Add some space above the form
  };

  const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const buttonStyle = {
    padding: '10px 15px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: isLoading ? 'wait' : 'pointer',
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          style={inputStyle}
          required 
        />
        <input
          type="email" // Use type="email" for better validation/mobile experience
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          style={inputStyle}
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          style={inputStyle}
          required
          minLength={6} // Example: Enforce minimum password length
        />
        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {/* Display success or error messages */}
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default Signup;
