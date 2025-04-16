import { useState } from 'react';

function App() {

  const [isActive, setIsActive] = useState(false);
  
  return (
    <div>
      <button
        style={{
          backgroundColor: isActive ? 'gray' : 'lightgray' 
        }}
        onClick={() => {
          setIsActive(!isActive)
        }}>
          click me
      </button>
    </div>
  )
}

export default App