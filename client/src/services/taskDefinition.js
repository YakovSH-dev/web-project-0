import apiClient from './apiClient'; // Assuming your API client is configured

/**
 * Creates a new TaskDefinition.
 * @param {object} taskDefinitionData - Data for the new task definition.
 *   Expected properties: type, description, schedule, length, courseId.
 * @returns {Promise<object>} The created task definition object.
 */
export const createTaskDefinition = async (taskDefinitionData) => {
  try {
    const response = await apiClient.post('/taskdefinitions', taskDefinitionData);
    return response.data;
  } catch (error) {
    console.error('Error creating task definition:', error.response?.data || error.message);
    throw error.response?.data || new Error('Server error creating task definition');
  }
};

/**
 * Fetches TaskDefinitions for a specific course.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Array<object>>} An array of task definition objects.
 */
export const getTaskDefinitionsByCourse = async (courseId) => {
  if (!courseId) {
    console.error('getTaskDefinitionsByCourse requires a courseId');
    return []; // Or throw an error
  }
  try {
    // Send courseId as a query parameter
    const response = await apiClient.get('/taskdefinitions', {
      params: { courseId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching task definitions:', error.response?.data || error.message);
    throw error.response?.data || new Error('Server error fetching task definitions');
  }
};

/**
 * Deletes a TaskDefinition by its ID.
 * @param {string} definitionId - The ID of the task definition to delete.
 * @returns {Promise<object>} The response data from the server (usually a success message).
 */
export const deleteTaskDefinition = async (definitionId) => {
  if (!definitionId) {
    console.error('deleteTaskDefinition requires a definitionId');
    throw new Error('Definition ID is required for deletion.');
  }
  try {
    const response = await apiClient.delete(`/taskdefinitions/${definitionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task definition:', error.response?.data || error.message);
    throw error.response?.data || new Error('Server error deleting task definition');
  }
};

// TODO: Add function for updating task definitions

// Add other task definition related service functions here later (get, update, delete) 