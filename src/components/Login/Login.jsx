import React, { useState } from 'react';
import styles from './Login.module.css';
import captchaFiles from './CaptchaFile.jsx';

const getRandomCaptcha = () => {
  const index = Math.floor(Math.random() * captchaFiles.length);
  const filename = captchaFiles[index];
  const text = filename.replace(/\.[^/.]+$/, '');
  const src = `/captcha/${filename}`;
  return { src, text };
};

const Login = ({ onSubmit, error, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(true);
  const [captchaError, setCaptchaError] = useState('');
  const [captcha, setCaptcha] = useState(() => getRandomCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      setCaptchaError('Please complete the CAPTCHA verification');
      return;
    }
    setCaptchaError('');
    onSubmit({ email, password });
  };

  const reloadCaptcha = () => {
    const next = getRandomCaptcha();
    setCaptcha(next);
    setCaptchaInput('');
    setCaptchaVerified(false);
  };

  const handleCaptchaChange = (value) => {
    setCaptchaInput(value);
    if (value === captcha.text) {
      setCaptchaVerified(true);
      setCaptchaError('');
    } else {
      setCaptchaVerified(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sign In</h2>
        <p className={styles.subtitle}>The key to happiness is to sign in.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <div className={styles.options}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Show Password</span>
          </label>
          <a href="#forgot" className={styles.forgotLink}>Forgot Password?</a>
        </div>

        <div className={styles.textCaptchaContainer}>
          <div className={styles.textCaptchaImageRow}>
            <img
              src={captcha.src}
              alt="CAPTCHA"
              className={styles.textCaptchaImage}
            />
            <button
              type="button"
              className={styles.textCaptchaReload}
              onClick={reloadCaptcha}
            >
              ↻
            </button>
          </div>
          <input
            type="text"
            className={styles.textCaptchaInput}
            placeholder="Type the text shown above (case sensitive)"
            value={captchaInput}
            onChange={(e) => handleCaptchaChange(e.target.value)}
          />
        </div>

        {captchaError && <div className={styles.error}>{captchaError}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
