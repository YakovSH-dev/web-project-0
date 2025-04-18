import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api', // Fallback for safety
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for handling common responses/errors (optional)
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle common errors like 401 Unauthorized globally if needed
//     if (error.response && error.response.status === 401) {
//       // e.g., logout user, redirect to login
//       localStorage.removeItem('authToken');
//       window.location.href = '/login'; // Consider using react-router navigation instead
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient; 