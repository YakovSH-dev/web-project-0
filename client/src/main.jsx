import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom"; // Import RouterProvider
import router from './routes/index.jsx' // Import the router instance
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
      <RouterProvider router={router} fallbackElement={<Loading />} /> 
    </Suspense>
  </React.StrictMode>,
)
