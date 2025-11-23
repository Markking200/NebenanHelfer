import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentTasks, setStudentTasks] = useState({
    active: [],
    completed: []
  });

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setStudentTasks({ active: [], completed: [] });
    localStorage.removeItem('user');
    localStorage.removeItem('studentTasks');
  };

  const completeTask = (taskId) => {
    console.log('Completing task:', taskId);
    // This function is kept for compatibility but now we handle completion via API
    // The actual state update happens in the component via API call
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout,
      studentTasks,
      completeTask
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;