import apiClient from './apiClient';

/**
 * Fetches courses for a specific semester ID.
 * Assumes the backend route is protected and filters based on user and semesterId.
 * @param {string} semesterId - The ID of the semester.
 * @returns {Promise<Array>} An array of course objects for the given semester.
 */
export const getCoursesBySemester = async (semesterId) => {
  if (!semesterId) {
    return Promise.resolve([]); // Return empty array if no semester ID is provided
  }
  try {
    // Use query parameter to specify the semester
    const response = await apiClient.get(`/courses?semesterId=${semesterId}`);
    return response.data; // Expecting an array of courses
  } catch (error) {
    console.error(`Get Courses API error (semesterId: ${semesterId}):`, error.response ? error.response.data : error.message);
    // Let the caller handle the error
    throw error.response ? error.response.data : error;
  }
};

/**
 * Creates a new course.
 * @param {object} courseData - Data for the new course (e.g., { name, color, semesterId }).
 * @returns {Promise<object>} The created course object.
 */
export const createCourse = async (courseData) => {
  try {
    // Send POST request to the base /courses endpoint
    const response = await apiClient.post('/courses', courseData);
    return response.data; // Expecting the newly created course object
  } catch (error) {
    console.error("Create Course API error:", error.response ? error.response.data : error.message);
    // Let the caller handle the error (e.g., display form errors)
    throw error.response ? error.response.data : error;
  }
};

// Add other course-related API functions here later (e.g., updateCourse) 