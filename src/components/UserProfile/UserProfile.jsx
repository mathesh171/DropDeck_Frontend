import { useState } from 'react';
import styles from './UserProfile.module.css';

const UserProfile = ({ user, onUpdate, onClose, onLogout }) => {
  const [editMode, setEditMode] = useState({ name: false, email: false, password: false });
  const [form, setForm] = useState({ name: user?.name, email: user?.email, password: '' });

  const handleEdit = (field) => setEditMode((prev) => ({ ...prev, [field]: true }));
  const handleCancel = (field) => setEditMode((prev) => ({ ...prev, [field]: false }));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    if (onUpdate) onUpdate(form);
  };

  return (
    <div className={styles.profileOverlay}>
      <div className={styles.profileCard}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <div className={styles.fieldGroup}>
          <label>Name:</label>
          {editMode.name ? (
            <>
              <input name="name" value={form.name} onChange={handleChange} className={styles.input} />
              <button className={styles.saveButton} onClick={() => handleSubmit('name')}>Save</button>
              <button className={styles.cancelButton} onClick={() => handleCancel('name')}>Cancel</button>
            </>
          ) : (
            <>
              <span className={styles.value}>{form.name}</span>
              <button className={styles.editButton} onClick={() => handleEdit('name')}>Edit</button>
            </>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label>Email:</label>
          {editMode.email ? (
            <>
              <input name="email" value={form.email} onChange={handleChange} className={styles.input} />
              <button className={styles.saveButton} onClick={() => handleSubmit('email')}>Save</button>
              <button className={styles.cancelButton} onClick={() => handleCancel('email')}>Cancel</button>
            </>
          ) : (
            <>
              <span className={styles.value}>{form.email}</span>
              <button className={styles.editButton} onClick={() => handleEdit('email')}>Edit</button>
            </>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label>Password:</label>
          {editMode.password ? (
            <>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={styles.input} />
              <button className={styles.saveButton} onClick={() => handleSubmit('password')}>Save</button>
              <button className={styles.cancelButton} onClick={() => handleCancel('password')}>Cancel</button>
            </>
          ) : (
            <>
              <span className={styles.value}>••••••••</span>
              <button className={styles.editButton} onClick={() => handleEdit('password')}>Edit</button>
            </>
          )}
        </div>

        <button className={styles.logoutButton} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
