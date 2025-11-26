import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, hasToken } from '../utils/auth';

const PrivateRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    if (!hasToken()) {
      setAuthStatus({ loading: false, authenticated: false });
      return;
    }
    const verify = async () => {
      const ok = await isAuthenticated();
      setAuthStatus({ loading: false, authenticated: ok });
    };
    verify();
  }, [localStorage.getItem('token')]);

  if (authStatus.loading) {
    return <div>Loading...</div>;
  }

  return authStatus.authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
