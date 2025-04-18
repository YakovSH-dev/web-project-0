import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// Placeholder for a real Logo component or img tag
const Logo = () => <span className="font-bold text-lg">Logo</span>;

function MainLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  // --- Placeholder Data & Handlers --- 
  // TODO: Replace with actual data fetching for semester/courses
  const userName = "User Name";
  const semesterName = "Fall 2024";
  const courses = [
      { id: '1', name: 'Course A', color: 'bg-red-500' },
      { id: '2', name: 'Course B', color: 'bg-blue-500' },
      { id: '3', name: 'Course C', color: 'bg-green-500' },
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSemesterClick = () => {
    console.log('Semester clicked');
  };

  const handleCourseClick = (courseId) => {
    console.log('Course clicked:', courseId);
  };

  const handleAddCourseClick = () => {
      console.log('Add Course clicked');
  };
  // --- End Placeholders ---

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-10 w-full">
        <nav className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
          {/* Left Side: Logo & Semester */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-2 md:mb-0">
            <Logo />
            <button 
              onClick={handleSemesterClick}
              className="text-gray-700 hover:text-blue-600 font-semibold"
             >
                {semesterName} 
            </button>
          </div>

          {/* Center: Course Circles & Add Button */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-grow justify-center mb-2 md:mb-0 mx-4">
             {courses.map((course) => (
                <button
                    key={course.id}
                    onClick={() => handleCourseClick(course.id)}
                    title={course.name}
                    className={`w-8 h-8 rounded-full ${course.color} text-white flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity shadow-sm`}
                >
                    {course.name.substring(0, 1).toUpperCase()}
                </button>
             ))}
             <button 
                onClick={handleAddCourseClick}
                title="Add Course"
                className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-lg font-bold hover:bg-gray-400 transition-colors shadow-sm"
             >
                +
            </button>
          </div>

          {/* Right Side: User, Language & Logout */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
             <span className="text-sm text-gray-600 hidden sm:inline">Hello, {userName}</span> 
             {/* Language Switcher */}
             <button 
                onClick={() => handleLanguageChange('en')} 
                disabled={i18n.language === 'en'}
                className={`px-2 py-1 text-xs rounded ${i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
                EN
            </button>
            <button 
                onClick={() => handleLanguageChange('he')} 
                disabled={i18n.language === 'he'}
                className={`px-2 py-1 text-xs rounded ${i18n.language === 'he' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
                HE
            </button>
            <button 
                onClick={logout}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
                {t('logoutButton')}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> 
      </main>

    </div>
  );
}

export default MainLayout;