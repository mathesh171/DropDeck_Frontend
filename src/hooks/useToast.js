import { useState, useCallback } from 'react';
import { addToastListener, removeToastListener } from '../utils/toast';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useState(() => {
    addToastListener(addToast);
    return () => removeToastListener(addToast);
  }, [addToast]);

  return { toasts, removeToast };
};