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
  const handleToggleComplete = useCallback(async (taskId, currentCompletedState) => {
      // For Day view, viewData is an array of tasks.
      // For Week/Semester, it might be structured differently.
      // This handler might need to be passed further down or adapted.
      
      if (viewType === 'day' && viewData && Array.isArray(viewData)) {
          const newCompletedState = !currentCompletedState;
          const originalViewData = [...viewData];

          // Optimistic Update for Day View
          setViewData(prevData => 
              prevData.map(task => 
                  task._id === taskId ? { ...task, isCompleted: newCompletedState } : task
              )
          );

          try {
              console.log(`MainViewPanel: Updating task ${taskId} completion to ${newCompletedState}`);
              await updateTaskInstance(taskId, { isCompleted: newCompletedState });
              console.log(`MainViewPanel: Task ${taskId} updated successfully on backend.`);
          } catch (error) {
              console.error(`MainViewPanel: Failed to update task ${taskId} on backend:`, error);
              // Rollback Day View Data
              setViewData(originalViewData);
              alert(t('errorUpdatingTask')); // Add key
          }
      } else {
          console.warn('handleToggleComplete called for non-Day view or invalid data. Update needed.');
          // TODO: Implement logic for Week/Semester view optimistic updates/rollback if needed.
          // May involve finding the task within nested structures.
          // For now, just call the API without optimistic update for other views.
          try {
            await updateTaskInstance(taskId, { isCompleted: !currentCompletedState });
            // Re-fetch data for simplicity after update in non-day views?
            // Or pass the update handler down to the specific view component.
          } catch (error) {
             alert(t('errorUpdatingTask'));
          }
      }
  }, [viewData, viewType, t]);

  // --- Render Logic ---
  const renderViewContent = () => {
      if (isLoadingView || isLoadingSemesters) {
          return <div className="text-center p-4">{t('loading')}</div>;
      }
      if (errorView) {
          return <div className="text-center p-4 text-red-600">{t('errorLoadingView')}</div>;
      }
      if (!activeSemesterId) {
          return <div className="text-center p-4 text-gray-500">{t('noActiveSemester')}</div>;
      }
      if (viewData === null) { 
         return <div className="text-center p-4 text-gray-500">{t('noDataAvailable')}</div>;
      }

      // Render the appropriate view component
      switch (viewType) {
        case 'day':
          return <DailyViewContent 
                    tasks={viewData} // Pass data as tasks
                    onTaskCardClick={handleTaskCardClick} 
                    onToggleComplete={handleToggleComplete} 
                 />;
        case 'week':
          return <WeeklyViewContent weeklyData={viewData} />; // Pass data
        case 'semester':
          return <SemesterViewContent semesterData={viewData} />; // Pass data
        default:
          return null; // Should not happen
      }
  };

  return (
    <div className="bg-white p-4 shadow rounded h-full flex flex-col">
      {/* Header for View Controls */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        {/* Date Navigation (only for day/week) */}
        {viewType !== 'semester' && (
          <div className="flex items-center space-x-2">
            <button onClick={handlePrev} className="p-1 rounded hover:bg-gray-200 text-gray-600">&lt;</button>
            <button onClick={handleToday} className="px-3 py-1 rounded text-sm hover:bg-gray-200 text-gray-700">{t('todayButton')}</button> {/* Add key */}
            <button onClick={handleNext} className="p-1 rounded hover:bg-gray-200 text-gray-600">&gt;</button>
            <span className="text-lg font-semibold ml-4">
                {/* Display current date/week range */} 
                {viewType === 'day' && formatDateForDisplay(currentDate, i18n.language)}
                {viewType === 'week' && `${formatDateForDisplay(getStartOfWeek(currentDate), i18n.language)} - ${formatDateForDisplay(new Date(getStartOfWeek(currentDate).setDate(getStartOfWeek(currentDate).getDate() + 6)), i18n.language)}`}
            </span>
          </div>
        )}
        {/* Empty div for spacing if semester view */}
         {viewType === 'semester' && <div></div>}

        {/* View Type Switcher */}
        <div className="flex space-x-1 border p-1 rounded-md">
          <button 
            onClick={() => handleViewChange('day')} 
            className={`px-3 py-1 text-sm rounded ${viewType === 'day' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          >
            {t('viewDay')} {/* Add key */}
          </button>
          <button 
            onClick={() => handleViewChange('week')} 
            className={`px-3 py-1 text-sm rounded ${viewType === 'week' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
           >
             {t('viewWeek')} {/* Add key */}
          </button>
          <button 
            onClick={() => handleViewChange('semester')} 
            className={`px-3 py-1 text-sm rounded ${viewType === 'semester' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
           >
             {t('viewSemester')} {/* Add key */}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-auto">
        {renderViewContent()}
      </div>
    </div>
  );
}

export default MainViewPanel;
