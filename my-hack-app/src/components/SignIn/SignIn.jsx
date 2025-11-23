import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Registration.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Use your actual backend URL
  const API_BASE_URL = 'http://127.0.0.1:8000';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending login data:', formData); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        let errorMessage = 'Login failed. Please try again.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }

        // Handle specific status codes
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid email or password.';
            break;
          case 401:
            errorMessage = 'Invalid credentials. Please check your email and password.';
            break;
          case 404:
            errorMessage = 'Account not found. Please check your email.';
            break;
          case 422:
            errorMessage = 'Validation error. Please check your input.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            break;
        }

        throw new Error(errorMessage);
      }

      // If we get here, response is OK
      const userData = await response.json();
      console.log('Login success response:', userData); // Debug log

      // Transform the API response to match our app's user structure
      const user = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        user_type: userData.user_type,
        phone: userData.phone,
        address: userData.address,
        avatar: userData.user_type === 'student' ? '🎓' : '👤'
      };

      login(user);
      alert(`Welcome back, ${user.name}!`);

      // Redirect based on user type
      if (user.user_type === 'student') {
        navigate('/student-dashboard');
      } else if (user.user_type === 'senior') {
        // For now, redirect seniors to a placeholder page
        // You can create a SeniorDashboard later
        navigate('/senior-dashboard');
      } else {
        // Fallback for unknown user types
        navigate('/');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    return null;
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="registration-header">
          <div className="registration-logo">
            <div className="logo-icon">
              <div className="logo-dot dot-1"></div>
              <div className="logo-dot dot-2"></div>
              <div className="logo-dot dot-3"></div>
            </div>
            <span className="logo-text">NebenanHelfer</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="registration-form" onSubmit={onFormSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="registration-footer">
          <p>Don't have an account? <Link to="/join/student">Join as Student</Link> or <Link to="/join/senior">Join as Senior</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;