import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJoinMenuOpen, setIsJoinMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinClick = () => {
    setIsJoinMenuOpen(!isJoinMenuOpen);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsJoinMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Animated Background Elements */}
      <div className="header-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="connection-line"></div>
      </div>

      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={closeAllMenus}>
          <div className="logo-icon">
            <div className="logo-dot dot-1"></div>
            <div className="logo-dot dot-2"></div>
            <div className="logo-dot dot-3"></div>
          </div>
          <span className="logo-text">NebenanHelfer</span>
        </Link>
        
        {/* Navigation */}
        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/#how-it-works" 
            className="nav-link"
            onClick={closeAllMenus}
          >
            How it Works
          </Link>
          <Link 
            to="/#features" 
            className="nav-link"
            onClick={closeAllMenus}
          >
            Features
          </Link>
          <Link 
            to="/#stories" 
            className="nav-link"
            onClick={closeAllMenus}
          >
            Stories
          </Link>
          <Link 
            to="/#contact" 
            className="nav-link"
            onClick={closeAllMenus}
          >
            Contact
          </Link>
          
          {/* Show Dashboard link only for authenticated students */}
          {isAuthenticated && user?.user_type === 'student' && (
            <> 

            <Link 
              to="/student-dashboard" 
              className="nav-link"
              onClick={closeAllMenus}
            >
              Dashboard
            </Link>
            <Link
              to="/my-tasks"
              className='nav-link'
              onClick={closeAllMenus}
            >
              My Tasks
            </Link>
            </> 

          )}
          {isAuthenticated && user?.user_type === 'senior' && (
            <>
            <Link to="/senior-dashboard" className="nav-link" onClick={closeAllMenus}>
             My Dashboard
            </Link>
            </>
           )}


          {/* Show Sign In link only when NOT authenticated */}
          {!isAuthenticated && (
            <Link 
              to="/signin" 
              className="nav-link"
              onClick={closeAllMenus}
            >
              Sign In
            </Link>
          )}
        </nav>
        
        {/* Join Us Section - Only show when NOT authenticated */}
        <div className="header-actions">
          {!isAuthenticated ? (
            <div className="join-container">
              <button 
                className="join-trigger"
                onClick={handleJoinClick}
                onBlur={() => setTimeout(() => setIsJoinMenuOpen(false), 150)}
              >
                <span className="join-text">Join Us</span>
                <span className={`join-arrow ${isJoinMenuOpen ? 'open' : ''}`}>↓</span>
              </button>
              
              <div className={`join-dropdown ${isJoinMenuOpen ? 'open' : ''}`}>
                <Link to="/join/student" className="join-option student-option" onClick={closeAllMenus}>
                  <div className="option-icon">🎓</div>
                  <div className="option-content">
                    <h4>Join as Student</h4>
                    <p>Help your community, gain experience</p>
                  </div>
                  <div className="option-arrow">→</div>
                </Link>
                
                <Link to="/join/senior" className="join-option senior-option" onClick={closeAllMenus}>
                 <div className="option-icon">🌅</div>
                  <div className="option-content">
                    <h4>Join as Senior</h4>
                    <p>Get support, share wisdom</p>
                  </div>
                  <div className="option-arrow">→</div>
                </Link>
              </div>
            </div>
          ) : (
            // Show user info and logout when authenticated
            <div className="user-menu">
              <span className="user-greeting">Hello, {user?.name}</span>
              {user?.user_type === 'student' && (
                <Link to="/student-dashboard" className="dashboard-btn">
                  Dashboard
                </Link>
              )}
            </div>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;