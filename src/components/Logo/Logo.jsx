import React from 'react';
import styles from './Logo.module.css';

const Logo = () => {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoCircle}>
        <div className={styles.logoText}>
          <span className={styles.logoInitial}>D</span>
        </div>
      </div>
      <h1 className={styles.title}>DropDeck</h1>
    </div>
  );
};

export default Logo;
