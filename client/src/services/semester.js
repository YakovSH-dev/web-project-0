import apiClient from './apiClient';

/**
 * Fetches all semesters for the currently authenticated user.
 * Assumes the backend route is protected and identifies the user via token.
 * @returns {Promise<Array>} An array of semester objects.
 */
export const getSemesters = async () => {
  try {
    const response = await apiClient.get('/semesters');
    return response.data; // Expecting an array of semesters
  } catch (error) {
    console.error("Get Semesters API error:", error.response ? error.response.data : error.message);
    // Let the caller handle the error (e.g., display a message)
    throw error.response ? error.response.data : error;
  }
};

// Add other semester-related API functions here later (e.g., createSemester, updateSemester) 