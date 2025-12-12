import { useState } from 'react';
import styles from './ColorPicker.module.css';

const ColorPicker = ({ color, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  const presetColors = [
    '#6fa8c4',
    '#4a90e2',
    '#5856d6',
    '#af52de',
    '#ff2d55',
    '#ff3b30',
    '#ff9500',
    '#ffcc00',
    '#34c759',
    '#00c7be',
    '#30b0c7',
    '#32ade6',
  ];

  const handleColorClick = (selectedColor) => {
    onChange(selectedColor);
    setShowPicker(false);
  };

  return (
    <div className={styles.colorPicker}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.pickerContainer}>
        <button
          className={styles.colorButton}
          style={{ backgroundColor: color }}
          onClick={() => setShowPicker(!showPicker)}
          type="button"
        >
          <span className={styles.colorValue}>{color}</span>
        </button>

        {showPicker && (
          <div className={styles.pickerDropdown}>
            <div className={styles.presetColors}>
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={`${styles.presetColor} ${
                    color === presetColor ? styles.active : ''
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorClick(presetColor)}
                  type="button"
                >
                  {color === presetColor && <span className={styles.checkmark}>✓</span>}
                </button>
              ))}
            </div>

            <div className={styles.customColor}>
              <label className={styles.customLabel}>Custom Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className={styles.nativeColorInput}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;