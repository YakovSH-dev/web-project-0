import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { createTaskDefinition } from '../../services/taskDefinition'; // Adjust path as needed

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500, // Wider to accommodate schedule rows
  maxHeight: '90vh', // Prevent modal becoming too tall
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: 24,
  display: 'flex',     // Flex layout
  flexDirection: 'column' // Column direction
};

const modalHeaderStyle = {
  p: 2,
  borderBottom: '1px solid #eee'
};

const modalContentStyle = {
  p: 3,
  overflowY: 'auto', // Make content scrollable
  flexGrow: 1
};

const daysMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
const dayOptions = Object.entries(daysMap).map(([name, value]) => ({ name, value }));

const taskTypes = ['Lecture', 'Lab', 'Tutorial', 'Seminar', 'Workshop', 'Reading', 'Exam', 'Other'];

const initialScheduleEntry = { dayOfWeek: '', startTime: '' };

function AddTaskDefinitionModal({ course, open, onClose, onTaskDefinitionAdded }) {
  const { t } = useTranslation();

  const [taskType, setTaskType] = useState('');
  const [description, setDescription] = useState('');
  const [length, setLength] = useState(60);
  // State for the dynamic schedule entries
  const [scheduleEntries, setScheduleEntries] = useState([initialScheduleEntry]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTaskType('');
      setDescription('');
      setLength(60);
      setScheduleEntries([{ ...initialScheduleEntry }]); // Reset schedule
      setError('');
      setSuccess('');
    }
  }, [open]);

  // --- Schedule Handlers ---
  const handleScheduleChange = (index, field, value) => {
    const updatedEntries = [...scheduleEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setScheduleEntries(updatedEntries);
  };

  const addScheduleEntry = () => {
    setScheduleEntries([...scheduleEntries, { ...initialScheduleEntry }]);
  };

  const removeScheduleEntry = (index) => {
    if (scheduleEntries.length <= 1) return; // Keep at least one entry
    const updatedEntries = scheduleEntries.filter((_, i) => i !== index);
    setScheduleEntries(updatedEntries);
  };
  // --- End Schedule Handlers ---

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!course || !course._id) {
      setError(t('addTaskForm.errors.missingCourse'));
      return;
    }

    // Validate schedule entries
    const validSchedule = scheduleEntries.every(
      entry => entry.dayOfWeek !== '' && entry.startTime !== '' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(entry.startTime)
    );

    if (!taskType || !validSchedule || scheduleEntries.length === 0) {
      setError(t('addTaskForm.errors.invalidForm'));
      return;
    }

    const taskDefinitionData = {
      type: taskType,
      description,
      length: parseInt(length, 10) || null, // Send null if length is empty/invalid
      schedule: scheduleEntries.map(entry => ({ // Ensure dayOfWeek is a number
        dayOfWeek: Number(entry.dayOfWeek),
        startTime: entry.startTime,
      })),
      courseId: course._id,
    };

    try {
      const newTask = await createTaskDefinition(taskDefinitionData);
      setSuccess(t('addTaskForm.successMessage', { 
        taskName: newTask.description || newTask.type 
      }));
      if (onTaskDefinitionAdded) {
        onTaskDefinitionAdded(newTask);
      }
      setTimeout(() => {
        // Reset form completely after success
        setTaskType('');
        setDescription('');
        setLength(60);
        setScheduleEntries([{ ...initialScheduleEntry }]);
        setSuccess('');
        // Maybe close modal after success?
        // onClose();
      }, 1500);
    } catch (err) {
      console.error('Detailed error creating task definition:', err.response?.data || err);
      // Try to use backend error message first, fallback to generic key
      const backendErrorMessage = err.response?.data?.message;
      setError(backendErrorMessage || t('addTaskForm.errors.submitFailed'));
    }
  };

  // Helper to translate day names for the dropdown
  const translatedDayOptions = dayOptions.map(opt => ({
    ...opt,
    name: t(`days.${opt.name.toLowerCase()}`, opt.name) // e.g., t('days.monday', 'Monday')
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-task-definition-title"
      aria-describedby="add-task-definition-description"
    >
      <Box sx={style}>
        {/* Modal Header */}
        <Box sx={modalHeaderStyle}>
          <Typography id="add-task-definition-title" variant="h6" component="h2">
            {course 
              ? t('addTaskForm.modalTitle.edit', { courseName: course.name })
              : t('addTaskForm.modalTitle.create')
            }
          </Typography>
        </Box>

        {/* Modal Content (Scrollable) */}
        <Box sx={modalContentStyle}>
          {course ? (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                {/* Task Type and Description */}
                <FormControl fullWidth required>
                  <InputLabel id="task-type-label">{t('addTaskForm.typeLabel')}</InputLabel>
                  <Select
                    labelId="task-type-label"
                    id="task-type"
                    value={taskType}
                    label={t('addTaskForm.typeLabel')}
                    onChange={(e) => setTaskType(e.target.value)}
                  >
                    {taskTypes.map((type) => (
                      <MenuItem key={type} value={type}>{t(`taskTypes.${type}`, type)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  id="description"
                  label={t('addTaskForm.descriptionLabel')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                />
                 <TextField
                  fullWidth
                  id="length"
                  label={t('addTaskForm.lengthLabel')}
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: "1" }}
                />

                <Divider sx={{ my: 1 }}><Typography variant="overline">{t('addTaskForm.scheduleTitle')}</Typography></Divider>

                {/* Dynamic Schedule Entries */}
                <Stack spacing={2} sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}> {/* Scrollable schedule */} 
                  {scheduleEntries.map((entry, index) => (
                    <Stack direction="row" spacing={1} key={index} alignItems="baseline">
                      <FormControl sx={{ minWidth: 150 }} required variant="outlined">
                        <InputLabel id={`day-label-${index}`}>{t('addTaskForm.dayLabel')}</InputLabel>
                        <Select
                          labelId={`day-label-${index}`}
                          value={entry.dayOfWeek}
                          label={t('addTaskForm.dayLabel')}
                          onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)}
                          sx={{ '.MuiSelect-select': { paddingY: '9px', lineHeight: 'normal' } }}
                        >
                          <MenuItem value=""><em>{t('addTaskForm.selectDayPlaceholder')}</em></MenuItem>
                          {translatedDayOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        required
                        label={t('addTaskForm.startTimeLabel')}
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        size="small"
                        sx={{ flexGrow: 1, '& .MuiInputBase-input': { paddingY: '9px', lineHeight: 'normal' } }}
                      />
                      <IconButton
                        aria-label={t('addTaskForm.removeTimeSlotAria')}
                        onClick={() => removeScheduleEntry(index)}
                        disabled={scheduleEntries.length <= 1}
                        color="error"
                        sx={{ mb: -0.5 }}
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>

                {/* Add Schedule Button */}
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addScheduleEntry}
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {t('addTaskForm.addTimeSlotButton')}
                </Button>

                 <Divider sx={{ pt: 1 }} />

                {/* Submit / Close Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button onClick={onClose} variant="outlined">
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" variant="contained">
                    {t('addTaskForm.createButton')}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Typography>{t('common.loadingCourseData')}</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default AddTaskDefinitionModal; 