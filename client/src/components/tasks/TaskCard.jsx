import React from 'react';
import { useTranslation } from 'react-i18next';

// TODO: Define or import task completion handler type later
// type TaskToggleHandler = (taskId: string, currentState: boolean) => void;

function TaskCard({ task, onCardClick, onToggleComplete }) {
  const { t, i18n } = useTranslation();

  // Extract necessary data from the task object
  const taskDef = task?.taskDefinitionId; 
  const course = taskDef?.courseId;
  
  const taskName = taskDef?.description || taskDef?.type || t('untitledTask');
  const courseName = course?.name || t('noCourse');
  const courseColor = course?.color || '#A0A0A0';
  
  const taskTime = task?.date 
    ? new Date(task.date).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '--:--';
    
  const isCompleted = task?.isCompleted || false;
  const taskId = task?._id;

  const handleCheckboxChange = (event) => {
    event.stopPropagation(); 
    if (!taskId || !onToggleComplete) return; // Check if handler exists
    const newCompletedState = event.target.checked;
    console.log(`TaskCard: Checkbox changed for ${taskId} to ${newCompletedState}. Calling handler.`);
    onToggleComplete(taskId, isCompleted); // Pass ID and *current* state to handler
  };

  const handleCardClick = () => {
    if (onCardClick && taskId) {
      console.log(`TaskCard: Card clicked for task ${taskId}`);
      onCardClick(taskId); // Call the handler passed from parent
    } else {
        console.log(`TaskCard: Card clicked for task ${taskId}, but no handler provided.`);
    }
  };

  // --- Card Styling ---
  const cardSizeClasses = "w-48 h-48"; // Example size

  return (
    // Use a button element for the main container for better semantics/accessibility
    <button
      type="button"
      onClick={handleCardClick}
      disabled={!onCardClick} // Disable button if no handler is passed
      className={`flex flex-col justify-between ${cardSizeClasses} p-3 border rounded-lg shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow bg-white relative overflow-hidden text-left rtl:text-right disabled:opacity-75 disabled:shadow-sm disabled:cursor-not-allowed`} // Added focus styles, disabled styles, text-align
    >
      {/* Header Section: Course Name & Color Dot */}
      <div className="flex items-center mb-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <div
          className="w-3 h-3 rounded-full mr-2 rtl:ml-2 flex-shrink-0"
          style={{ backgroundColor: courseColor }}
          title={courseName}
        ></div>
        <span className="text-xs font-medium text-gray-600 truncate flex-grow" title={courseName}>
          {courseName}
        </span>
      </div>

      {/* Task Name/Description (Main Content) */}
      <div className="flex-grow mb-2 overflow-y-auto break-words"> {/* Added break-words */}
        <p className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {taskDef?.description ? taskName : t(`taskTypes.${taskName}`, taskName)}
        </p>
      </div>

      {/* Footer Section: Time & Checkbox */}
      <div className="flex justify-between items-center mt-auto border-t pt-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <span className="text-xs text-gray-500">{taskTime}</span>
        {/* Make checkbox container clickable separately and stop propagation */}
        <div onClick={(e) => e.stopPropagation()} className="relative z-10"> {/* Stop propagation */}
            <input
                type="checkbox"
                checked={isCompleted}
                onChange={handleCheckboxChange}
                disabled={!onToggleComplete} // Disable checkbox if no handler provided
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" // Added disabled styles
                aria-label={t('taskCard.toggleCompleteAria', { taskName: taskName })}
            />
        </div>
      </div>

    </button> // End button element
  );
}

export default TaskCard; 