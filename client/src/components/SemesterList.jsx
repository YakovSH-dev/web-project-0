// client/src/components/SemesterList.jsx

import React, { useState, useEffect } from 'react';

function SemesterList() {
  // State to store the fetched semesters
  const [semesters, setSemesters] = useState([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // State for storing potential errors
  const [error, setError] = useState(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    // Define the async function to fetch semesters
    const fetchSemesters = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Attempting to fetch semesters...");

      // 1. Get the authentication token from localStorage
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        console.error("Fetch semesters failed: No token found.");
        return; // Stop execution if no token
      }

      // 2. Define the API endpoint URL
      const apiUrl = 'https://diakstra.onrender.com/api/semesters'; // Your backend endpoint

      try {
        // 3. Make the fetch request with Authorization header
        const response = await fetch(apiUrl, {
          method: 'GET', // Default method is GET, but explicit is fine
          headers: {
            // Include the JWT in the Authorization header
            'Authorization': `Bearer ${token}`,
            // Content-Type is not usually needed for GET requests without a body
          },
        });

        // Check if the response status is OK (e.g., 200)
        if (!response.ok) {
           // Try to parse error message from backend if available
           let errorData;
           try {
               errorData = await response.json();
           } catch (parseError) {
               // If parsing fails, use the status text
               throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
           }
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response body
        const data = await response.json();
        console.log("Semesters fetched successfully:", data);

        // 5. Update the state with the fetched semesters
        setSemesters(data);

      } catch (err) {
        // 6. Handle any errors during the fetch operation
        console.error('Error fetching semesters:', err);
        setError(err.message || 'Failed to fetch semesters.');
      } finally {
        // 7. Set loading back to false after fetch completes (success or error)
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchSemesters();

  }, []); // Empty dependency array means this effect runs only once when the component mounts

  // --- Render Logic ---

  if (isLoading) {
    return <p>Loading semesters...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  // Helper function to format date nicely (optional)
  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString(undefined, { 
          year: 'numeric', month: 'short', day: 'numeric' 
      });
  }

  return (
    <div style={{ marginTop: '20px', width: '80%', maxWidth: '600px' }}>
      <h2>Your Semesters</h2>
      {semesters.length === 0 ? (
        <p>You haven't added any semesters yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {semesters.map((semester) => (
            <li key={semester._id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: 'white' }}>
              <h3 style={{ marginTop: 0 }}>{semester.name}</h3>
              <p>Start Date: {formatDate(semester.startDate)}</p>
              <p>Duration: {semester.numberOfWeeks} weeks</p>
              <p style={{ fontSize: '0.8em', color: '#777' }}>Created: {formatDate(semester.createdAt)}</p>
              {/* Add links/buttons for viewing details, editing, deleting later */}
            </li>
          ))}
        </ul>
      )}
      {/* Add a button/form to create new semesters later */}
    </div>
  );
}

export default SemesterList;

