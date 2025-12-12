export const lightTheme = {
  colors: {
    primary: '#6fa8c4',
    primaryHover: '#5a8ba3',
    primaryLight: '#89c4e0',
    secondary: '#4a90e2',
    secondaryHover: '#357abd',
    
    background: '#f0f2f5',
    surface: '#ffffff',
    surfaceHover: '#f5f6f6',
    
    text: '#111111',
    textSecondary: '#667781',
    textTertiary: '#8696a0',
    
    border: '#e0e0e0',
    borderLight: '#f0f2f5',
    
    success: '#25d366',
    error: '#d32f2f',
    warning: '#ff9800',
    info: '#2196f3',
    
    messageBubbleOwn: '#d9fdd3',
    messageBubbleOther: '#ffffff',
    
    chatBackground: '#efeae2',
    
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowMedium: 'rgba(0, 0, 0, 0.15)',
    shadowHeavy: 'rgba(0, 0, 0, 0.2)',
    
    overlay: 'rgba(0, 0, 0, 0.5)',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBlur: 'blur(10px)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.12)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.15)',
  },
};

export const darkTheme = {
  colors: {
    primary: '#5a8ba3',
    primaryHover: '#6fa8c4',
    primaryLight: '#4a7a8f',
    secondary: '#357abd',
    secondaryHover: '#4a90e2',
    
    background: '#0b141a',
    surface: '#1e2a32',
    surfaceHover: '#2a3942',
    
    text: '#e9edef',
    textSecondary: '#8696a0',
    textTertiary: '#667781',
    
    border: '#2a3942',
    borderLight: '#1e2a32',
    
    success: '#25d366',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    
    messageBubbleOwn: '#005c4b',
    messageBubbleOther: '#1e2a32',
    
    chatBackground: '#0b141a',
    
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowHeavy: 'rgba(0, 0, 0, 0.5)',
    
    overlay: 'rgba(0, 0, 0, 0.7)',
    glassBg: 'rgba(30, 42, 50, 0.7)',
    glassBlur: 'blur(10px)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 2px 4px rgba(0, 0, 0, 0.3)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.4)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  Object.entries(theme.transitions).forEach(([key, value]) => {
    root.style.setProperty(`--transition-${key}`, value);
  });
  
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
};