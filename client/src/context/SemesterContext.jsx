import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext'; // To know when user is authenticated
import { getSemesters } from '../services/semester';
import { getCoursesBySemester } from '../services/course';

const SemesterContext = createContext(null);

const LOCAL_STORAGE_KEY = 'activeSemesterId';

export const SemesterProvider = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get auth state

  const [semesters, setSemesters] = useState([]);
  const [activeSemesterId, setActiveSemesterId] = useState(() => localStorage.getItem(LOCAL_STORAGE_KEY) || null);
  const [activeSemesterCourses, setActiveSemesterCourses] = useState([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [errorSemesters, setErrorSemesters] = useState(null);
  const [errorCourses, setErrorCourses] = useState(null);

  // --- Callback to fetch courses --- (extracted for reuse)
  const fetchCoursesForSemester = useCallback(async (semesterId) => {
    if (!semesterId) {
      setActiveSemesterCourses([]);
      setErrorCourses(null);
      return;
    }
    console.log(`SemesterContext: Fetching courses for ${semesterId}...`);
    setIsLoadingCourses(true);
    setErrorCourses(null);
    try {
      const fetchedCourses = await getCoursesBySemester(semesterId);
      console.log(`SemesterContext: Courses fetched for ${semesterId}`, fetchedCourses);
      setActiveSemesterCourses(fetchedCourses || []);
    } catch (error) {
      console.error(`SemesterContext: Failed to fetch courses for ${semesterId}:`, error);
      setErrorCourses(error);
      setActiveSemesterCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, []); // No dependencies needed for the function itself

  // --- Effect to fetch semesters when user is authenticated ---
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      console.log('SemesterContext: Auth detected, fetching semesters...');
      setIsLoadingSemesters(true);
      setErrorSemesters(null);
      getSemesters()
        .then(fetchedSemesters => {
          console.log('SemesterContext: Semesters fetched', fetchedSemesters);
          setSemesters(fetchedSemesters || []);
          // Determine initial active semester if none is set or stored one is invalid
          const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
          const isValidStoredId = fetchedSemesters?.some(s => s._id === storedId);
          
          let initialActiveId = null;
          if (isValidStoredId) {
            initialActiveId = storedId;
            console.log(`SemesterContext: Using stored activeSemesterId: ${initialActiveId}`);
          } else if (fetchedSemesters?.length > 0) {
            // Default to the most recent semester (simple example: last in array)
            // TODO: Implement proper sorting by date if needed
            initialActiveId = fetchedSemesters[fetchedSemesters.length - 1]._id;
            console.log(`SemesterContext: No valid stored ID, defaulting to most recent: ${initialActiveId}`);
            localStorage.setItem(LOCAL_STORAGE_KEY, initialActiveId);
          } else {
            console.log('SemesterContext: No semesters found for user.');
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
          setActiveSemesterId(initialActiveId);
        })
        .catch(error => {
          console.error('SemesterContext: Failed to fetch semesters:', error);
          setErrorSemesters(error);
          setSemesters([]);
          setActiveSemesterId(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        })
        .finally(() => {
          setIsLoadingSemesters(false);
        });
    } else if (!isAuthenticated && !isAuthLoading) {
      // Clear state if user logs out
      setSemesters([]);
      setActiveSemesterId(null);
      setActiveSemesterCourses([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setErrorSemesters(null);
      setErrorCourses(null);
    }
  }, [isAuthenticated, isAuthLoading]);

  // --- Effect to fetch courses when active semester changes ---
  useEffect(() => {
    fetchCoursesForSemester(activeSemesterId);
  }, [activeSemesterId, fetchCoursesForSemester]); // Add fetchCoursesForSemester dependency

  // --- Function to manually change the active semester ---
  const selectSemester = useCallback((semesterId) => {
    // Check if the selected ID is actually in the fetched list (optional safety)
    if (semesters.some(s => s._id === semesterId)) {
      console.log(`SemesterContext: Manually selecting semester: ${semesterId}`);
      setActiveSemesterId(semesterId);
      localStorage.setItem(LOCAL_STORAGE_KEY, semesterId);
    } else if (semesterId === null) {
        // Allow explicitly setting to null (e.g., if user deletes last semester)
        console.log('SemesterContext: Manually clearing active semester.');
        setActiveSemesterId(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
         console.warn(`SemesterContext: Attempted to select invalid semesterId: ${semesterId}`);
    }
  }, [semesters]); // Depends on the list of valid semesters

  // --- Function to explicitly refresh courses for the *current* active semester ---
  const refreshActiveSemesterCourses = useCallback(() => {
    console.log('SemesterContext: Explicitly refreshing courses for', activeSemesterId);
    if (activeSemesterId) {
      fetchCoursesForSemester(activeSemesterId);
    }
  }, [activeSemesterId, fetchCoursesForSemester]); // Dependencies

  // Memoize context value
  const contextValue = useMemo(() => ({
    semesters,
    activeSemesterId,
    activeSemester: semesters.find(s => s._id === activeSemesterId) || null,
    activeSemesterCourses,
    isLoadingSemesters,
    isLoadingCourses,
    errorSemesters,
    errorCourses,
    selectSemester,
    refreshActiveSemesterCourses, // Expose the refresh function
  }), [
    semesters,
    activeSemesterId,
    activeSemesterCourses,
    isLoadingSemesters,
    isLoadingCourses,
    errorSemesters,
    errorCourses,
    selectSemester,
    refreshActiveSemesterCourses // Add to dependency array
  ]);

  return (
    <SemesterContext.Provider value={contextValue}>
      {children}
    </SemesterContext.Provider>
  );
};

// Custom hook to consume the context
export const useSemester = () => {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemester must be used within a SemesterProvider');
  }
  return context;
}; 