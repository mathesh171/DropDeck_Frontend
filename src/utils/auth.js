export const isAuthenticated = async () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    if (!userData || !userData.token) return false;

    // Verify token with backend
    const response = await fetch('http://localhost:5000/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return true;
    } else {
      // Token is invalid, clear localStorage
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    localStorage.removeItem('user');
    return false;
  }
};

// Quick check without backend call (for initial render)
export const hasToken = () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return !!(userData && userData.token);
  } catch {
    return false;
  }
};