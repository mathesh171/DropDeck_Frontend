import { useEffect } from 'react';

export const useKeyboard = (handlers = {}, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      const shortcut = [
        cmdOrCtrl && 'ctrl',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        key
      ].filter(Boolean).join('+');

      if (handlers[shortcut]) {
        e.preventDefault();
        handlers[shortcut](e);
      } else if (handlers[key]) {
        handlers[key](e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};

export const useEscape = (callback) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [callback]);
};

export const useFocusTrap = (ref, isActive) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isActive, ref]);
};