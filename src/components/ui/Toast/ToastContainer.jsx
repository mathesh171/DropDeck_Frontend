import { createPortal } from 'react-dom';
import Toast from './Toast';
import styles from './ToastContainer.module.css';

const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className={styles.container}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;