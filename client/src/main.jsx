import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom"; // Import RouterProvider
import router from './routes/index.jsx' // Import the router instance
import './index.css'
import './i18n' // Import the i18n configuration

// MUI Theme Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define the dark theme using our color palette
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a192f', // theme-bg
      paper: '#112240',   // theme-bg-secondary
    },
    text: {
      primary: '#ccd6f6', // theme-text-primary
      secondary: '#8892b0', // theme-text-secondary
    },
    primary: {
      main: '#64ffda', // theme-primary
    },
    secondary: {
      main: '#8892b0', // theme-secondary
    },
    // Consider adjusting other palette colors like divider, action, etc. if needed
    divider: 'rgba(136, 146, 176, 0.2)', // Lighter version of theme-secondary
  },
  // Optionally customize typography, components defaults here
  typography: {
      fontFamily: 'inherit', // Inherit font from global styles if set
  },
});

// Basic loading fallback component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen text-theme-text-primary bg-theme-bg">
    Loading...
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      {/* Wrap the RouterProvider with MUI ThemeProvider and CssBaseline */}
      <ThemeProvider theme={darkTheme}>
        <CssBaseline /> {/* Apply baseline styles */}
        <RouterProvider router={router} fallbackElement={<Loading />} /> 
      </ThemeProvider>
    </Suspense>
  </React.StrictMode>,
)
