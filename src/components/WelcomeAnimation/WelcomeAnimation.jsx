import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './WelcomeAnimation.module.css';

const WelcomeAnimation = ({ show, onComplete, userName = 'there' }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onComplete && onComplete(), 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.logoAnimation}>
          <span className={styles.logo}>💬</span>
        </div>
        <h1 className={styles.title}>Welcome to DropDeck!</h1>
        <p className={styles.subtitle}>Hey {userName}, let's get chatting</p>
        <div className={styles.dots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomeAnimation;