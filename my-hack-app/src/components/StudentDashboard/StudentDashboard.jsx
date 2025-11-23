import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    if (!user || user.user_type !== 'student') {
      navigate('/signin');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch requests.");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    if (!user || !user.id) {
      setError('User information not available. Please log in again.');
      return;
    }

    setUpdatingRequest(requestId);
    setError('');

    try {
      console.log('Updating request:', requestId, 'to status:', newStatus, 'for user:', user.id);
      
      const requestBody = {
        user_id: user.id,
        status: newStatus
      };

      const response = await fetch(`${API_BASE_URL}/api/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to update request. Please try again.`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('Error response:', errorData);
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const updatedRequest = await response.json();
      console.log('Request updated successfully:', updatedRequest);

      // Update the request in local state
      setRequests(prev => prev.map(request => 
        request.id === requestId ? updatedRequest : request
      ));

      if (newStatus === 'in_progress') {
        alert(`You have successfully accepted the request: "${updatedRequest.title}"`);
      } else if (newStatus === 'open') {
        alert(`You have unassigned yourself from the request: "${updatedRequest.title}"`);
      } else if (newStatus === 'completed') {
        alert(`Thank you for helping! The request "${updatedRequest.title}" has been marked as completed.`);
      }

    } catch (err) {
      console.error('Error updating request:', err);
      setError(err.message || "Failed to update request. Please try again.");
    } finally {
      setUpdatingRequest(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    await updateRequestStatus(requestId, 'in_progress');
  };

  const handleUnassignRequest = async (requestId) => {
    await updateRequestStatus(requestId, 'open');
  };

  const handleCompleteRequest = async (requestId) => {
    await updateRequestStatus(requestId, 'completed');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ff6b6b';
      case 'in_progress': return '#ffd93d';
      case 'completed': return '#6bcf7f';
      default: return '#cccccc';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open - Needs Help';
      case 'in_progress': return 'In Progress - Your Task';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTargetDate = (dateString) => {
    if (!dateString) return null;
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isRequestAssignedToMe = (request) => {
    return request.status === 'in_progress' && request.student_id === user.id;
  };

  const getMyActiveTasks = () => {
    return requests.filter(request => 
      request.status === 'in_progress' && request.student_id === user.id
    );
  };

  const getMyCompletedTasks = () => {
    return requests.filter(request => 
      request.status === 'completed' && request.student_id === user.id
    );
  };

  return (
    <div className="student-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name} 👋</h1>
            <p>Your compassionate help makes a difference in our community</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowMyTasks(true)} 
              className="my-tasks-btn"
            >
              📋 My Tasks ({getMyActiveTasks().length})
            </button>
            <button 
              onClick={() => setShowProfile(true)} 
              className="profile-btn"
            >
              👤 View Profile
            </button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>{requests.filter(req => req.status === 'open').length}</h3>
            <p>Open Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-info">
            <h3>{getMyActiveTasks().length}</h3>
            <p>My Active Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{getMyCompletedTasks().length}</h3>
            <p>My Completed</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="content-header">
          <h2>Available Requests</h2>
          <button onClick={fetchRequests} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading requests...</p>
          </div>
        )}

        <div className="requests-grid">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="request-card"
              onClick={() => setSelectedRequest(req)}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                  <h3>{req.user_full_name}</h3>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(req.status) }}
                  >
                    {getStatusText(req.status)}
                  </div>
                  {isRequestAssignedToMe(req) && (
                    <div className="assigned-to-me-badge">
                      ✅ Assigned to you
                    </div>
                  )}
                </div>
              </div>

              {/* Request Title */}
              <div className="request-title">
                <h4>{req.title}</h4>
                <div className="request-dates">
                  <span className="request-date">
                    📅 Posted: {formatDate(req.created_at)}
                  </span>
                  {req.target_date && (
                    <span className="target-date">
                      🎯 Preferred: {req.target_date}
                    </span>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="request-details">
                <div className="detail-item">
                  <span className="detail-label">📞 User Phone:</span>
                  <span>{req.user_contact_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📞 Current Contact:</span>
                  <span>{req.current_contact_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📍 Address:</span>
                  <span>{req.address}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">📝 Details:</span>
                  <p>{req.details}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="request-actions">
                {req.status === 'open' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptRequest(req.id);
                    }}
                    disabled={updatingRequest === req.id}
                    className="accept-btn primary"
                  >
                    {updatingRequest === req.id ? (
                      <>
                        <div className="button-spinner"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        🤝 Accept Request
                      </>
                    )}
                  </button>
                )}
                
                {isRequestAssignedToMe(req) && (
                  <div className="assigned-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteRequest(req.id);
                      }}
                      disabled={updatingRequest === req.id}
                      className="complete-btn"
                    >
                      {updatingRequest === req.id ? (
                        <>
                          <div className="button-spinner"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          ✅ Mark Complete
                        </>
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassignRequest(req.id);
                      }}
                      disabled={updatingRequest === req.id}
                      className="unassign-btn"
                    >
                      {updatingRequest === req.id ? (
                        <>
                          <div className="button-spinner"></div>
                          Unassigning...
                        </>
                      ) : (
                        <>
                          ↩️ Unassign
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {req.status === 'completed' && (
                  <div className="completed-badge">
                    ✅ Request Completed
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="request-meta">
                <span>Request ID: #{req.id}</span>
                {req.student_id && (
                  <span>Assigned to: Student #{req.student_id}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isLoading && requests.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No Requests Available</h3>
            <p>There are no assistance requests at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn"
              onClick={() => setSelectedRequest(null)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <div className="modal-avatar-section">
                <div className="senior-avatar-large">👤</div>
                <div className="modal-title-section">
                  <h2>{selectedRequest.user_full_name}</h2>
                  <div className="modal-request-dates">
                    <p>Request posted: {formatDate(selectedRequest.created_at)}</p>
                    {selectedRequest.target_date && (
                      <p className="modal-target-date">
                        🎯 Preferred Date: {selectedRequest.target_date}
                      </p>
                    )}
                  </div>
                  <div 
                    className="modal-urgency-badge"
                    style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                  >
                    {getStatusText(selectedRequest.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-section">
                  <h3>📞 Contact Information</h3>
                  <div className="contact-info">
                    <p><strong>Phone:</strong> {selectedRequest.user_contact_number}</p>
                    <p><strong>Current Contact:</strong> {selectedRequest.current_contact_number}</p>
                    <p><strong>Address:</strong> {selectedRequest.address}</p>
                  </div>
                </div>

                <div className="modal-section full-width">
                  <h3>💫 Assistance Request</h3>
                  <div className="current-request-modal">
                    <strong>{selectedRequest.title}</strong>
                    <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                      {selectedRequest.details}
                    </p>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>📊 Request Details</h3>
                  <div className="history-stats">
                    <div className="history-item">
                      <span className="history-label">Request ID</span>
                      <span className="history-value">#{selectedRequest.id}</span>
                    </div>
                    <div className="history-item">
                      <span className="history-label">Status</span>
                      <span className="history-value">{getStatusText(selectedRequest.status)}</span>
                    </div>
                    <div className="history-item">
                      <span className="history-label">Posted</span>
                      <span className="history-value">{formatDate(selectedRequest.created_at)}</span>
                    </div>
                    {selectedRequest.target_date && (
                      <div className="history-item">
                        <span className="history-label">Preferred Date</span>
                        <span className="history-value">{target_date}</span>
                      </div>
                    )}
                    {selectedRequest.student_id && (
                      <div className="history-item">
                        <span className="history-label">Assigned Student ID</span>
                        <span className="history-value">#{selectedRequest.student_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedRequest.status === 'open' && (
                <button 
                  className="primary-action-btn"
                  onClick={() => handleAcceptRequest(selectedRequest.id)}
                >
                  <span className="action-icon">🤝</span>
                  Help {selectedRequest.user_full_name.split(' ')[0]}
                </button>
              )}
              
              {isRequestAssignedToMe(selectedRequest) && (
                <>
                  <button 
                    className="complete-action-btn"
                    onClick={() => handleCompleteRequest(selectedRequest.id)}
                  >
                    <span className="action-icon">✅</span>
                    Mark as Completed
                  </button>
                  <button 
                    className="unassign-action-btn"
                    onClick={() => handleUnassignRequest(selectedRequest.id)}
                  >
                    <span className="action-icon">↩️</span>
                    Unassign from Request
                  </button>
                </>
              )}
              
              <button 
                className="secondary-action-btn"
                onClick={() => setSelectedRequest(null)}
              >
                Browse More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <div className="profile-avatar">
                {user?.avatar || '🎓'}
              </div>
              <h2>Your Profile</h2>
              <p>Student Account Information</p>
            </div>

            <div className="profile-details">
              <div className="profile-section">
                <h3>👤 Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Full Name:</strong>
                    <span>{user?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{user?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong>
                    <span>{user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>User Type:</strong>
                    <span className="user-type-badge">
                      {user?.user_type === 'student' ? '🎓 Student' : '👤 User'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>User ID:</strong>
                    <span>#{user?.id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>📍 Address Information</h3>
                <div className="detail-item full-width">
                  <strong>Address:</strong>
                  <span>{user?.address || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>📊 Your Activity</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Active Tasks:</strong>
                    <span>{getMyActiveTasks().length}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Completed Tasks:</strong>
                    <span>{getMyCompletedTasks().length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="primary-btn"
                onClick={() => {
                  alert('Edit profile functionality would go here!');
                }}
              >
                ✏️ Edit Profile
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setShowProfile(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Tasks Modal */}
      {showMyTasks && (
        <div className="modal-overlay" onClick={() => setShowMyTasks(false)}>
          <div className="modal-content tasks-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn"
              onClick={() => setShowMyTasks(false)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <div className="tasks-avatar">📋</div>
              <h2>My Assistance Tasks</h2>
              <p>Track and manage your community support activities</p>
            </div>

            <div className="tasks-content">
              {/* Active Tasks Section */}
              <section className="tasks-section">
                <h3>🔄 My Active Tasks ({getMyActiveTasks().length})</h3>
                
                {getMyActiveTasks().length === 0 ? (
                  <div className="empty-tasks">
                    <div className="empty-icon">📭</div>
                    <h4>No Active Tasks</h4>
                    <p>You don't have any active assistance tasks yet.</p>
                    <button 
                      onClick={() => setShowMyTasks(false)}
                      className="find-tasks-btn"
                    >
                      Find Requests to Help
                    </button>
                  </div>
                ) : (
                  <div className="tasks-list">
                    {getMyActiveTasks().map((task) => (
                      <div key={task.id} className="task-item active">
                        <div className="task-header">
                          <div className="senior-avatar-small">👤</div>
                          <div className="task-info">
                            <h4>{task.user_full_name}</h4>
                            <p className="task-title">{task.title}</p>
                            <div className="task-dates">
                              <p className="task-date">
                                📅 Accepted: {formatDate(task.created_at)}
                              </p>
                              {task.target_date && (
                                <p className="task-target-date">
                                  🎯 Preferred: {task.target_date}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="task-details">
                          <div className="task-detail">
                            <span className="detail-label">📍</span>
                            <span>{task.address}</span>
                          </div>
                          <div className="task-detail">
                            <span className="detail-label">📞</span>
                            <span>{task.user_contact_number}</span>
                          </div>
                        </div>

                        <div className="task-actions">
                          <button 
                            onClick={() => handleCompleteRequest(task.id)}
                            disabled={updatingRequest === task.id}
                            className="complete-task-btn"
                          >
                            {updatingRequest === task.id ? (
                              <>
                                <div className="button-spinner-small"></div>
                                Completing...
                              </>
                            ) : (
                              <>
                                ✅ Mark as Completed
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handleUnassignRequest(task.id)}
                            disabled={updatingRequest === task.id}
                            className="unassign-task-btn"
                          >
                            ↩️ Unassign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Completed Tasks Section */}
              <section className="tasks-section">
                <h3>✅ My Completed Tasks ({getMyCompletedTasks().length})</h3>
                
                {getMyCompletedTasks().length === 0 ? (
                  <div className="empty-tasks">
                    <div className="empty-icon">🎯</div>
                    <h4>No Completed Tasks Yet</h4>
                    <p>Your completed assistance tasks will appear here.</p>
                  </div>
                ) : (
                  <div className="tasks-list">
                    {getMyCompletedTasks().map((task) => (
                      <div key={task.id} className="task-item completed">
                        <div className="task-header">
                          <div className="senior-avatar-small">👤</div>
                          <div className="task-info">
                            <h4>{task.user_full_name}</h4>
                            <p className="task-title">{task.title}</p>
                            <div className="task-dates">
                              <p className="task-date completed-date">
                                ✅ Completed
                              </p>
                              {task.target_date && (
                                <p className="task-target-date">
                                  🎯 Was Preferred: {task.target_date}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="task-details">
                          <div className="task-detail">
                            <span className="detail-label">📍</span>
                            <span>{task.address}</span>
                          </div>
                          <div className="completion-message">
                            Thank you for your help! 🎉
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="modal-actions">
              <button 
                className="secondary-btn"
                onClick={() => setShowMyTasks(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;