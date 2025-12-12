import { useState, useEffect } from 'react';
import styles from './ThemeCustomizer.module.css';
import ColorPicker from '../ColorPicker/ColorPicker';
import { useTheme } from '../../context/ThemeContext';

const ThemeCustomizer = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('#6fa8c4');
  const [chatBackground, setChatBackground] = useState('default');

  const backgroundOptions = [
    { id: 'default', name: 'Default', preview: '#efeae2' },
    { id: 'light', name: 'Light', preview: '#f5f5f5' },
    { id: 'dark', name: 'Dark', preview: '#1e1e1e' },
    { id: 'blue', name: 'Blue', preview: '#e3f2fd' },
    { id: 'green', name: 'Green', preview: '#e8f5e9' },
    { id: 'purple', name: 'Purple', preview: '#f3e5f5' },
  ];

  const themePresets = [
    { name: 'Ocean', color: '#6fa8c4' },
    { name: 'Sky', color: '#4a90e2' },
    { name: 'Violet', color: '#5856d6' },
    { name: 'Pink', color: '#ff2d55' },
    { name: 'Orange', color: '#ff9500' },
    { name: 'Green', color: '#34c759' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('accentColor');
    if (saved) setAccentColor(saved);

    const savedBg = localStorage.getItem('chatBackground');
    if (savedBg) setChatBackground(savedBg);
  }, []);

  const handleAccentColorChange = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
    document.documentElement.style.setProperty('--color-primary', color);

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const lighterColor = `rgb(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)})`;
    document.documentElement.style.setProperty('--color-primaryLight', lighterColor);
  };

  const handleBackgroundChange = (bgId) => {
    setChatBackground(bgId);
    localStorage.setItem('chatBackground', bgId);

    const bgColors = {
      default: '#efeae2',
      light: '#f5f5f5',
      dark: '#1e1e1e',
      blue: '#e3f2fd',
      green: '#e8f5e9',
      purple: '#f3e5f5',
    };

    document.documentElement.style.setProperty('--color-chatBackground', bgColors[bgId]);
  };

  const handlePresetClick = (preset) => {
    handleAccentColorChange(preset.color);
  };

  const handleReset = () => {
    handleAccentColorChange('#6fa8c4');
    handleBackgroundChange('default');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.customizer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🎨 Customize Theme</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Theme Mode</h3>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeButton} ${!isDark ? styles.active : ''}`}
                onClick={() => isDark && toggleTheme()}
              >
                ☀️ Light
              </button>
              <button
                className={`${styles.modeButton} ${isDark ? styles.active : ''}`}
                onClick={() => !isDark && toggleTheme()}
              >
                🌙 Dark
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Theme Presets</h3>
            <div className={styles.presets}>
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  className={`${styles.preset} ${accentColor === preset.color ? styles.activePreset : ''}`}
                  onClick={() => handlePresetClick(preset)}
                  style={{ backgroundColor: preset.color }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Accent Color</h3>
            <ColorPicker
              color={accentColor}
              onChange={handleAccentColorChange}
              label="Choose your accent color"
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Chat Background</h3>
            <div className={styles.backgrounds}>
              {backgroundOptions.map((bg) => (
                <button
                  key={bg.id}
                  className={`${styles.background} ${chatBackground === bg.id ? styles.activeBackground : ''}`}
                  onClick={() => handleBackgroundChange(bg.id)}
                >
                  <div className={styles.bgPreview} style={{ backgroundColor: bg.preview }} />
                  <span className={styles.bgName}>{bg.name}</span>
                  {chatBackground === bg.id && <span className={styles.checkmark}>✓</span>}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.actions}>
            <button className={styles.resetButton} onClick={handleReset}>
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;