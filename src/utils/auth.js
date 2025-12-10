import { API_LINK } from '../config.js';

export const isAuthenticated = async () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  try {
    const userData = JSON.parse(user);
    if (!userData || !userData.token) return false;
    const response = await fetch(`${API_LINK}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) return true;
    else {
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    localStorage.removeItem('user');
    return false;
  }
};

export const hasToken = () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  try {
    const userData = JSON.parse(user);
    return !!userData && userData.token;
  } catch {
    return false;
  }
};
