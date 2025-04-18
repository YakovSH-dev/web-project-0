import React from 'react'
import ReactDOM from 'react-dom/client'
// Remove direct App import if router handles root layout
// import App from './App.jsx' 
import AppRouter from './routes/index.jsx' // Import the router configuration (updated extension)
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter /> {/* Render the RouterProvider */} 
  </React.StrictMode>,
)
