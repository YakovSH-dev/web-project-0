// client/src/components/AddSemesterForm.jsx

import React, { useState } from 'react';
// Import the service function
import { addSemester } from '../../services/semesterService.js';

function AddSemesterForm({ onSemesterAdded }) { 
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    numberOfWeeks: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Updated handler using the service function
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('Adding semester...');

    try {
      // Call the service function instead of fetch directly
      // Pass the formData directly
      const newSemester = await addSemester(formData); 

      // Handle success
      console.log('Semester added successfully via service:', newSemester);
      setMessage(`Success: Semester "${newSemester.name}" added!`);
      setFormData({ name: '', startDate: '', numberOfWeeks: '' }); // Clear form

      // Call the optional callback if provided
      if (onSemesterAdded) {
        onSemesterAdded(newSemester); 
      }

    } catch (error) {
      // Handle errors thrown by the service function
      console.error('Error adding semester:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles (same as before)
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '30px', marginBottom: '20px', backgroundColor: '#fff', width: '100%', maxWidth: '500px' };
  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
  const labelStyle = { marginBottom: '-5px', fontSize: '0.9em', fontWeight: 'bold' };
  const buttonStyle = { padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#17a2b8', color: 'white', cursor: isLoading ? 'wait' : 'pointer', marginTop: '10px' };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3>Add New Semester</h3>
        
        <label htmlFor="name" style={labelStyle}>Semester Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Fall 2025" style={inputStyle} required />

        <label htmlFor="startDate" style={labelStyle}>Start Date:</label>
        <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle} required />

        <label htmlFor="numberOfWeeks" style={labelStyle}>Number of Weeks:</label>
        <input type="number" id="numberOfWeeks" name="numberOfWeeks" value={formData.numberOfWeeks} onChange={handleChange} placeholder="e.g., 15" style={inputStyle} min="1" required />

        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? 'Adding...' : 'Add Semester'}
        </button>

        {message && <p style={{ marginTop: '10px', textAlign: 'center' }}>{message}</p>}
      </form>
    </div>
  );
}

export default AddSemesterForm;
