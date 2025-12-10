import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import Login from '../components/Login/Login';
import SignUp from '../components/SignUp/SignUp';
import styles from '../pageStyles/LoginPage.module.css';
import LoginPageHandle from '../assets/Logo/LoginPage_handle.png';
import { API_LINK } from '../utils/config.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const safeParseJson = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const handleLoginSubmit = async (email, password) => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_LINK}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (!response.ok) {
        if (response.status === 429) {
          setError('Too many attempts. Please wait a moment and try again.');
          return;
        }
        const data = await safeParseJson(response);
        setError(data.error || data.message || 'Login failed.');
        return;
      }
      const data = await response.json();
      const userData = {
        username: data.user?.name || data.name || 'User',
        email: data.user?.email || data.email || email,
        id: data.user?.userid || data.id || Date.now(),
        token: data.token,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      navigate('/chat');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (username, email, password, confirmPassword) => {
    setError('');
    if (!username.trim()) setError('Please enter a username');
    else if (!email.trim()) setError('Please enter your email');
    else if (!validateEmail(email)) setError('Please enter a valid email address');
    else if (!password.trim()) setError('Please create a password');
    else if (password.length < 6) setError('Password must be at least 6 characters');
    else if (!confirmPassword.trim()) setError('Please confirm your password');
    else if (password !== confirmPassword) setError('Passwords do not match');
    else {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_LINK}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: username.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });
        if (!response.ok) {
          const data = await safeParseJson(response);
          setError(data.error || data.message || 'Sign up failed');
          return;
        }
        const data = await response.json();
        const userData = {
          username: username.trim(),
          email: email.trim(),
          id: data.user?.userid || data.id || Date.now(),
          token: data.token,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        navigate('/chat');
      } catch (err) {
        console.error(err);
        setError('Sign up failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <img
            src={LoginPageHandle}
            alt="DropDeck login"
            className={styles.backgroundImage}
          />
        </div>

        <div className={styles.formSection}>
          <div className={styles.formContent}>
            <Logo size={50} />

            {isLoginMode ? (
              <>
                <Login
                  onSubmit={handleLoginSubmit}
                  error={error}
                  isLoading={isLoading}
                />
                <div className={styles.switchMode}>
                  <span className={styles.switchText}>Don't have an account? </span>
                  <button
                    onClick={() => {
                      setIsLoginMode(false);
                      setError('');
                    }}
                    className={styles.switchButton}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            ) : (
              <>
                <SignUp
                  onSubmit={handleSignUpSubmit}
                  error={error}
                  isLoading={isLoading}
                />
                <div className={styles.switchMode}>
                  <span className={styles.switchText}>Already have an account? </span>
                  <button
                    onClick={() => {
                      setIsLoginMode(true);
                      setError('');
                    }}
                    className={styles.switchButton}
                  >
                    Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
