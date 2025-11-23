import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SeniorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="senior-dashboard" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome, {user?.name}! 👋</h1>
      <p>Senior Dashboard - Coming Soon</p>
      <p>This is your dedicated senior dashboard where you'll be able to:</p>
      <ul style={{ textAlign: 'left', display: 'inline-block', margin: '1rem 0' }}>
        <li>Request assistance from students</li>
        <li>Manage your profile and preferences</li>
        <li>View your assistance history</li>
        <li>Connect with helpful students in your area</li>
      </ul>
      <button onClick={handleLogout} style={{ 
        padding: '0.75rem 1.5rem', 
        background: '#ff6b6b', 
        color: 'white', 
        border: 'none', 
        borderRadius: '50px',
        cursor: 'pointer'
      }}>
        Log Out
      </button>
    </div>
  );
};

export default SeniorDashboard;