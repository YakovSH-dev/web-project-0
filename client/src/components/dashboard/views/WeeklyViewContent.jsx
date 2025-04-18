import React from 'react';
import { useTranslation } from 'react-i18next';

// Placeholder for Weekly View Content
function WeeklyViewContent({ weeklyData }) {
  const { t } = useTranslation();

  // TODO: Implement actual week view rendering logic
  // weeklyData structure is expected to be an array of objects, each with:
  // { courseId, courseName, courseColor, instances: [...] }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">{t('viewWeek', 'Week View')} - {t('common.toBeImplemented', 'To Be Implemented')}</h2>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
        {JSON.stringify(weeklyData, null, 2)}
      </pre>
      {/* Add actual rendering logic here later */}
    </div>
  );
}

export default WeeklyViewContent; 