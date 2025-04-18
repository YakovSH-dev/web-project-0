import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import AddCourseModal from '../course/AddCourseModal';
import CourseWindow from '../course/CourseWindow';

// Changed Logo component to use an image
const Logo = () => <img src="/DiakstraLogo3.png" alt="Logo" className="h-8 w-auto" />; // Adjust height as needed

function MainLayout() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { 
    activeSemester, 
    activeSemesterCourses, 
    isLoadingSemesters, 
    isLoadingCourses,
    refreshActiveSemesterCourses
  } = useSemester();

  // State for modal visibility
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isCourseWindowOpen, setIsCourseWindowOpen] = useState(false);
  const [selectedCourseForWindow, setSelectedCourseForWindow] = useState(null);

  // Use user name from context, provide fallback
  const userName = user?.name || t('user');
  
  // Determine semester name based on context state
  const semesterNameDisplay = isLoadingSemesters 
    ? t('loading') // Add 'loading' key to translation files
    : activeSemester?.name || t('noActiveSemester'); // Add 'noActiveSemester' key

  // Use courses from context
  const courses = activeSemesterCourses || [];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSemesterClick = () => {
    // TODO: Implement semester selection/management modal
    console.log('Semester clicked');
  };

  const handleCourseClick = (courseId) => {
    // Find the full course object
    const selectedCourse = activeSemesterCourses.find(course => course._id === courseId);
    if (selectedCourse) {
      console.log('Opening Course Window for:', selectedCourse.name);
      setSelectedCourseForWindow(selectedCourse);
      setIsCourseWindowOpen(true);
    } else {
      console.error('Could not find course with id:', courseId);
    }
  };

  const handleAddCourseClick = () => {
      console.log('Add Course button clicked');
      setIsAddCourseModalOpen(true); 
  };

  const handleCloseAddCourseModal = () => {
      setIsAddCourseModalOpen(false);
  };

  const handleCloseCourseWindow = () => {
    setIsCourseWindowOpen(false);
    setSelectedCourseForWindow(null);
    // Refresh courses when window closes, in case of deletion/update
    refreshActiveSemesterCourses(); 
  };

  const handleCourseAdded = (newCourse) => {
      console.log('New course added in MainLayout:', newCourse);
      refreshActiveSemesterCourses();
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <header className="bg-theme-bg-secondary sticky top-0 z-10 w-full">
         <nav className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
           {/* Left Side: Logo & Semester */}
           <div className="flex items-center space-x-4 rtl:space-x-reverse mb-2 md:mb-0">
             <Logo />
             <button 
               onClick={handleSemesterClick}
               className="text-theme-text-secondary hover:text-theme-primary font-semibold"
               disabled={isLoadingSemesters} // Disable while loading
              >
                 {semesterNameDisplay} {/* Use dynamic semester name */} 
             </button>
           </div>
 
           {/* Center: Course Circles & Add Button */}
           <div className="flex items-center space-x-2 rtl:space-x-reverse flex-grow justify-center mb-2 md:mb-0 mx-4">
              {/* Changed loading text color */}
              {isLoadingCourses && <span className="text-xs text-theme-text-secondary">{t('loadingCourses')}</span>} 
              {!isLoadingCourses && courses.map((course) => (
                 <button
                     key={course._id} // Use _id from MongoDB
                     onClick={() => handleCourseClick(course._id)}
                     title={course.name}
                     // Changed text color, added border to distinguish from bg
                     className={`w-8 h-8 rounded-full text-theme-text-primary border border-theme-secondary flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity shadow-sm`}
                     // Apply background color using inline style
                     style={{ backgroundColor: course.color || '#808080' }} // Use course color or fallback gray
                 >
                     {/* Use name from course data */}
                     {course.name?.substring(0, 1).toUpperCase() || '?'}
                 </button>
              ))}
              {/* Conditionally render add button? Maybe only if active semester exists? */}
              {!isLoadingCourses && activeSemester && (
                  <button 
                     onClick={handleAddCourseClick}
                     title={t('addCourseTitle')} // Add 'addCourseTitle' key
                     // Changed background, text, and hover colors
                     className="w-8 h-8 rounded-full bg-theme-secondary text-theme-bg flex items-center justify-center text-lg font-bold hover:bg-theme-primary transition-colors shadow-sm"
                  >
                     +
                 </button>
              )}
           </div>
 
           {/* Right Side: User, Language & Logout */}
           <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Changed text color */}
              <span className="text-sm text-theme-text-secondary hidden sm:inline">{t('helloUser', { name: userName })}</span> {/* Use i18n for greeting */}
              {/* Language Switcher - Adjusted styles for dark theme */}
              <button 
                 onClick={() => handleLanguageChange('en')} 
                 disabled={i18n.language === 'en'}
                 className={`px-2 py-1 text-xs rounded ${i18n.language === 'en' ? 'bg-theme-primary text-theme-bg font-semibold' : 'bg-theme-secondary text-theme-text-primary hover:bg-opacity-80'}`}
             >
                 EN
             </button>
             <button 
                 onClick={() => handleLanguageChange('he')} 
                 disabled={i18n.language === 'he'}
                 className={`px-2 py-1 text-xs rounded ${i18n.language === 'he' ? 'bg-theme-primary text-theme-bg font-semibold' : 'bg-theme-secondary text-theme-text-primary hover:bg-opacity-80'}`}
             >
                 HE
             </button>
             {/* Logout - Adjusted styles */}
             <button 
                 onClick={useAuth().logout} // Call logout from useAuth directly
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

      {/* Render the AddCourse modal */} 
      <AddCourseModal 
        isOpen={isAddCourseModalOpen}
        onClose={handleCloseAddCourseModal}
        onCourseAdded={handleCourseAdded} 
      />

      {/* Render the CourseWindow modal */}
      <CourseWindow
        course={selectedCourseForWindow}
        open={isCourseWindowOpen}
        onClose={handleCloseCourseWindow}
      />
    </div>
  );
}

export default MainLayout;