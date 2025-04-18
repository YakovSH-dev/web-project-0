import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createCourse } from '../../services/course';
import { useSemester } from '../../context/SemesterContext';

// Basic Modal wrapper (implement or import a proper one later)
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 relative w-full max-w-md">
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl leading-none"
        aria-label="Close"
      >
        &times;
      </button>
      {children}
    </div>
  </div>
);

function AddCourseModal({ isOpen, onClose, onCourseAdded }) {
  const { t } = useTranslation();
  const { activeSemesterId } = useSemester();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#cccccc'); // Default color
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeSemesterId) {
      setError('No active semester selected.'); // Should ideally not happen if modal is opened correctly
      return;
    }
    if (!name.trim()) {
       setError(t('courseNameRequired')); // Add translation key
       return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newCourseData = { 
        name: name.trim(), 
        color,
        semesterId: activeSemesterId,
      };
      const savedCourse = await createCourse(newCourseData);
      console.log('Course created:', savedCourse);
      onCourseAdded(savedCourse); // Notify parent component
      setName(''); // Reset form
      setColor('#cccccc');
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Add Course Modal error:', err);
      setError(err.message || t('errorCreatingCourse')); // Add translation key
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">{t('addCourseTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('courseNameLabel')} {/* Add translation key */}
          </label>
          <input
            type="text"
            id="course-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="course-color" className="block text-sm font-medium text-gray-700 mb-1">
            {t('courseColorLabel')} {/* Add translation key */}
          </label>
          <input
            type="color" // Simple color picker
            id="course-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md cursor-pointer"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('cancelButton')} {/* Add translation key */}
          </button>
          <button
            type="submit"
            disabled={isLoading || !activeSemesterId}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? t('creatingButton') : t('createButton')} {/* Add keys */}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddCourseModal; 