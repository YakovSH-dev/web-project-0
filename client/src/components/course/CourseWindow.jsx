import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddTaskDefinitionModal from './AddTaskDefinitionModal'; // Import the form modal
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventRepeatIcon from '@mui/icons-material/EventRepeat'; // Icon for definitions
import TaskAltIcon from '@mui/icons-material/TaskAlt'; // Icon for instances
import ScheduleIcon from '@mui/icons-material/Schedule'; // Icon for schedule summary
// We will likely need course service functions here later
// import { getCourseDetails, deleteTaskDefinition, /* etc */ } from '../../services/course';

// Import the service function
import { getTaskDefinitionsByCourse, deleteTaskDefinition } from '../../services/taskDefinition';
import { deleteCourse } from '../../services/course'; 
// Style for the main course window modal (can be larger than the form)
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%', // Make it wider
  maxWidth: '800px', // Max width
  maxHeight: '90vh', // Max height
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: 24,
  p: 0, // Remove padding here, apply to inner Box
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle = {
  p: 2,
  borderBottom: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const contentStyle = {
  p: 3,
  overflowY: 'auto', // Make content scrollable if needed
  flexGrow: 1
};

const buttonGroupStyle = {
  display: 'flex',
  gap: 1
};

// Refactored helper to use locale for day names
const formatSchedule = (schedule, locale = 'en') => {
  if (!schedule || schedule.length === 0) return 'No schedule defined'; 
  // Use a base date (like a known Sunday) to get the correct weekday name
  const baseSunday = new Date('2024-07-21T00:00:00Z'); // A known Sunday in UTC
  return schedule.map(entry => {
    const dateForDay = new Date(baseSunday);
    dateForDay.setUTCDate(baseSunday.getUTCDate() + entry.dayOfWeek);
    const dayName = dateForDay.toLocaleDateString(locale, { weekday: 'short' });
    return `${dayName} ${entry.startTime}`;
  }).join(', ');
};

function CourseWindow({ course, open, onClose }) {
  const { t, i18n } = useTranslation();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  // Add state for Edit modal later
  // const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);

  // State for fetched details (task instances, etc.) - Placeholder
  const [taskInstances, setTaskInstances] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  // State for task definitions
  const [taskDefinitions, setTaskDefinitions] = useState([]);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false);
  const [definitionError, setDefinitionError] = useState('');
  const [courseError, setCourseError] = useState(''); // Add state for course-level errors

  // --- Fetch Definitions --- (Refactored Effect)
  useEffect(() => {
    const fetchDefinitions = async () => {
      if (open && course?._id) {
        setIsLoadingDefinitions(true);
        setDefinitionError('');
        setCourseError(''); // Clear course error on open/refresh
        setTaskDefinitions([]); // Clear previous definitions
        // TODO: Also fetch task instances here or in separate effect
        setTaskInstances([]); // Clear placeholder instances
        console.log('Fetching task definitions for course:', course._id);
        try {
          const definitions = await getTaskDefinitionsByCourse(course._id);
          setTaskDefinitions(definitions);
        } catch (err) {
          console.error('Failed to fetch task definitions:', err);
          // Use translation key for error
          setDefinitionError(t('courseWindow.errors.loadDefinitionsFailed')); 
        } finally {
          setIsLoadingDefinitions(false);
        }
      } else {
        // Clear data when modal closes or no course
        setTaskDefinitions([]);
        setTaskInstances([]);
        setDefinitionError('');
        setCourseError('');
        setIsLoadingDefinitions(false);
      }
    };

    fetchDefinitions();

  }, [open, course, t]); // Added t to dependency array

  // --- Handlers for Top Buttons ---
  const handleOpenAddTaskModal = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
  };

  const handleTaskDefinitionAdded = (newTaskDef) => {
    console.log('New Task Definition Added:', newTaskDef);
    // Add the new definition to the list optimistically or refetch
    setTaskDefinitions(prev => [...prev, newTaskDef]);
    // Refresh instances maybe?
    handleCloseAddTaskModal();
  };

  const handleEditCourse = () => {
    console.log('Edit Course clicked for:', course.name);
    // TODO: Implement Edit Course functionality (likely open another modal)
    // setIsEditCourseModalOpen(true);
  };

  // Updated handleDeleteCourse
  const handleDeleteCourse = async () => {
    setCourseError(''); // Clear previous errors
    if (!course || !course._id) return; // Should not happen if button is enabled

    const confirmDelete = window.confirm(
      // Use the newly added translation key
      t('courseWindow.deleteConfirm', { courseName: course.name })
    );

    if (confirmDelete) {
      console.log('Attempting to delete course:', course.name, course._id);
      try {
        await deleteCourse(course._id);
        console.log('Course deleted successfully:', course.name);
        // Close the modal (parent component should handle refresh)
        onClose(); 
      } catch (err) {
        console.error('Failed to delete course:', err);
        // Use the message from the error thrown by the service
        const errorMessage = err.message || t('courseWindow.errors.deleteCourseFailed');
        setCourseError(errorMessage);
        // Show a more informative alert
        alert(t('courseWindow.errors.deleteCourseFailed') + `\n\n${errorMessage}`);
      }
    }
  };

  const handleEditDefinition = (definitionId) => {
    console.log('TODO: Edit definition', definitionId);
    // Open edit modal
  };

  // Updated handleDeleteDefinition
  const handleDeleteDefinition = async (definitionId, definitionType) => {
    // Use a simple browser confirm for now
    const confirmDelete = window.confirm(
      t('courseWindow.taskDefinitions.deleteConfirm', { taskType: definitionType || 'this definition' })
    );

    if (confirmDelete) {
      setDefinitionError(''); // Clear previous errors
      // Consider adding a loading state specific to this definition row?
      try {
        await deleteTaskDefinition(definitionId);
        // Update state by removing the deleted definition
        setTaskDefinitions(prev => prev.filter(def => def._id !== definitionId));
        // Optionally show a success message (e.g., using a Snackbar)
        console.log('Definition deleted successfully');
      } catch (err) {
        console.error('Failed to delete task definition:', err);
        setDefinitionError(err.message || t('courseWindow.errors.deleteDefinitionFailed'));
      }
    }
  };

  // --- Group Task Instances by Week --- (Placeholder Logic)
  const groupTasksByWeek = (tasks) => {
    const weeks = {};
    tasks.forEach(task => {
      const date = new Date(task.date);
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay())); // Sunday
      const weekKey = startOfWeek.toLocaleDateString(); // Simple key for example
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(task);
    });
    // Sort weeks chronologically - keys are strings, need date conversion
    return Object.entries(weeks).sort(([keyA], [keyB]) => new Date(keyA) - new Date(keyB));
  };

  const weeklyTasks = groupTasksByWeek(taskInstances);

  if (!open || !course) return null; // Don't render if not open or no course

  // Get current locale for date formatting
  const currentLocale = i18n.language;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="course-window-title"
      aria-describedby="course-window-description"
    >
      <Box sx={style}>
        {/* Header Section */}
        <Box sx={headerStyle}>
          <Typography id="course-window-title" variant="h5" component="h2" sx={{ color: course.color || 'inherit' }}>
            {course.name}
          </Typography>
          <Box sx={buttonGroupStyle}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddTaskModal} size="small" title={t('courseWindow.buttons.addTaskDefTooltip')}>
              {t('courseWindow.buttons.addTaskDef')}
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditCourse} size="small" color="info" title={t('courseWindow.buttons.editCourseTooltip')}>
              {t('courseWindow.buttons.editCourse')}
            </Button>
            <Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleDeleteCourse} size="small" color="error" title={t('courseWindow.buttons.deleteCourseTooltip')}>
              {t('courseWindow.buttons.deleteCourse')}
            </Button>
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={contentStyle}>
          {/* Display course error if any */}
          {courseError && <Alert severity="error" sx={{ mb: 2 }}>{courseError}</Alert>}
          <Stack spacing={3}>
            {/* Basic Info Section - Placeholder */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>{t('courseWindow.basicInfo.title')}</Typography>
              <Stack direction="row" spacing={4} divider={<Divider orientation="vertical" flexItem />}>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">{t('courseWindow.basicInfo.taskInstancesLabel')}</Typography>
                  <Typography variant="body1">{taskInstances.length} ({t('common.placeholder')})</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">{t('courseWindow.basicInfo.progressLabel')}</Typography>
                  <Typography variant="body1">{t('common.notAvailable')} ({t('common.placeholder')})</Typography>
                  {/* TODO: Add Progress Indicator component */}
                </Box>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">{t('courseWindow.basicInfo.understandingLabel')}</Typography>
                  <Typography variant="body1">{t('common.notAvailable')} ({t('common.placeholder')})</Typography>
                  {/* TODO: Add Understanding Level component */}
                </Box>
              </Stack>
            </Paper>

            {/* Changed Header: Task Definitions Section */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EventRepeatIcon sx={{ mr: 1 }} /> {t('courseWindow.taskDefinitions.title')}
              </Typography>
              {isLoadingDefinitions && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>}
              {definitionError && <Alert severity="error" sx={{ mb: 1 }}>{definitionError}</Alert>}
              {!isLoadingDefinitions && (
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {taskDefinitions.length === 0 && !definitionError ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                      {t('courseWindow.taskDefinitions.noneFound')}
                    </Typography>
                  ) : (
                    taskDefinitions.map(def => (
                      <Box key={def._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <Typography variant="body1" fontWeight="medium">{t(`taskTypes.${def.type}`, def.type)}</Typography>
                          {def.description && <Typography variant="body2" color="text.secondary">{def.description}</Typography>}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                             <ScheduleIcon fontSize="inherit" sx={{ mr: 0.5 }}/> 
                             {formatSchedule(def.schedule, currentLocale) || t('courseWindow.taskDefinitions.noSchedule')}
                           </Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => handleEditDefinition(def._id)} title={t('courseWindow.taskDefinitions.editTooltip')}>
                              <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteDefinition(def._id, t(`taskTypes.${def.type}`, def.type))} title={t('courseWindow.taskDefinitions.deleteTooltip')} color="error">
                              <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Paper>

            {/* Weekly Task Instances Section - Placeholder */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TaskAltIcon sx={{ mr: 1 }}/> {t('courseWindow.weeklyInstances.title')}
              </Typography>
              {/* TODO: Fetch and display actual instances */} 
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                 {t('courseWindow.weeklyInstances.placeholderText')}
              </Typography>
              {/* {isLoadingDetails && <Typography>Loading tasks...</Typography>} ... existing accordion structure ... */}
            </Paper>
          </Stack>
        </Box>

        {/* Render the AddTaskDefinitionModal when needed */}
        {/* It is rendered here inside the main modal structure but positioned via its own style */}
        <AddTaskDefinitionModal
          course={course} // Pass the same course
          open={isAddTaskModalOpen}
          onClose={handleCloseAddTaskModal}
          onTaskDefinitionAdded={handleTaskDefinitionAdded}
        />

        {/* TODO: Add Edit Course Modal here later */}
        {/* <EditCourseModal course={course} open={isEditCourseModalOpen} onClose={() => setIsEditCourseModalOpen(false)} /> */}

      </Box>
    </Modal>
  );
}

export default CourseWindow; 