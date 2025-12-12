import styles from './PullToRefreshIndicator.module.css';

const PullToRefreshIndicator = ({ pullDistance, isRefreshing, threshold }) => {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div 
      className={styles.indicator}
      style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}
    >
      <div className={styles.spinner}>
        {isRefreshing ? (
          <div className={styles.loading}></div>
        ) : (
          <div 
            className={styles.arrow}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              opacity: progress / 100
            }}
          >
            ↓
          </div>
        )}
      </div>
      <span className={styles.text}>
        {isRefreshing 
          ? 'Refreshing...' 
          : pullDistance >= threshold 
            ? 'Release to refresh' 
            : 'Pull to refresh'
        }
      </span>
    </div>
  );
};

export default PullToRefreshIndicator;