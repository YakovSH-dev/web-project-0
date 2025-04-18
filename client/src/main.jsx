import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
// Remove direct App import if router handles root layout
// import App from './App.jsx' 
import AppRouter from './routes/index.jsx' // Import the router configuration (updated extension)
import './index.css'
import './i18n' // Import the i18n configuration

// Basic loading fallback component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    Loading...
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <AppRouter /> {/* Render the RouterProvider */} 
    </Suspense>
  </React.StrictMode>,
)
