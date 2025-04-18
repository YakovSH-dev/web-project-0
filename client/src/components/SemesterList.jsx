// client/src/components/SemesterList.jsx

import React, { useState, useEffect } from 'react';

// Accept onSelectSemester function as a prop
function SemesterList({ onSelectSemester }) { 
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Attempting to fetch semesters...");
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('No authentication token found. Please log in.');
        setIsLoading(false);
        console.error("Fetch semesters failed: No token found.");
        return; 
      }

      const apiUrl = 'https://diakstra.onrender.com/api/semesters'; 

      try {
        const response = await fetch(apiUrl, {
          method: 'GET', 
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
           let errorData;
           try { errorData = await response.json(); } 
           catch (parseError) { throw new Error(response.statusText || `HTTP error! status: ${response.status}`); }
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Semesters fetched successfully:", data);
        setSemesters(data);

      } catch (err) {
        console.error('Error fetching semesters:', err);
        setError(err.message || 'Failed to fetch semesters.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSemesters();
  }, []); 

  if (isLoading) {
    return <p>Loading semesters...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString(undefined, { 
          year: 'numeric', month: 'short', day: 'numeric' 
      });
  }

  // Style for clickable list items
  const listItemStyle = { 
    border: '1px solid #eee', 
    padding: '15px', 
    marginBottom: '10px', 
    borderRadius: '5px', 
    backgroundColor: 'white',
    cursor: 'pointer', // Indicate it's clickable
    transition: 'background-color 0.2s ease' // Smooth hover effect
  };

  // Add hover effect styles inline (or move to CSS)
  const handleMouseEnter = (e) => e.currentTarget.style.backgroundColor = '#f9f9f9';
  const handleMouseLeave = (e) => e.currentTarget.style.backgroundColor = 'white';


  return (
    <div style={{ marginTop: '20px', width: '80%', maxWidth: '600px' }}>
      {/* Title is now rendered in App.jsx, so we can remove it here if desired */}
      {/* <h2>Your Semesters</h2> */} 
      {semesters.length === 0 ? (
        <p>You haven't added any semesters yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {semesters.map((semester) => (
            // Add onClick handler to the list item
            <li 
              key={semester._id} 
              style={listItemStyle}
              onClick={() => onSelectSemester(semester._id)} // Call prop function with ID
              onMouseEnter={handleMouseEnter} // Add hover effect
              onMouseLeave={handleMouseLeave} // Remove hover effect
            >
              <h3 style={{ marginTop: 0 }}>{semester.name}</h3>
              <p>Start Date: {formatDate(semester.startDate)}</p>
              <p>Duration: {semester.numberOfWeeks} weeks</p>
              <p style={{ fontSize: '0.8em', color: '#777' }}>Created: {formatDate(semester.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SemesterList;
