import React, { useState, useEffect } from 'react';
import traffic_lights_img1 from '../../assets/captcha/traffic_lights/photo-1557409518-691ebcd96038.jpeg';
import traffic_lights_img2 from '../../assets/captcha/traffic_lights/photo-1555664424-778a1e5e1b48.jpeg';
import traffic_lights_img3 from '../../assets/captcha/traffic_lights/photo-1592838064575-70ed626d3a0e.jpeg';
import cars_img1 from '../../assets/captcha/cars/photo-1552519507-da3b142c6e3d.jpeg';
import cars_img2 from '../../assets/captcha/cars/photo-1494976388531-d1058494cdd8.jpeg';
import cars_img3 from '../../assets/captcha/cars/photo-1583121274602-3e2820c69888.jpeg';
import bicycles_img1 from '../../assets/captcha/bicycles/photo-1485965120184-e220f721d03e.jpeg';
import bicycles_img2 from '../../assets/captcha/bicycles/photo-1532298229144-0ec0c57515c7.jpeg';
import bicycles_img3 from '../../assets/captcha/bicycles/photo-1571333250630-f0230c320b6d.jpeg';
import buses_img1 from '../../assets/captcha/buses/photo-1544620347-c4fd4a3d5957.jpeg';
import buses_img2 from '../../assets/captcha/buses/photo-1557223562-6c77ef16210f.jpeg';
import buses_img3 from '../../assets/captcha/buses/photo-1570125909232-eb263c188f7e.jpeg';
import distractorImages_img1 from '../../assets/captcha/distractorImages/photo-1425082661705-1834bfd09dca.jpeg';
import distractorImages_img2 from '../../assets/captcha/distractorImages/photo-1441974231531-c6227db76b6e.jpeg';
import distractorImages_img3 from '../../assets/captcha/distractorImages/photo-1469474968028-56623f02e42e.jpeg';
import distractorImages_img4 from '../../assets/captcha/distractorImages/photo-1472214103451-9374bd1c798e.jpeg';
import distractorImages_img5 from '../../assets/captcha/distractorImages/photo-1506905925346-21bda4d32df4.jpeg';
import distractorImages_img6 from '../../assets/captcha/distractorImages/photo-1518791841217-8f162f1e1131.jpeg';

import styles from './Login.module.css';

// Image CAPTCHA Component
const ImageCaptcha = ({ onVerify }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const imageCategories = {
    traffic_lights: [
      traffic_lights_img1,
      traffic_lights_img2,
      traffic_lights_img3,
    ],
    cars: [
      cars_img1,
      cars_img2,
      cars_img3,
    ],
    bicycles: [
      bicycles_img1,
      bicycles_img2,
      bicycles_img3,
    ],
    buses: [
      buses_img1,
      buses_img2,
      buses_img3,
    ],
  };

  const distractorImages = [
    distractorImages_img1,
    distractorImages_img2,
    distractorImages_img3,
    distractorImages_img4,
    distractorImages_img5,
    distractorImages_img6,
  ];

  const generateCaptcha = () => {
    const categories = Object.keys(imageCategories);
    const targetCategory = categories[Math.floor(Math.random() * categories.length)];
    const targetImages = imageCategories[targetCategory];
    
    const numTargets = Math.floor(Math.random() * 2) + 2;
    const selectedTargets = [];
    const usedIndices = new Set();
    
    while (selectedTargets.length < numTargets) {
      const idx = Math.floor(Math.random() * targetImages.length);
      if (!usedIndices.has(idx)) {
        selectedTargets.push({ url: targetImages[idx], isTarget: true, id: `target-${idx}` });
        usedIndices.add(idx);
      }
    }
    
    const numDistractors = 9 - numTargets;
    const selectedDistractors = [];
    const usedDistractorIndices = new Set();
    
    while (selectedDistractors.length < numDistractors) {
      const idx = Math.floor(Math.random() * distractorImages.length);
      if (!usedDistractorIndices.has(idx)) {
        selectedDistractors.push({ url: distractorImages[idx], isTarget: false, id: `distractor-${idx}` });
        usedDistractorIndices.add(idx);
      }
    }
    
    const allImages = [...selectedTargets, ...selectedDistractors];
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }
    
    setCaptchaData({
      category: targetCategory,
      images: allImages,
      correctIndices: allImages.map((img, idx) => img.isTarget ? idx : -1).filter(idx => idx !== -1),
    });
    setSelectedImages([]);
    setVerificationStatus(null);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleImageClick = (index) => {
    if (verificationStatus) return;
    
    setSelectedImages(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleVerify = () => {
    const correct = selectedImages.length === captchaData.correctIndices.length &&
                   selectedImages.every(idx => captchaData.correctIndices.includes(idx));
    
    if (correct) {
      setVerificationStatus('success');
      onVerify(true);
    } else {
      setVerificationStatus('error');
      onVerify(false);
      setTimeout(() => {
        generateCaptcha();
      }, 1500);
    }
  };

  if (!captchaData) return null;

  const categoryNames = {
    traffic_lights: 'traffic lights',
    cars: 'cars',
    bicycles: 'bicycles',
    buses: 'buses',
  };

  return (
    <div className={styles.captchaContainer}>
      <div className={styles.captchaHeader}>
        <span className={styles.captchaTitle}>Verify you're human</span>
        <button
          type="button"
          onClick={generateCaptcha}
          className={styles.refreshButton}
        >
          ↻ Refresh
        </button>
      </div>
      
      <div className={styles.captchaInstruction}>
        Select all images with <strong>{categoryNames[captchaData.category]}</strong>
      </div>
      
      <div className={styles.captchaGrid}>
        {captchaData.images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => handleImageClick(index)}
            className={`${styles.imageBox} ${selectedImages.includes(index) ? styles.imageBoxSelected : ''}`}
          >
            <img src={image.url} alt="" className={styles.captchaImage} />
            {selectedImages.includes(index) && (
              <div className={styles.checkmark}>✓</div>
            )}
          </div>
        ))}
      </div>
      
      {!verificationStatus && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={selectedImages.length === 0}
          className={styles.verifyButton}
        >
          Verify
        </button>
      )}
      
      {verificationStatus === 'success' && (
        <div className={styles.statusSuccess}>
          ✓ Verification successful!
        </div>
      )}
      
      {verificationStatus === 'error' && (
        <div className={styles.statusError}>
          ✗ Incorrect selection. Please try again.
        </div>
      )}
    </div>
  );
};

// Main Login Component
const Login = ({ onSubmit, error, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!captchaVerified) {
      setCaptchaError('Please complete the CAPTCHA verification');
      return;
    }
    
    setCaptchaError('');
    onSubmit({ email, password });
  };

  const handleCaptchaVerify = (isVerified) => {
    setCaptchaVerified(isVerified);
    if (isVerified) {
      setCaptchaError('');
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
        
        <ImageCaptcha onVerify={handleCaptchaVerify} />
        
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