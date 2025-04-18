import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../../services/auth';

function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginUser({ email, password });
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('Login successful, navigating to dashboard...');
        navigate('/');
      } else {
        setError(t('loginFailed'));
      }
    } catch (err) {
      console.error('Login form error:', err);
      setError(err.message || t('loginError'));
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
      <div>
        <label 
          htmlFor="login-email" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('emailLabel')}
        </label>
        <input
          type="email"
          id="login-email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label 
          htmlFor="login-password" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('passwordLabel')}
        </label>
        <input
          type="password"
          id="login-password"
          required
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
          {isLoading ? t('loggingInButton') : t('loginButton')}
        </button>
      </div>
    </form>
  );
}

export default LoginForm; 