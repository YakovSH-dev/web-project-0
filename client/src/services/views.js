import apiClient from './apiClient';

/**
 * Formats a Date object into YYYY-MM-DD string.
 * @param {Date} date - The date object.
 * @returns {string} Formatted date string.
 */
const formatDate = (date) => {
    if (!date) return '';
    // Ensure date is a Date object
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return ''; // Invalid date

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Fetches data structured for a daily view.
 * @param {Date | string} date - The target date (Date object or YYYY-MM-DD string).
 * @returns {Promise<Array>} Array of task instances for the day.
 */
export const getDailyView = async (date) => {
  const formattedDate = formatDate(date);
  if (!formattedDate) {
      console.error('getDailyView: Invalid date provided.');
      return Promise.reject(new Error('Invalid date'));
  }
  try {
    const response = await apiClient.get(`/views/daily?date=${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error(`Get Daily View API error (date: ${formattedDate}):`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Fetches data structured for a weekly view.
 * @param {Date | string} weekStartDate - The start date of the target week (Date object or YYYY-MM-DD string).
 * @returns {Promise<Array>} Array of data grouped by course/day (check backend structure).
 */
export const getWeeklyView = async (weekStartDate) => {
    const formattedDate = formatDate(weekStartDate);
    if (!formattedDate) {
        console.error('getWeeklyView: Invalid weekStartDate provided.');
        return Promise.reject(new Error('Invalid date'));
    }
  try {
    const response = await apiClient.get(`/views/weekly?weekStartDate=${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error(`Get Weekly View API error (weekStart: ${formattedDate}):`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Fetches data structured for a semester view.
 * @param {string} semesterId - The ID of the semester.
 * @returns {Promise<Array>} Array of data (check backend structure).
 */
export const getSemesterView = async (semesterId) => {
  if (!semesterId) {
    console.error('getSemesterView: semesterId is required.');
    return Promise.reject(new Error('Semester ID is required'));
  }
  try {
    const response = await apiClient.get(`/views/semester?semesterId=${semesterId}`);
    return response.data;
  } catch (error) {
    console.error(`Get Semester View API error (semesterId: ${semesterId}):`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

// Add getUpcomingAssignmentsView and getGapsDataView later if needed 