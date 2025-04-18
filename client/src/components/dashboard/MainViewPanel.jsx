// src/components/dashboard/MainViewPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSemester } from '../../context/SemesterContext';
import { getDailyView, getWeeklyView, getSemesterView } from '../../services/views';
import { updateTaskInstance } from '../../services/taskInstance';
// Removed TaskCard import

// Import the new view content components
import DailyViewContent from './views/DailyViewContent';
import WeeklyViewContent from './views/WeeklyViewContent';
import SemesterViewContent from './views/SemesterViewContent';

// Helper function to get the start of the current week (Sunday)
const getStartOfWeek = (date = new Date()) => {
  const dt = new Date(date);
  const day = dt.getDay(); // 0 = Sunday
  const diff = dt.getDate() - day;
  dt.setDate(diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

// Helper to format date for display (e.g., "Mon Jul 15, 2024")
const formatDateForDisplay = (date, locale = 'en-US') => {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
  });
};

function MainViewPanel() {
  const { t, i18n } = useTranslation();
  const { activeSemesterId, isLoadingSemesters } = useSemester();
  
  const [viewType, setViewType] = useState('day'); // 'day', 'week', 'semester'
  const [currentDate, setCurrentDate] = useState(new Date()); // For day/week navigation
  const [viewData, setViewData] = useState(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [errorView, setErrorView] = useState(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    // Don't fetch if semester isn't loaded or selected
    if (isLoadingSemesters || !activeSemesterId) {
        setViewData(null); // Clear previous data if semester changes/loads
        return; 
    }

    setErrorView(null);
    setIsLoadingView(true);
    setViewData(null); // Clear data before fetching new view
    console.log(`MainViewPanel: Fetching ${viewType} view for semester ${activeSemesterId}`);

    let fetchPromise;
    if (viewType === 'day') {
        fetchPromise = getDailyView(currentDate);
    } else if (viewType === 'week') {
        const weekStart = getStartOfWeek(currentDate);
        fetchPromise = getWeeklyView(weekStart);
    } else { // semester view
        fetchPromise = getSemesterView(activeSemesterId);
    }

    fetchPromise
      .then(data => {
          console.log(`MainViewPanel: ${viewType} view data received:`, data);
          setViewData(data);
      })
      .catch(error => {
          console.error(`MainViewPanel: Error fetching ${viewType} view:`, error);
          setErrorView(error);
          setViewData(null);
      })
      .finally(() => {
          setIsLoadingView(false);
      });

  }, [viewType, currentDate, activeSemesterId, isLoadingSemesters]);

  // --- Handlers for Navigation/View Change ---
  const handleViewChange = (newViewType) => {
      console.log(`Changing view to ${newViewType}`);
      setViewType(newViewType);
      // Reset date to today when switching views for simplicity?
      // setCurrentDate(new Date()); 
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
      setCurrentDate(new Date());
  };

  const handleTaskCardClick = (taskId) => {
    console.log(`MainViewPanel: Task card clicked: ${taskId}. Opening Task Window (TODO)`);
    // TODO: Implement logic to open the Task Window modal/view for this taskId
  };

  // --- Handler for Toggling Task Completion (with Optimistic Update) ---
  const handleToggleComplete = useCallback(async (instanceId, currentCompletedState) => {
      if (!viewData) return; // Guard against null data
      
      const newCompletedState = !currentCompletedState;
      // Need a deep copy for nested structures
      const originalViewData = JSON.parse(JSON.stringify(viewData)); 
      let updatedViewData = JSON.parse(JSON.stringify(viewData)); // Work on a copy
      let taskFound = false;

      try {
          if (viewType === 'day' && Array.isArray(updatedViewData)) {
              // --- Day View Logic ---
              updatedViewData = updatedViewData.map(task => {
                  if (task._id === instanceId) {
                      taskFound = true;
                      return { ...task, isCompleted: newCompletedState };
                  }
                  return task;
              });
          } else if (viewType === 'week' && Array.isArray(updatedViewData)) {
              // --- Week View Logic --- 
              updatedViewData.forEach(courseGroup => {
                  if (courseGroup.instances && Array.isArray(courseGroup.instances)) {
                      courseGroup.instances = courseGroup.instances.map(task => {
                           if (task._id === instanceId) {
                               taskFound = true;
                               // Also update isMissed flag based on new state
                               const isMissed = (new Date(task.date) < new Date()) && !newCompletedState;
                               return { ...task, isCompleted: newCompletedState, isMissed };
                           }
                           return task;
                      });
                  }
              });
          } else if (viewType === 'semester' && Array.isArray(updatedViewData)) {
              // --- Semester View Logic (Def x Week structure) --- 
              updatedViewData.forEach(courseGroup => {
                 if (courseGroup.definitions && Array.isArray(courseGroup.definitions)) {
                    courseGroup.definitions.forEach(definition => {
                        if (definition.weeks && Array.isArray(definition.weeks)) {
                           // Use map to return a new weeks array with updates
                           definition.weeks = definition.weeks.map(week => {
                               let weekUpdated = false;
                               let updatedTasks = [];
                               if (week.tasks && Array.isArray(week.tasks)) {
                                   updatedTasks = week.tasks.map(task => {
                                       if (task.instanceId === instanceId) {
                                           taskFound = true;
                                           weekUpdated = true;
                                           // Also update isMissed flag based on new state and AVAILABLE date
                                           const instanceDate = task.date ? new Date(task.date) : null;
                                           const isMissed = instanceDate && (instanceDate < new Date()) && !newCompletedState;
                                           return { ...task, isCompleted: newCompletedState, isMissed: isMissed };
                                       }
                                       return task;
                                   });
                               }
                               // Return the week object with the updated tasks array IF it was updated
                               return weekUpdated ? { ...week, tasks: updatedTasks } : week; 
                           });
                        }
                    });
                 }
              });
          } else {
               console.warn(`handleToggleComplete called for unknown viewType '${viewType}' or invalid data.`);
               await updateTaskInstance(instanceId, { isCompleted: newCompletedState });
               return; // Exit early
          }

          if (!taskFound) {
              console.warn(`Task with instanceId ${instanceId} not found in ${viewType} view data for optimistic update.`);
              await updateTaskInstance(instanceId, { isCompleted: newCompletedState });
              return; // Exit early
          }

          // Optimistic UI update
          setViewData(updatedViewData);
          console.log(`Optimistically updated task ${instanceId} completion to ${newCompletedState} in ${viewType} view.`);

          // Call API
          await updateTaskInstance(instanceId, { isCompleted: newCompletedState });
          console.log(`Task ${instanceId} updated successfully on backend.`);

      } catch (error) {
          console.error(`Failed to update task ${instanceId} on backend:`, error);
          // Rollback UI on error
          setViewData(originalViewData);
          alert(t('errorUpdatingTask', 'Error updating task status. Please try again.'));
      }
  }, [viewData, viewType, t]);

  // --- Render Logic ---
  const renderViewContent = () => {
      if (isLoadingView || isLoadingSemesters) {
          // Apply theme text color
          return <div className="text-center p-4 text-theme-text-secondary">{t('loading')}</div>;
      }
      if (errorView) {
          // Use theme text color, maybe keep error color red
          return <div className="text-center p-4 text-red-500">{t('errorLoadingView')}</div>;
      }
      if (!activeSemesterId) {
          // Apply theme text color
          return <div className="text-center p-4 text-theme-text-secondary">{t('noActiveSemester')}</div>;
      }
      if (viewData === null) { 
         // Apply theme text color
         return <div className="text-center p-4 text-theme-text-secondary">{t('noDataAvailable')}</div>;
      }

      // Render the appropriate view component
      // Pass handlers down
      switch (viewType) {
        case 'day':
          return <DailyViewContent 
                    tasks={viewData} // Pass data as tasks
                    onTaskCardClick={handleTaskCardClick} 
                    onToggleComplete={handleToggleComplete} 
                 />;
        case 'week':
          return <WeeklyViewContent 
                    weeklyData={viewData} // Pass data
                    onTaskCardClick={handleTaskCardClick} 
                    onToggleComplete={handleToggleComplete} // Pass toggle handler
                 />;
        case 'semester':
          return <SemesterViewContent 
                    semesterData={viewData} 
                    onToggleComplete={handleToggleComplete} // Pass toggle handler
                 />;
        default:
          return null; // Should not happen
      }
  };

  return (
    // Apply theme background and text color, remove shadow?
    <div className="bg-theme-bg-secondary text-theme-text-primary p-4 rounded h-full flex flex-col">
      {/* Header for View Controls */}
      {/* Apply theme border color */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-theme-secondary">
        {/* Date Navigation (only for day/week) */}
        {viewType !== 'semester' && (
          <div className="flex items-center space-x-2">
            {/* Apply theme text/hover colors */}
            <button onClick={handlePrev} className="p-1 rounded hover:bg-theme-secondary text-theme-text-secondary hover:text-theme-text-primary">&lt;</button>
            <button onClick={handleToday} className="px-3 py-1 rounded text-sm hover:bg-theme-secondary text-theme-text-secondary hover:text-theme-text-primary">{t('todayButton')}</button> {/* Add key */}
            <button onClick={handleNext} className="p-1 rounded hover:bg-theme-secondary text-theme-text-secondary hover:text-theme-text-primary">&gt;</button>
            {/* Apply theme text color */}
            <span className="text-lg font-semibold ml-4 text-theme-text-primary">
                {/* Display current date/week range */} 
                {viewType === 'day' && formatDateForDisplay(currentDate, i18n.language)}
                {viewType === 'week' && `${formatDateForDisplay(getStartOfWeek(currentDate), i18n.language)} - ${formatDateForDisplay(new Date(getStartOfWeek(currentDate).setDate(getStartOfWeek(currentDate).getDate() + 6)), i18n.language)}`}
            </span>
          </div>
        )}
        {/* Empty div for spacing if semester view */}
         {viewType === 'semester' && <div></div>}

        {/* View Type Switcher - Apply theme colors */} 
        <div className="flex space-x-1 border border-theme-secondary p-1 rounded-md">
          <button 
            onClick={() => handleViewChange('day')} 
            // Apply theme active/inactive/hover styles
            className={`px-3 py-1 text-sm rounded ${viewType === 'day' ? 'bg-theme-primary text-theme-bg font-semibold' : 'hover:bg-theme-secondary hover:text-theme-text-primary text-theme-text-secondary'}`}
          >
            {t('viewDay')} {/* Add key */}
          </button>
          <button 
            onClick={() => handleViewChange('week')} 
             // Apply theme active/inactive/hover styles
            className={`px-3 py-1 text-sm rounded ${viewType === 'week' ? 'bg-theme-primary text-theme-bg font-semibold' : 'hover:bg-theme-secondary hover:text-theme-text-primary text-theme-text-secondary'}`}
           >
             {t('viewWeek')} {/* Add key */}
          </button>
          <button 
            onClick={() => handleViewChange('semester')} 
             // Apply theme active/inactive/hover styles
            className={`px-3 py-1 text-sm rounded ${viewType === 'semester' ? 'bg-theme-primary text-theme-bg font-semibold' : 'hover:bg-theme-secondary hover:text-theme-text-primary text-theme-text-secondary'}`}
           >
             {t('viewSemester')} {/* Add key */}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {/* Let content components handle their own background/text? Or set defaults here? */}
      <div className="flex-grow overflow-auto">
        {renderViewContent()}
      </div>
    </div>
  );
}

export default MainViewPanel;
