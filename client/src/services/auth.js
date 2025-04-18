import apiClient from './apiClient';

/**
 * Sends login credentials to the backend.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} The response data, typically { token, user }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // Should contain token and user info
  } catch (error) {
    console.error("Login API error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

/**
 * Sends registration details to the backend.
 * @param {object} userData - { name (optional), email, password }
 * @returns {Promise<object>} The response data, typically the created user info
 */
export const registerUser = async (userData) => {
  try {
    // Only include name if it's provided and not empty
    const payload = { ...userData };
    if (!payload.name) {
      delete payload.name;
    }
    const response = await apiClient.post('/auth/register', payload);
    return response.data; // Should contain created user info (confirm backend response)
  } catch (error) {
    console.error("Registration API error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

// Optional: Add a function to fetch user profile if needed later
// export const getUserProfile = async () => { ... } 