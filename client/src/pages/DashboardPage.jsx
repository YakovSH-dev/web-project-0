import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement proper auth context/store logout
    localStorage.removeItem('authToken');
    console.log('Logged out, navigating to /login');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Placeholder for Header/Layout */} 
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </header>
      
      <main className="p-4">
        <h2 className="text-2xl mb-4">Welcome to your Dashboard!</h2>
        {/* Placeholder for dashboard panels (Upcoming, Gaps, Main View) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 shadow rounded">Upcoming Assignments Panel</div>
            <div className="bg-white p-4 shadow rounded">Main View Panel (Daily/Weekly/Semester)</div>
            <div className="bg-white p-4 shadow rounded">Gaps Panel</div>
            <div className="bg-white p-4 shadow rounded">AI Assistant Panel (Later)</div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage; 