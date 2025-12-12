import styles from './ProgressBar.module.css';

const ProgressBar = ({ 
  progress = 0, 
  variant = 'linear',
  size = 'medium',
  showLabel = false,
  label = '',
  color = 'primary'
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  if (variant === 'circular') {
    const radius = size === 'small' ? 20 : size === 'large' ? 30 : 25;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeProgress / 100) * circumference;

    return (
      <div className={`${styles.circularContainer} ${styles[size]}`}>
        <svg className={styles.circularSvg} width={radius * 2 + 10} height={radius * 2 + 10}>
          <circle
            className={styles.circularTrack}
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
          />
          <circle
            className={`${styles.circularProgress} ${styles[color]}`}
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset
            }}
          />
        </svg>
        {showLabel && (
          <span className={styles.circularLabel}>{Math.round(safeProgress)}%</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.linearContainer} ${styles[size]}`}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.linearTrack}>
        <div
          className={`${styles.linearProgress} ${styles[color]}`}
          style={{ width: `${safeProgress}%` }}
        >
          {showLabel && (
            <span className={styles.linearLabel}>{Math.round(safeProgress)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;