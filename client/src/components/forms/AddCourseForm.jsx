// client/src/components/AddCourseForm.jsx

import React, { useState } from 'react';
// Import the service function
import { addCourse } from '../../services/semesterService.js'; // Assuming addCourse is in semesterService for now

// This component needs the ID of the semester it's adding a course TO,
// and potentially a callback function to run after success (e.g., to refresh course list)
function AddCourseForm({ semesterId, onCourseAdded }) { 
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    color: '#cccccc', // Default color
    instructor: '',
    description: '',
    // links: [], // Handle links later if needed
  });
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // State for displaying success or error messages
  const [message, setMessage] = useState('');

  // Handler for input field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('Adding course...');

    // Prepare the data payload, including the semesterId from props
    const courseData = {
      ...formData,
      semesterId: semesterId, // Add the semesterId
    };

    try {
      // Call the service function
      const newCourse = await addCourse(courseData); 

      // Handle success
      console.log('Course added successfully via service:', newCourse);
      setMessage(`Success: Course "${newCourse.name}" added!`);
      // Clear form (reset to initial state or empty)
      setFormData({ name: '', color: '#cccccc', instructor: '', description: '' }); 

      // Call the optional callback if provided
      if (onCourseAdded) {
        onCourseAdded(newCourse); 
      }

    } catch (error) {
      // Handle errors thrown by the service function
      console.error('Error adding course:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic styling (can be moved to CSS)
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px', marginBottom: '20px', backgroundColor: '#fff', width: '100%', maxWidth: '500px' };
  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
  const labelStyle = { marginBottom: '-5px', fontSize: '0.9em', fontWeight: 'bold' };
  const buttonStyle = { padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: isLoading ? 'wait' : 'pointer', marginTop: '10px' };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3>Add New Course</h3>
        
        <label htmlFor="courseName" style={labelStyle}>Course Name:</label>
        <input type="text" id="courseName" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Intro to CS" style={inputStyle} required />

        <label htmlFor="courseColor" style={labelStyle}>Color:</label>
        <input type="color" id="courseColor" name="color" value={formData.color} onChange={handleChange} style={{...inputStyle, height: '40px'}} /> 

        <label htmlFor="courseInstructor" style={labelStyle}>Instructor (Optional):</label>
        <input type="text" id="courseInstructor" name="instructor" value={formData.instructor} onChange={handleChange} placeholder="e.g., Dr. Smith" style={inputStyle} />
        
        <label htmlFor="courseDescription" style={labelStyle}>Description (Optional):</label>
        <textarea id="courseDescription" name="description" value={formData.description} onChange={handleChange} placeholder="Brief course overview" style={inputStyle} rows="3"></textarea>

        {/* Add inputs for links later if needed */}

        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? 'Adding...' : 'Add Course'}
        </button>

        {message && <p style={{ marginTop: '10px', textAlign: 'center' }}>{message}</p>}
      </form>
    </div>
  );
}

export default AddCourseForm;

