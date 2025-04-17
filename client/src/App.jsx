// client/src/App.jsx

import React, { useState, useEffect } from 'react'; // Import useEffect
// Import the authentication components
import Signup from './components/Signup.jsx'; 
import Login from './components/Login.jsx'; 
// import './App.css'; 

function App() {
  // State to control which auth form to show: 'login' or 'signup'
  const [authMode, setAuthMode] = useState('login'); 
  // State to hold the authentication token
  const [token, setToken] = useState(null);
  // State for potentially showing user info later
  const [userInfo, setUserInfo] = useState(null); // Example state

  // --- Effect to check for token in localStorage on initial load ---
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // You might want to verify the token with the backend here
      // or fetch user info based on the token in a real app
      console.log("Found token in localStorage on load.");
      // Example: Fetch user data if token exists
      // fetchUserInfo(storedToken); 
    }
  }, []); // Empty dependency array means this runs once on mount

  // --- Callback function for successful login ---
  const handleLoginSuccess = (newToken) => {
    console.log("App received token from Login component.");
    localStorage.setItem('authToken', newToken); // Ensure token is saved
    setToken(newToken);
    // Optionally fetch user info after login
    // fetchUserInfo(newToken);
  };

  // --- Logout function ---
  const handleLogout = () => {
    console.log("Logging out.");
    localStorage.removeItem('authToken'); // Remove token from storage
    setToken(null); // Clear token state
    setUserInfo(null); // Clear user info state
  };

  // --- Placeholder for fetching user info (example) ---
  // const fetchUserInfo = async (currentToken) => {
  //   // Example: Call a '/api/users/me' endpoint with the token
  //   // const response = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${currentToken}` }});
  //   // const data = await response.json();
  //   // setUserInfo(data); 
  // };

  // Styles (same as before)
  const containerStyles = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' };
  const toggleButtonContainerStyle = { marginBottom: '20px', display: 'flex', gap: '10px' };
  const toggleButtonStyle = { padding: '8px 12px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: 'white', borderRadius: '4px' };
  const activeToggleButtonStyle = { ...toggleButtonStyle, backgroundColor: '#e0e0e0', fontWeight: 'bold' };
  const logoutButtonStyle = { padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', marginTop: '20px' };

  return (
    <div style={containerStyles}>
      <h1>Semester Tracker</h1> 
      
      {/* Check if user is logged in (token exists) */}
      {token ? (
        // --- Logged In View ---
        <div>
          <h2>Welcome!</h2>
          <p>You are logged in.</p>
          {/* Display user info if available */}
          {/* {userInfo && <p>Email: {userInfo.email}</p>} */}
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
          {/* Add Semester Tracker components here later */}
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

          {/* Conditionally render Login or Signup component */}
          {/* Pass the handleLoginSuccess function down to the Login component */}
          {authMode === 'login' ? <Login onLoginSuccess={handleLoginSuccess} /> : <Signup />}
        </div>
      )}
    </div> 
  );
}

export default App;
