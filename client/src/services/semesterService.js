// client/src/services/semesterService.js

// Define the base URL for your API. Consider moving this to an environment variable later.
const API_BASE_URL = 'https://diakstra.onrender.com/api';

// Helper function to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to handle API responses and errors
const handleResponse = async (response) => {
  // Try to parse JSON regardless of status code, as backend might send error details
  let data;
  try {
      data = await response.json();
  } catch (error) {
      // If parsing fails (e.g., empty body for 204), create a fallback object
      data = { message: response.statusText };
  }

  if (!response.ok) {
    // Throw an error with the message from the backend if available, else use status text
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
  if (!token) throw new Error('Authentication token not found.'); 

  const response = await fetch(`${API_BASE_URL}/semesters`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
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
  if (!token) throw new Error('Authentication token not found.');

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

/**
 * Adds a new course to a specific semester for the logged-in user.
 * @param {object} courseData - Object containing course details (name, color, etc.) AND semesterId.
 * @returns {Promise<object>} A promise that resolves to the newly created course object.
 */
export const addCourse = async (courseData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.'); 

  // The backend route is POST /api/courses
  // It expects semesterId in the body according to our controller design
  if (!courseData.semesterId) {
      throw new Error('semesterId is required to add a course.');
  }

  const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(courseData), // Send all course data including semesterId
  });

  return handleResponse(response);
};


/** // --- Placeholder for getCourses service function ---
 * Fetches courses for a specific semester.
 * @param {string} semesterId - The ID of the semester.
 * @returns {Promise<Array>} A promise that resolves to an array of course objects.
 */
export const getCourses = async (semesterId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    if (!semesterId) throw new Error('semesterId is required.');

    const response = await fetch(`${API_BASE_URL}/courses?semesterId=${semesterId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
};


// Add other API call functions here later (e.g., updateSemester, deleteSemester, updateCourse, etc.)

