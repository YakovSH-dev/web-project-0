import React from 'react';
import { useTranslation } from 'react-i18next';

// Placeholder for Semester View Content
function SemesterViewContent({ semesterData }) {
  const { t } = useTranslation();

  // TODO: Implement actual semester view rendering logic
  // semesterData structure is expected to be similar to weekly view:
  // an array of objects, each with course info and instances for the whole semester.

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">{t('viewSemester', 'Semester View')} - {t('common.toBeImplemented', 'To Be Implemented')}</h2>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
        {JSON.stringify(semesterData, null, 2)}
      </pre>
      {/* Add actual rendering logic here later */}
    </div>
  );
}

export default SemesterViewContent; 