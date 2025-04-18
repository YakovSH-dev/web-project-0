import React from 'react';
import { useTranslation } from 'react-i18next';
import TaskCard from '../../tasks/TaskCard'; // Adjust path if necessary

// Displays task instances for a week, grouped by course.
function WeeklyViewContent({ weeklyData, onTaskCardClick, onToggleComplete }) {
  const { t } = useTranslation();

  // Basic validation and loading/empty state handling
  if (!weeklyData || !Array.isArray(weeklyData)) {
    console.warn('WeeklyViewContent received invalid weeklyData prop:', weeklyData);
    // Use theme text color for placeholder/error
    return <div className="text-center p-4 text-theme-text-secondary">{t('common.noDataAvailable', 'No data available')}</div>;
  }

  if (weeklyData.length === 0) {
    // Use theme text color
    return <div className="text-center p-4 text-theme-text-secondary">{t('noTasksWeek', 'No tasks scheduled for this week.')}</div>;
  }

  return (
    // Main container for the weekly view
    <div className="space-y-6 p-1">
      {weeklyData.map(courseGroup => (
        // Section for each course
        <div key={courseGroup.courseId} className="bg-theme-bg p-3 rounded-lg shadow">
          {/* Course Header */}
          <div className="flex items-center mb-3 pb-2 border-b border-theme-secondary">
            <div 
              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: courseGroup.courseColor || '#808080' }} 
            ></div>
            <h3 className="text-md font-semibold text-theme-text-primary truncate">
              {courseGroup.courseName || t('noCourse', 'Uncategorized')}
            </h3>
          </div>

          {/* Task Cards for this course */}
          {courseGroup.instances && courseGroup.instances.length > 0 ? (
            // Use flex wrap for the cards within the course group
            <div className="flex flex-wrap -m-2"> 
              {courseGroup.instances.map(taskInstance => {
                // Log the task instance to check its structure
                console.log('WeeklyView Task Instance:', JSON.stringify(taskInstance, null, 2)); 
                return (
                  <div key={taskInstance._id} className="p-2"> 
                    <TaskCard 
                      task={taskInstance} 
                      onCardClick={onTaskCardClick} 
                      onToggleComplete={onToggleComplete} // Pass the handler
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // Use theme text color for placeholder
            <p className="text-sm text-theme-text-secondary px-2">{t('noTasksCourseWeek', 'No tasks for this course this week.')}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default WeeklyViewContent; 