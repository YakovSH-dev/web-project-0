import React from 'react';
import { useTranslation } from 'react-i18next';

function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('welcomeMessage')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Row */}
          <div className="bg-white p-4 shadow rounded order-1 md:order-1">{t('aiAssistant')}</div>
          <div className="bg-white p-4 shadow rounded order-2 md:order-2">{t('upcomingAssignments')}</div>
          {/* Bottom Row */}
          <div className="bg-white p-4 shadow rounded order-3 md:order-3">{t('gaps')}</div>
          <div className="bg-white p-4 shadow rounded order-4 md:order-4">{t('mainView')}</div>
      </div>
    </div>
  );
}

export default DashboardPage; 