import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import Login from '../components/Login/Login';
import SignUp from '../components/SignUp/SignUp';
import styles from '../pageStyles/LoginPage.module.css';
// import graduationImage from '../assets/graduation.jpg'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async ({ email, password }) => {
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          username: data.user?.name || data.name || 'User',  
          email: data.user?.email || data.email || email,
          id: data.user?.user_id || data.id || Date.now(),
          token: data.token,
          loginTime: new Date().toISOString(),
        };

        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        
        // Navigate to dashboard
        navigate('/chat');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async ({ username, email, password, confirmPassword }) => {
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Please create a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          name: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          username: username.trim(),
          email: email.trim(),
          id: data.id || Date.now(),
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        navigate('/chat');  
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      console.error(err);
      setError('Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageSection}>
        {/* <img 
          src={graduationImage} 
          alt="Graduation celebration" 
          className={styles.backgroundImage}
        /> */}
      </div>

      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <Logo />
          
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

          <div className={styles.footer}>
            <a href="#compatibility" className={styles.footerLink}>
              System Compatibility Check?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
