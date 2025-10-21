import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, hasToken } from '../utils/auth';

const PublicRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({
    loading: true,
    authenticated: false
  });

  useEffect(() => {
    // Quick check first
    if (!hasToken()) {
      setAuthStatus({ loading: false, authenticated: false });
      return;
    }

    // Then verify with backend
    const verifyAuth = async () => {
      const isAuth = await isAuthenticated();
      setAuthStatus({ loading: false, authenticated: isAuth });
    };

    verifyAuth();
  }, []);

  if (authStatus.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return !authStatus.authenticated ? children : <Navigate to="/chat" replace />;
};

export default PublicRoute;
