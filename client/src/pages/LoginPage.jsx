import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('loginTitle')}</h2>
        <LoginForm />
        <p className="text-center mt-4 text-sm text-gray-600">
          {t('noAccountPrompt')} {' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            {t('registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage; 