import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/auth/RegisterForm';

function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('registerTitle')}</h2>
        <RegisterForm />
        <p className="text-center mt-4 text-sm text-gray-600">
          {t('haveAccountPrompt')} {' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage; 