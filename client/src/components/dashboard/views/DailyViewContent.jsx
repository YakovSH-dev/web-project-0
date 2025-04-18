import React from 'react';
import { useTranslation } from 'react-i18next';
import TaskCard from '../../tasks/TaskCard'; // Adjust path if necessary

// This component receives the tasks for the specific day and renders them.
function DailyViewContent({ tasks, onTaskCardClick, onToggleComplete }) {
  const { t } = useTranslation();

  if (!tasks || !Array.isArray(tasks)) {
    // Should ideally not happen if parent handles loading/error states,
    // but good to have a fallback.
    console.warn('DailyViewContent received invalid tasks prop:', tasks);
    return <div className="text-center p-4 text-gray-500">{t('common.noDataAvailable', 'No data available')}</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center p-4 text-gray-500">{t('noTasksDay')}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
      {tasks.map(task => (
        <TaskCard
          key={task._id}
          task={task}
          onCardClick={onTaskCardClick} // Pass down click handler
          onToggleComplete={onToggleComplete} // Pass down toggle handler
        />
      ))}
    </div>
  );
}

export default DailyViewContent; 