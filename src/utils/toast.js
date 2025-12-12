let toastListeners = [];

export const addToastListener = (listener) => {
  toastListeners.push(listener);
};

export const removeToastListener = (listener) => {
  toastListeners = toastListeners.filter(l => l !== listener);
};

const notifyListeners = (toast) => {
  toastListeners.forEach(listener => listener(toast));
};

export const toast = {
  success: (message, duration = 3000) => {
    notifyListeners({
      id: Date.now(),
      message,
      type: 'success',
      duration,
    });
  },
  
  error: (message, duration = 4000) => {
    notifyListeners({
      id: Date.now(),
      message,
      type: 'error',
      duration,
    });
  },
  
  warning: (message, duration = 3500) => {
    notifyListeners({
      id: Date.now(),
      message,
      type: 'warning',
      duration,
    });
  },
  
  info: (message, duration = 3000) => {
    notifyListeners({
      id: Date.now(),
      message,
      type: 'info',
      duration,
    });
  },
};