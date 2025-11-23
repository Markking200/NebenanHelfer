import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyTasks.css';

const MyTasks = () => {
  const { user, studentTasks, completeTask, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCompleteTask = (taskId) => {
    completeTask(taskId);
    alert('Task marked as completed! Thank you for your help!');
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const taskDate = new Date(dateString);
    const diffTime = taskDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Overdue';
  };

  if (!user || user.user_type !== 'student') {
    navigate('/signin');
    return null;
  }

  return (
    <div className="my-tasks">
      {/* Header */}
      <header className="tasks-header">
        <div className="tasks-container">
          <div className="tasks-welcome">
            <h1 className="tasks-title">My Assistance Tasks 📋</h1>
            <p className="tasks-subtitle">
              Track your ongoing and completed community support activities
            </p>
          </div>
          <div className="tasks-actions">
            <button onClick={() => navigate('/student-dashboard')} className="dashboard-btn">
              Back to Dashboard
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Tasks Overview */}
      <div className="tasks-overview">
        <div className="overview-stats">
          <div className="overview-stat">
            <div className="stat-number">{studentTasks.active.length}</div>
            <div className="stat-label">Active Tasks</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">{studentTasks.completed.length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="overview-stat">
            <div className="stat-number">
              {studentTasks.active.length + studentTasks.completed.length}
            </div>
            <div className="stat-label">Total Helps</div>
          </div>
        </div>
      </div>

      <div className="tasks-content">
        {/* Programmed Tasks Section */}
        <section className="tasks-section">
          <div className="section-header">
            <h2>🔄 Programmed Assistance</h2>
            <p>Your upcoming community support activities</p>
          </div>

          {studentTasks.active.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Active Tasks</h3>
              <p>You don't have any programmed assistance tasks yet.</p>
              <button 
                onClick={() => navigate('/student-dashboard')}
                className="find-tasks-btn"
              >
                Find Community Members to Help
              </button>
            </div>
          ) : (
            <div className="tasks-grid">
              {studentTasks.active.map((task) => (
                <div key={task.id} className="task-card active">
                  <div className="task-header">
                    <div className="senior-avatar">{task.senior.avatar}</div>
                    <div className="senior-info">
                      <h3>{task.senior.name}</h3>
                      <p>{task.senior.age} years old</p>
                    </div>
                    <div className="task-badge scheduled">
                      {getDaysUntil(task.scheduledDate)}
                    </div>
                  </div>

                  <div className="task-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{task.senior.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📞</span>
                      <span className="detail-text">{task.senior.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕒</span>
                      <span className="detail-text">
                        Scheduled: {formatDate(task.scheduledDate)}
                      </span>
                    </div>
                  </div>

                  <div className="current-request">
                    <strong>Assistance Needed:</strong> {task.senior.currentRequest}
                  </div>

                  <div className="task-preferences">
                    <strong>Preferences:</strong>
                    <div className="preferences-list">
                      {task.senior.preferences.map((pref, index) => (
                        <span key={index} className="preference-tag">{pref}</span>
                      ))}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button 
                      onClick={() => completeTask(task.id)}
                      className="complete-btn"
                    >
                      Mark as Completed
                    </button>
                    <button className="contact-btn">
                      📞 Contact {task.senior.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Tasks Section */}
        <section className="tasks-section">
          <div className="section-header">
            <h2>✅ Completed Assistance</h2>
            <p>Your past community support activities</p>
          </div>

          {studentTasks.completed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Completed Tasks Yet</h3>
              <p>Your completed assistance tasks will appear here.</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {studentTasks.completed.map((task) => (
                <div key={task.id} className="task-card completed">
                  <div className="task-header">
                    <div className="senior-avatar">{task.senior.avatar}</div>
                    <div className="senior-info">
                      <h3>{task.senior.name}</h3>
                      <p>{task.senior.age} years old</p>
                    </div>
                    <div className="task-badge completed-badge">
                      Completed ✓
                    </div>
                  </div>

                  <div className="task-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{task.senior.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🤝</span>
                      <span className="detail-text">
                        Helped on: {formatDate(task.completedDate)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⭐</span>
                      <span className="detail-text">
                        Originally needed: {task.senior.currentRequest}
                      </span>
                    </div>
                  </div>

                  <div className="completion-message">
                    <strong>Thank you for helping {task.senior.name.split(' ')[0]}! 🎉</strong>
                    <p>Your support made a real difference in their day.</p>
                  </div>

                  <div className="task-stats">
                    <div className="stat">
                      <span className="stat-label">Duration:</span>
                      <span className="stat-value">{task.senior.lastHelpDuration}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Times Helped:</span>
                      <span className="stat-value">{task.senior.timesHelped + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyTasks;