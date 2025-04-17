// client/src/App.jsx

import React, { useState, useEffect } from 'react'; 
// Import components
import Signup from './components/Signup.jsx'; 
import Login from './components/Login.jsx'; 
import SemesterList from './components/SemesterList.jsx'; 
import AddSemesterForm from './components/forms/AddSemesterForm.jsx'; // Import the new form component
// import './App.css'; 

function App() {
  const [authMode, setAuthMode] = useState('login'); 
  const [token, setToken] = useState(null);
  // State to trigger refresh of SemesterList by changing its key
  const [semesterListKey, setSemesterListKey] = useState(0); 

  // Effect to check for token in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      console.log("Found token in localStorage on load.");
    }
  }, []); 

  // Callback function for successful login
  const handleLoginSuccess = (newToken) => {
    console.log("App received token from Login component.");
    localStorage.setItem('authToken', newToken); 
    setToken(newToken);
    setSemesterListKey(prevKey => prevKey + 1); // Refresh semester list on login
  };

  // Logout function
  const handleLogout = () => {
    console.log("Logging out.");
    localStorage.removeItem('authToken'); 
    setToken(null); 
  };

  // Callback function passed to AddSemesterForm
  const handleSemesterAdded = (newSemester) => {
    console.log("App notified that new semester was added:", newSemester);
    // Increment the key for SemesterList to trigger a re-fetch
    setSemesterListKey(prevKey => prevKey + 1); 
  };

  // Styles
  const containerStyles = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' };
  const toggleButtonContainerStyle = { marginBottom: '20px', display: 'flex', gap: '10px' };
  const toggleButtonStyle = { padding: '8px 12px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: 'white', borderRadius: '4px' };
  const activeToggleButtonStyle = { ...toggleButtonStyle, backgroundColor: '#e0e0e0', fontWeight: 'bold' };
  const logoutButtonStyle = { padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', marginTop: '20px', alignSelf: 'flex-start' }; 
  const loggedInContentStyle = { width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }; 


  return (
    <div style={containerStyles}>
      <h1>Semester Tracker</h1> 
      
      {token ? (
        // --- Logged In View ---
        <div style={loggedInContentStyle}>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
          <h2>Welcome!</h2>
          {/* You could display user info here later */}
          
          {/* Add Semester Form - pass the callback */}
          <AddSemesterForm onSemesterAdded={handleSemesterAdded} />

          <hr style={{width: '80%', margin: '30px 0'}} /> 

          {/* Render the SemesterList component with a key */}
          {/* Changing the key forces React to remount the component, triggering useEffect */}
          <SemesterList key={semesterListKey} /> 

        </div>
      ) : (
        // --- Logged Out View (Login/Signup Forms) ---
        <div>
          <div style={toggleButtonContainerStyle}>
            <button 
              onClick={() => setAuthMode('login')}
              style={authMode === 'login' ? activeToggleButtonStyle : toggleButtonStyle}
            >
              Login
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              style={authMode === 'signup' ? activeToggleButtonStyle : toggleButtonStyle}
            >
              Sign Up
            </button>
          </div>
          {authMode === 'login' ? <Login onLoginSuccess={handleLoginSuccess} /> : <Signup />}
        </div>
      )}
    </div> 
  );
}

export default App;
