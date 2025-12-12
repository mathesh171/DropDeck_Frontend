const isHapticsSupported = () => {
  return 'vibrate' in navigator;
};

const vibrate = (pattern) => {
  if (isHapticsSupported()) {
    navigator.vibrate(pattern);
  }
};

export const haptics = {
  light: () => vibrate(10),
  
  medium: () => vibrate(20),
  
  heavy: () => vibrate(30),
  
  success: () => vibrate([10, 50, 10]),
  
  error: () => vibrate([20, 100, 20, 100, 20]),
  
  warning: () => vibrate([15, 70, 15]),
  
  selection: () => vibrate(5),
  
  impact: () => vibrate(15),
  
  notification: () => vibrate([10, 50, 10, 50, 10]),
  
  isSupported: isHapticsSupported
};