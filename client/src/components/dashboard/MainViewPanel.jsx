// src/components/dashboard/MainViewPanel.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSemester } from '../../context/SemesterContext';
import { getDailyView, getWeeklyView, getSemesterView } from '../../services/views';

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

  // --- Render Logic ---
  const renderViewContent = () => {
      if (isLoadingView || isLoadingSemesters) {
          return <div className="text-center p-4">{t('loading')}</div>;
      }
      if (errorView) {
          return <div className="text-center p-4 text-red-600">{t('errorLoadingView')}</div>; // Add key
      }
      if (!activeSemesterId) {
          return <div className="text-center p-4 text-gray-500">{t('noActiveSemester')}</div>;
      }
      if (!viewData) {
         // This might happen briefly or if fetch returns null/undefined
         return <div className="text-center p-4 text-gray-500">{t('noDataAvailable')}</div>; // Add key
      }

      // TODO: Implement actual rendering based on viewType and viewData structure
      if (viewType === 'day') {
          return <pre>Day View Data:
{JSON.stringify(viewData, null, 2)}</pre>;
      } else if (viewType === 'week') {
          return <pre>Week View Data:
{JSON.stringify(viewData, null, 2)}</pre>;
      } else { // semester
          return <pre>Semester View Data:
{JSON.stringify(viewData, null, 2)}</pre>;
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
