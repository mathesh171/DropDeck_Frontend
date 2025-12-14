import { useState, useCallback, useEffect } from 'react';
import { addToastListener, removeToastListener } from '../utils/toast';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const toastWithId = {
      ...toast,
      id: `toast-${Date.now()}-${++toastIdCounter}`
    };
    
    setToasts(prev => [...prev, toastWithId]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addToastListener(addToast);
    return () => removeToastListener(addToast);
  }, [addToast]);

  return { toasts, removeToast };
};
