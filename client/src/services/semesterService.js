// client/src/services/semesterService.js

// Define the base URL for your API. Consider moving this to an environment variable later.
const API_BASE_URL = 'https://diakstra.onrender.com/api';

// Helper function to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to handle API responses and errors
const handleResponse = async (response) => {
  const data = await response.json(); // Attempt to parse JSON regardless of status
  if (!response.ok) {
    // Throw an error with the message from the backend if available
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data; // Return parsed JSON data on success
};

/**
 * Fetches all semesters for the logged-in user.
 * @returns {Promise<Array>} A promise that resolves to an array of semester objects.
 */
export const getSemesters = async () => {
  const token = getAuthToken();
  if (!token) {
    // Throw an error or return a specific status if no token is found
    throw new Error('Authentication token not found.'); 
  }

  const response = await fetch(`${API_BASE_URL}/semesters`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Adds a new semester for the logged-in user.
 * @param {object} semesterData - Object containing name, startDate, numberOfWeeks.
 * @returns {Promise<object>} A promise that resolves to the newly created semester object.
 */
export const addSemester = async (semesterData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found.');
  }

   // Ensure numberOfWeeks is a number before sending
   const bodyData = {
       ...semesterData,
       numberOfWeeks: parseInt(semesterData.numberOfWeeks, 10) || 0 
   };

  const response = await fetch(`${API_BASE_URL}/semesters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });

  return handleResponse(response);
};

// Add other semester-related API call functions here later (e.g., updateSemester, deleteSemester)
