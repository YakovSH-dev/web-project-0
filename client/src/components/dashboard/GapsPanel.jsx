import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient.js';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
// Potentially import TaskCard if we reuse it
// import TaskCard from '../tasks/TaskCard';

// Import TaskWindow placeholder (assuming it will exist later)
// import TaskWindow from '../tasks/TaskWindow'; // Placeholder

const GapsPanel = () => {
  const { t } = useTranslation();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookbackWeeks, setLookbackWeeks] = useState(4); // Default lookback
  const [selectedGapId, setSelectedGapId] = useState(null); // State for clicked gap

  const today = startOfDay(new Date()); // Get start of today for consistent comparison

  useEffect(() => {
    const fetchGaps = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get(`/views/gaps?lookbackWeeks=${lookbackWeeks}`);
        setGaps(response.data);
      } catch (err) {
        console.error("Error fetching gaps data:", err);
        setError(err.response?.data?.message || t('gapsPanel.errorLoading'));
      }
      setLoading(false);
    };

    fetchGaps();
  }, [lookbackWeeks, t]);

  // Helper function to format relative time
  const formatRelativeTime = (date) => {
    const gapDate = parseISO(date);
    const daysAgo = differenceInDays(today, gapDate);

    if (daysAgo <= 0) { 
      // Should not happen for gaps, but handle defensively
      return ""; // Or perhaps t('gapsPanel.dueToday') if we add it
    }

    if (daysAgo <= 7) {
      return t('gapsPanel.daysAgo', { count: daysAgo });
    } else {
      const weeksAgo = Math.floor(daysAgo / 7);
      return t('gapsPanel.weeksAgo', { count: weeksAgo });
    }
  };

  // Click handler for gap items
  const handleGapClick = (gapId) => {
    console.log("Clicked gap item with ID:", gapId); // Placeholder action
    setSelectedGapId(gapId);
    // Later: Logic to open TaskWindow for this gapId
  };

  // Handler to close the (future) TaskWindow
  const handleCloseTaskWindow = () => {
    setSelectedGapId(null);
  };

  // TODO: Add controls to change lookbackWeeks?

  return (
    // Apply theme background, text colors, and consistent padding/shadow/rounding
    <div className="bg-theme-bg-secondary text-theme-text-primary shadow rounded p-4 h-full flex flex-col">
      {/* Title using theme text color */}
      <h3 className="text-lg font-semibold mb-3 text-theme-text-primary">{t('gapsPanel.title')} ({gaps.length})</h3>
      
      {/* Optional: Controls for lookback period */} 
      {/* <div className="mb-4">
          <label htmlFor="lookback" className="text-sm text-gray-600 mr-2">Show past:</label>
          <select 
            id="lookback"
            value={lookbackWeeks}
            onChange={(e) => setLookbackWeeks(Number(e.target.value))}
            className="border rounded p-1 text-sm"
          >
            <option value="1">1 Week</option>
            <option value="2">2 Weeks</option>
            <option value="4">4 Weeks</option>
            <option value="8">8 Weeks</option>
          </select>
      </div> */} 

      {/* Use theme secondary text color for loading */}
      {loading && <p className="text-theme-text-secondary text-sm">{t('common.loading')}</p>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        // Make the list area scrollable and take remaining space
        <div className="space-y-0 overflow-y-auto flex-grow pr-1"> {/* Reduced space-y to 0, margin added below */}
          {gaps.length === 0 ? (
            // Use theme secondary text color for empty message
            <p className="text-theme-text-secondary italic text-sm">{t('gapsPanel.noGapsFound')}</p>
          ) : (
            gaps.map((gap) => (
              // Added red border, margin-bottom, click handler, cursor, and hover effect
              <div 
                key={gap._id} 
                className="p-2 rounded border border-red-400 mb-2 cursor-pointer hover:bg-red-900 hover:bg-opacity-20 transition-colors duration-150"
                onClick={() => handleGapClick(gap._id)}
                role="button" // Accessibility: Indicate it's clickable
                tabIndex={0} // Accessibility: Make it focusable
                onKeyPress={(e) => e.key === 'Enter' && handleGapClick(gap._id)} // Accessibility: Click on Enter
              >
                <div>
                  {/* Primary text (Course Name) using theme primary color */}
                  <p className="text-sm font-medium text-theme-text-primary">
                    {gap.taskDefinitionId?.courseId?.name || t('gapsPanel.courseMissing')}
                  </p>
                  {/* Secondary text (Relative Time) using theme secondary color */}
                  <p className="text-xs text-theme-text-secondary"> 
                    {formatRelativeTime(gap.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Placeholder for TaskWindow Modal/Component */}
      {/* {selectedGapId && ( 
        <TaskWindow 
          taskId={selectedGapId} 
          onClose={handleCloseTaskWindow} 
        /> 
      )} */} 
    </div>
  );
};

export default GapsPanel; 