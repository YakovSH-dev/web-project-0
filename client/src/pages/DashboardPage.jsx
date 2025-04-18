import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function DashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    // TODO: Implement proper auth context/store logout
    localStorage.removeItem('authToken');
    console.log('Logged out, navigating to /login');
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Placeholder for Header/Layout */} 
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{t('dashboardTitle')}</h1>
        <div className="flex items-center space-x-2">
           <button 
            onClick={() => changeLanguage('en')} 
            disabled={i18n.language === 'en'}
            className={`px-3 py-1 text-sm rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
          <button 
            onClick={() => changeLanguage('he')} 
            disabled={i18n.language === 'he'}
            className={`px-3 py-1 text-sm rounded ${i18n.language === 'he' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
           >
            עברית
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('logoutButton')}
          </button>
        </div>
      </header>
      
      <main className="p-4">
        <h2 className="text-2xl mb-4">{t('welcomeMessage')}</h2>
        {/* Placeholder for dashboard panels (Corrected Order) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Row */}
            <div className="bg-white p-4 shadow rounded order-1 md:order-1">{t('aiAssistant')}</div>
            <div className="bg-white p-4 shadow rounded order-2 md:order-2">{t('upcomingAssignments')}</div>
            {/* Bottom Row */}
            <div className="bg-white p-4 shadow rounded order-3 md:order-3">{t('gaps')}</div>
            <div className="bg-white p-4 shadow rounded order-4 md:order-4">{t('mainView')}</div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage; 