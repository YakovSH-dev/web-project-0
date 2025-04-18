import React from 'react';
import { useTranslation } from 'react-i18next';
import MainViewPanel from '../components/dashboard/MainViewPanel';

function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Top Row - Spanning 2 columns each */}
          <div className="bg-white p-4 shadow rounded order-1 md:order-1 md:col-span-2">{t('aiAssistant')}</div>
          <div className="bg-white p-4 shadow rounded order-2 md:order-2 md:col-span-2">{t('upcomingAssignments')}</div>
          {/* Bottom Row - Spanning 1 and 3 columns */}
          <div className="bg-white p-4 shadow rounded order-3 md:order-3 md:col-span-1">{t('gaps')}</div>
          <div className="order-4 md:order-4 md:col-span-3">
              <MainViewPanel />
          </div>
      </div>
    </div>
  );
}

export default DashboardPage; 