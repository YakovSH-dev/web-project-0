import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth';

function RegisterForm() {
  const [name, setName] = useState(''); // Optional name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userData = { email, password };
      if (name.trim()) {
        userData.name = name.trim();
      }
      
      await registerUser(userData);
      // If registration is successful, show success message
      // Optionally, automatically log the user in and redirect, 
      // but that requires the backend register endpoint to return a token.
      // For now, show success and let them log in manually.
      setSuccess('Registration successful! You can now log in.');
      // Optionally clear the form
      setName('');
      setEmail('');
      setPassword('');
      // Maybe redirect to login after a short delay?
      // setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error('Registration form error:', err);
      // Extract specific validation errors if backend provides them
      if (err.errors) {
        const messages = Object.values(err.errors).map(e => e.message).join(', ');
        setError(`Registration failed: ${messages}`);
      } else {
        setError(err.message || 'An error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
       <div>
        <label 
          htmlFor="register-name" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name (Optional)
        </label>
        <input
          type="text"
          id="register-name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label 
          htmlFor="register-email" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="register-email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label 
          htmlFor="register-password" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          id="register-password"
          required
          minLength="6" // Add basic validation example
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm; 