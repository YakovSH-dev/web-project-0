import apiClient from './apiClient';

/**
 * Updates specific fields of a task instance.
 * @param {string} instanceId - The ID of the task instance to update.
 * @param {object} updateData - An object containing the fields to update (e.g., { isCompleted: true }).
 * @returns {Promise<object>} The updated task instance object.
 */
export const updateTaskInstance = async (instanceId, updateData) => {
  if (!instanceId) {
    console.error('updateTaskInstance: instanceId is required.');
    return Promise.reject(new Error('Task Instance ID is required'));
  }
  try {
    // Use PUT request to the specific instance endpoint
    const response = await apiClient.put(`/taskinstances/${instanceId}`, updateData);
    return response.data; // Expecting the updated task instance object
  } catch (error) {
    console.error(`Update Task Instance API error (ID: ${instanceId}):`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

// Add other task instance related functions later (e.g., getTaskInstanceById, deleteTaskInstance) 