import styles from './EmptyState.module.css';

const EmptyState = ({ 
  icon = '📭', 
  title = 'Nothing here', 
  description = '',
  action,
  actionLabel
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && actionLabel && (
        <button className={styles.action} onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;