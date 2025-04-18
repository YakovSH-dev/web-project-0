import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box'; // For styling the grid cells
import Tooltip from '@mui/material/Tooltip'; // For showing task details on hover
import Typography from '@mui/material/Typography'; // For definition text

// Helper to format date for week header (e.g., "Jul 14 - Jul 20")
const formatWeekHeader = (weekStartDate, locale = 'en-US') => {
  if (!weekStartDate) return '';
  const start = new Date(weekStartDate + 'T00:00:00'); // Ensure local time
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  
  const startStr = start.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  return `${startStr} - ${endStr}`;
};

// Helper to get short day name (e.g., "Sun", "Mon")
const getShortDayName = (dayIndex, locale = 'en-US') => {
    const baseSunday = new Date('2024-07-21T00:00:00'); // A known Sunday
    baseSunday.setDate(baseSunday.getDate() + dayIndex);
    return baseSunday.toLocaleDateString(locale, { weekday: 'short' });
}

// Helper to format week number (e.g., "1", "2")
const formatWeekNumber = (weekIndex) => `${weekIndex + 1}`;

// Displays task instances for the semester in a grid (Rows=Defs, Cols=Weeks)
function SemesterViewContent({ semesterData, onToggleComplete }) {
  const { t, i18n } = useTranslation();

  // Basic validation and loading/empty state handling
  if (!semesterData || !Array.isArray(semesterData)) {
    console.warn('SemesterViewContent received invalid semesterData prop:', semesterData);
    return <div className="text-center p-4 text-theme-text-secondary">{t('common.noDataAvailable', 'No data available')}</div>;
  }

  if (semesterData.length === 0) {
    return <div className="text-center p-4 text-theme-text-secondary">{t('noCoursesSemester', 'No courses found for this semester.')}</div>;
  }

  // Click Handler for Task Indicator
  const handleTaskToggle = (instanceId, currentCompletedState) => {
    if (onToggleComplete) {
      onToggleComplete(instanceId, currentCompletedState);
    }
  };

  // Determine Task Indicator Style
  const getTaskIndicatorStyle = (task) => {
    if (task.isMissed) return 'bg-red-500 hover:bg-red-400'; // Red if missed
    if (task.isCompleted) return 'bg-green-500 hover:bg-green-400'; // Green if completed
    return 'bg-theme-secondary/50 hover:bg-theme-secondary/80'; // Default (e.g., gray) if pending
  };

  return (
    <div className="space-y-8 p-1"> 
      {semesterData.map(courseGroup => (
        <div key={courseGroup.courseId} className="bg-theme-bg p-2 rounded-lg shadow">
          {/* Course Header */}
          <div className="flex items-center mb-4 pb-2 border-b border-theme-secondary">
            <div 
              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: courseGroup.courseColor || '#808080' }} 
            ></div>
            <h3 className="p-3 Stext-lg font-semibold text-theme-text-primary truncate">
              {courseGroup.courseName || t('noCourse', 'Uncategorized')}
            </h3>
          </div>

          {/* Semester Grid Container (Rows = Definitions, Cols = Weeks) */}
          {!courseGroup.definitions || courseGroup.definitions.length === 0 ? (
             <p className="text-sm text-theme-text-secondary px-2">{t('noDefinitionsCourse', 'No task definitions found for this course.')}</p>
          ) : (
            <div 
              className="grid overflow-x-auto" // Removed gap-px
              // Define columns: Widen week columns
              style={{ 
                gridTemplateColumns: `minmax(150px, 1.5fr) repeat(${courseGroup.numberOfWeeks}, minmax(80px, 1fr))`, 
              }} 
            >
              {/* --- Header Row (Definition Col + Week Numbers) --- */}
              {/* Reduce padding */}
              <div className="sticky top-0 left-0 bg-theme-bg-secondary/50 p-1 text-xs font-medium text-theme-text-secondary uppercase tracking-wider z-20">
                {t('semesterView.grid.taskDefinition', 'Task Definition')}
              </div>
              {Array.from({ length: courseGroup.numberOfWeeks }).map((_, weekIndex) => (
                <div 
                  key={`week-header-${weekIndex}`}
                  // Reduce padding
                  className={`sticky top-0 p-1 text-center text-xs font-medium z-10 ${weekIndex === courseGroup.currentWeekIndex ? 'text-theme-primary font-semibold bg-theme-bg-secondary/50' : 'text-theme-text-secondary bg-theme-bg-secondary/30'}`}
                >
                  {formatWeekNumber(weekIndex)} 
                </div>
              ))}

              {/* --- Grid Rows (One per Task Definition) --- */}
              {courseGroup.definitions.map((definition) => (
                <React.Fragment key={definition.definitionId}>
                  {/* Definition Info Cell (Row Header) - Reduce padding & min-height */}
                  <div className="sticky left-0 bg-theme-bg-secondary/10 p-1 z-10 min-h-[40px]"> 
                     <Typography variant="body2" className="text-theme-text-primary font-medium">
                       {t(`taskTypes.${definition.type}`, definition.type)}
                     </Typography>
                     {definition.description && (
                        <Typography variant="caption" className="text-theme-text-secondary block truncate">
                          {definition.description}
                        </Typography>
                     )}
                  </div>
                  
                  {/* Week Cells for this Definition */}
                  {definition.weeks.map((weekData) => (
                    <div 
                      key={`week-${weekData.weekIndex}-def-${definition.definitionId}`}
                      // Cell styling: Reduce padding & min-height
                      className={`p-0.5 flex flex-wrap items-center justify-center gap-0.5 min-h-[48px] ${weekData.weekIndex === courseGroup.currentWeekIndex ? 'bg-theme-primary/5' : ''}`}
                    >
                      {/* Render small indicator blocks for tasks */}
                      {weekData.tasks.map(task => {
                        const indicatorStyle = getTaskIndicatorStyle(task);
                        const tooltipTitle = task.isCompleted ? t('common.completed', 'Completed') : task.isMissed ? t('common.missed', 'Missed') : t('common.pending', 'Pending');
                        return (
                            <Tooltip 
                              key={task.instanceId} 
                              title={tooltipTitle}
                              placement="top"
                              arrow
                              disableInteractive // Prevent tooltip from interfering with click
                            > 
                              {/* Larger rectangular clickable block */}
                              <Box 
                                component="button" // Make it a button for accessibility
                                onClick={() => handleTaskToggle(task.instanceId, task.isCompleted)}
                                disabled={!onToggleComplete}
                                sx={{ 
                                    width: '24px',  // Wider block
                                    height: '16px', // Taller block
                                    borderRadius: '3px', // Slightly more rounded corners 
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    border: 'none',
                                    padding: 0, 
                                    outline: 'none',
                                    '&:disabled': { cursor: 'not-allowed', opacity: 0.5 }
                                }}
                                // Apply dynamic background based on status
                                className={indicatorStyle} 
                              />
                            </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
           )}
        </div>
      ))}
    </div>
  );
}

export default SemesterViewContent; 