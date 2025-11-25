import React from 'react';
import styles from './Logo.module.css';
import LogoImg from '../../assets/Logo/Logo-removebg.png';

const Logo = ({ size = 50 }) => {
  return (
    <div className={styles.logoContainer}>
      <div
        className={styles.logoCircle}
        style={{ width: size, height: size }}
      >
        <img
          src={LogoImg}
          alt="DropDeck logo"
          className={styles.logoImage}
        />
      </div>

      <h1 className={styles.wordmark}>
        <span className={styles.drop}>Drop</span>
        <span className={styles.deck}>Deck</span>
      </h1>
    </div>
  );
};

export default Logo;
