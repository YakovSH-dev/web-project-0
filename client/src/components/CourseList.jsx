// client/src/components/CourseList.jsx

import React, { useState, useEffect } from 'react';
// Assuming your service file exists and has getCourses function
// import { getCourses } from '../services/courseService'; // Or semesterService

function CourseList({ semesterId }) { // Accept semesterId as a prop
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if a semesterId is provided
    if (!semesterId) {
      setCourses([]); // Clear courses if no semester is selected
      return;
    }

    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Attempting to fetch courses for semester: ${semesterId}`);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found.');
        setIsLoading(false);
        return;
      }

      // Construct the API URL with query parameter
      const apiUrl = `https://diakstra.onrender.com/api/courses?semesterId=${semesterId}`; 

      try {
        // --- Using fetch directly (replace with service call if preferred) ---
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
        console.log(`Courses fetched successfully for semester ${semesterId}:`, data);
        setCourses(data);
        // --- End fetch logic ---

        /* // --- Example using a service function (if you created one) ---
        const data = await getCourses(semesterId); // Assumes getCourses handles token/fetch
        console.log(`Courses fetched successfully for semester ${semesterId}:`, data);
        setCourses(data);
        */

      } catch (err) {
        console.error(`Error fetching courses for semester ${semesterId}:`, err);
        setError(err.message || 'Failed to fetch courses.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();

  // Dependency array includes semesterId - fetch again if it changes
  }, [semesterId]); 

  // --- Render Logic ---

  // Don't render anything if loading initially and no semester selected yet
  if (!semesterId && !isLoading && !error) return null; 

  if (isLoading) return <p>Loading courses...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  // Basic styling for course items (replace with circles later)
  const courseListStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      padding: '10px 0',
      justifyContent: 'center' // Center courses horizontally
  };
  const courseItemStyle = {
      border: '1px solid #ccc',
      borderRadius: '8px', // Make it rounder for circle feel
      padding: '10px 15px',
      backgroundColor: 'lightblue', // Placeholder color
      cursor: 'pointer',
      minWidth: '100px', // Ensure minimum size
      textAlign: 'center'
  };

  return (
    <div style={{ width: '100%'}}>
      <h4>Courses</h4>
      {courses.length === 0 ? (
        <p>No courses added for this semester yet.</p>
      ) : (
        <div style={courseListStyle}>
          {courses.map((course) => (
            // Make course item clickable (add handler later)
            <div 
              key={course._id} 
              style={{...courseItemStyle, backgroundColor: course.color || 'lightblue'}} // Use course color
              onClick={() => alert(`Clicked course: ${course.name}`)} // Placeholder action
            >
              {course.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;