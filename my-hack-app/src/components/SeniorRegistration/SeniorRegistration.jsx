import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';

const SeniorRegistration = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address: '',
    phone: '',
    user_type: 'senior',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Use your actual backend URL
  const API_BASE_URL = 'http://127.0.0.1:8000'; // Your Flask backend URL

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
      console.log('Sending data:', formData); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status); // Debug log

      // First, check if we got any response at all
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Registration failed. Please try again.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Handle specific status codes
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid data. Please check your information.';
            break;
          case 409:
            errorMessage = 'An account with this email already exists.';
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
      const data = await response.json();
      console.log('Success response:', data); // Debug log

      alert('Registration successful! You can now sign in.');
      setFormData({
        full_name: '',
        email: '',
        address: '',
        phone: '',
        user_type: 'senior',
        password: ''
      });
      navigate('/signin');

    } catch (error) {
      console.error('Registration error:', error);
      
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
    if (!formData.full_name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    
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
          <h1>Join as Senior</h1>
          <p>Get support and share your wisdom with the community</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="registration-form" onSubmit={onFormSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

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
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your full address"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
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
              placeholder="Create a password (min. 6 characters)"
              minLength="6"
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
                Registering...
              </>
            ) : (
              'Join as Senior'
            )}
          </button>
        </form>

        <div className="registration-footer">
          <p>Already have an account? <a href="/signin">Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SeniorRegistration;