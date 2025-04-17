import { useState } from 'react';

function App() {

  const [apiStatusMessage, setApiStatusMessage] = useState('');
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const [userData, setUserData] = useState({});
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);

  const [formData, setFormData] = useState({name: '', age: ''});

  const handleButtonClick = () => {
    setIsStatusLoading(true);
    setApiStatusMessage('Loading...');

    const apiStatusUrl = 'https://diakstra.onrender.com/api/status';
    const clicksApiUrl = 'https://diakstra.onrender.com/api/clicks';

    fetch(apiStatusUrl)
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
        setApiStatusMessage(data.message || 'No message field in response');

        console.log('Status fetched successfully, now recording click...');
        return fetch(clicksApiUrl, {
          method: 'POST',
          // Headers are important for POST, especially Content-Type
          headers: {
            'Content-Type': 'application/json',
          },
          // Sending an empty body as this endpoint doesn't require specific data
          body: JSON.stringify({}) 
        });      
      })
      .then(response => {
        // Check response of the POST request
        if (!response.ok) {
          // Handle potential errors from the POST request
          throw new Error(`POST request failed! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response from POST
      })
      .then(data => {
        // Log success message from the POST response
        console.log('Click recorded:', data.message); 
        // Optionally update UI further, maybe append "(click recorded)" to apiMessage?
        // setApiMessage(prevMessage => prevMessage + " (click recorded)"); 
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch operation
        console.error('Error fetching API status:', error);
        setApiStatusMessage(`Error: ${error.message}`);
      })
      .finally(() => {
        // This block runs regardless of success or error
        // Set loading state back to false
        setIsStatusLoading(false);
      });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleFormSubmit = () => {
    setIsUserDataLoading(true)
    setUserData({Name:'Loading...', Age: 'Loading...'})

    const userDataSubmitUrl = 'https://diakstra.onrender.com/api/userSubmit'

    fetch(userDataSubmitUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); 
      })
      .then (() => {
        setUserData({ ...formData, [e.target.name]: e.target.value });
      })
      .finally(() => {
        setIsUserDataLoading(false);
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
      <button // Status button 
        style={{
          backgroundColor:'lightgray',
          padding: '10px 20px',
          borderRadius: '5px',
          border: 'none',
          cursor: isStatusLoading ? 'wait' : 'pointer',
        }}
        onClick={handleButtonClick}
        disabled={isStatusLoading}
      >
          {isStatusLoading ? 'Loading...' : 'Click Me'}
      </button>
      <p>API Status: {apiStatusMessage || 'Click button to fetch status...'}</p>
      <form onSubmit={handleFormSubmit} > 
        <input
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          placeholder="Name"
        />
        <input
          name="age"
          value={formData.email}
          onChange={handleFormChange}
          placeholder="age"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default App