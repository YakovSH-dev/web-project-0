import React from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
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

// Helper to format week number (e.g., "W1", "W2")
const formatWeekNumber = (weekIndex) => `W${weekIndex + 1}`;

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

  // Function to handle checkbox change
  const handleCheckboxChange = (instanceId, currentCompletedState) => {
    if (onToggleComplete) {
      onToggleComplete(instanceId, currentCompletedState);
    }
  };

  return (
    <div className="space-y-8 p-1"> 
      {semesterData.map(courseGroup => (
        <div key={courseGroup.courseId} className="bg-theme-bg p-4 rounded-lg shadow">
          {/* Course Header */}
          <div className="flex items-center mb-4 pb-2 border-b border-theme-secondary">
            <div 
              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: courseGroup.courseColor || '#808080' }} 
            ></div>
            <h3 className="text-lg font-semibold text-theme-text-primary truncate">
              {courseGroup.courseName || t('noCourse', 'Uncategorized')}
            </h3>
          </div>

          {/* Semester Grid Container (Rows = Definitions, Cols = Weeks) */}
          {!courseGroup.definitions || courseGroup.definitions.length === 0 ? (
             <p className="text-sm text-theme-text-secondary px-2">{t('noDefinitionsCourse', 'No task definitions found for this course.')}</p>
          ) : (
            <div 
              className="grid gap-px overflow-x-auto border border-theme-secondary/30" // Add border around grid
              // Define columns: 1 for Definition Info, N for Weeks
              style={{ gridTemplateColumns: `minmax(150px, 1.5fr) repeat(${courseGroup.numberOfWeeks}, minmax(60px, 1fr))` }} 
            >
              {/* --- Header Row (Definition Col + Week Numbers) --- */}
              <div className="sticky top-0 left-0 bg-theme-bg-secondary/50 p-2 text-xs font-medium text-theme-text-secondary uppercase tracking-wider z-20 border-b border-r border-theme-secondary/30">
                {t('semesterView.grid.taskDefinition', 'Task Definition')}
              </div>
              {Array.from({ length: courseGroup.numberOfWeeks }).map((_, weekIndex) => (
                <div 
                  key={`week-header-${weekIndex}`}
                  className={`sticky top-0 p-2 text-center text-xs font-medium text-theme-text-secondary uppercase tracking-wider z-10 border-b border-r border-theme-secondary/30 ${weekIndex === courseGroup.currentWeekIndex ? 'bg-theme-primary/20' : 'bg-theme-bg-secondary/50'}`}
                >
                  {formatWeekNumber(weekIndex)}
                </div>
              ))}

              {/* --- Grid Rows (One per Task Definition) --- */}
              {courseGroup.definitions.map((definition) => (
                <React.Fragment key={definition.definitionId}>
                  {/* Definition Info Cell (Row Header) */}
                  <div className="sticky left-0 bg-theme-bg p-2 border-b border-r border-theme-secondary/30 z-10">
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
                      className={`p-1 flex flex-wrap items-center justify-center gap-px border-b border-r border-theme-secondary/30 min-h-[48px] ${weekData.weekIndex === courseGroup.currentWeekIndex ? 'bg-theme-primary/10' : ''}`}
                    >
                      {/* Render Checkboxes for tasks in this cell */}
                      {weekData.tasks.map(task => (
                        <Tooltip 
                          key={task.instanceId} 
                          title={task.isCompleted ? t('common.completed', 'Completed') : task.isMissed ? t('common.missed', 'Missed') : t('common.pending', 'Pending')}
                          placement="top"
                          arrow
                        > 
                          <Checkbox 
                            checked={task.isCompleted}
                            onChange={() => handleCheckboxChange(task.instanceId, task.isCompleted)}
                            size="small"
                            disabled={!onToggleComplete}
                            sx={{
                              padding: '1px',
                              color: task.isMissed ? '#ef4444' : 'var(--color-theme-secondary, #8892b0)', // Red if missed
                              '&.Mui-checked': {
                                color: task.isMissed ? '#f87171' : 'var(--color-theme-primary, #64ffda)', // Lighter red or primary
                              },
                              '&.Mui-disabled': { opacity: 0.5 }
                            }}
                          />
                        </Tooltip>
                      ))}
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