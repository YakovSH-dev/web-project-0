import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">{t('pageNotFound')}</h2>
      <p className="text-gray-700 mb-8">{t('pageNotFoundMessage')}</p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
      >
        {t('goToDashboard')}
      </Link>
    </div>
  );
}

export default NotFoundPage; 