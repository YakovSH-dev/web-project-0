import { useState } from 'react';

function App() {

  const [isActive, setIsActive] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsActive(!isActive);
    setIsLoading(true);
    setApiMessage('Loading...');
    const apiUrl = 'https://diakstra.onrender.com/api/status';

    fetch(apiUrl)
      .then(response => {
        // Check if the response status code is OK (e.g., 200)
        if (!response.ok) {
          // If not OK, throw an error to be caught by the .catch block
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // If OK, parse the JSON body of the response
        return response.json(); 
      })
      .then(data => {
        // The 'data' variable now holds the parsed JSON object (e.g., { status: 'ok', message: '...' })
        // Update the apiMessage state with the message from the backend
        setApiMessage(data.message || 'No message field in response'); 
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch operation
        console.error('Error fetching API status:', error);
        setApiMessage(`Error: ${error.message}`);
      })
      .finally(() => {
        // This block runs regardless of success or error
        // Set loading state back to false
        setIsLoading(false);
      });
  };

  const containerStyles = {
    display: 'flex',          
    flexDirection: 'column',  
    alignItems: 'center',     
    justifyContent: 'center', 
    minHeight: '100vh',      
    padding: '20px'         
  };
  
  return (
    <div style={containerStyles}>
      <button // Main button 
        style={{
          backgroundColor: isActive ? 'gray' : 'lightgray',
          padding: '10px 20px',
          borderRadius: '5px',
          border: 'none',
          cursor: isLoading ? 'wait' : 'pointer',
        }}
        onClick={handleButtonClick}
        disabled={isLoading}
      >
          {isLoading ? 'Loading...' : 'Click Me'}
      </button>
      <p>API Status: {apiMessage || 'Click button to fetch status...'}</p>
    </div>
  )
}

export default App