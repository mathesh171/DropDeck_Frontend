import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './UserProfile.module.css';
import AvatarCrop from '../AvatarCrop/AvatarCrop';
import Modal from '../ui/Model/Model';

const UserProfile = ({ user, onUpdate, onClose, onLogout }) => {
  const [editMode, setEditMode] = useState({ name: false, email: false, password: false, bio: false, status: false });
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    bio: user?.bio || '',
    status: user?.status || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar_url || null);

  const handleEdit = (field) => setEditMode((prev) => ({ ...prev, [field]: true }));
  
  const handleCancel = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    setForm((prev) => ({ ...prev, [field]: user?.[field] || '' }));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    if (onUpdate) onUpdate(form);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImageSrc(event.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewAvatar(url);
    setAvatarFile(blob);
    setShowCropModal(false);
    setTempImageSrc(null);

    if (onUpdate) {
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');
      onUpdate({ avatar: formData });
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageSrc(null);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return createPortal(
    <div className={styles.profileOverlay} onClick={onClose}>
      <div className={styles.profileCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {previewAvatar ? (
              <img src={previewAvatar} alt="Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{getInitials(form.name)}</div>
            )}
            <label className={styles.avatarUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.fileInput}
              />
              <span className={styles.uploadIcon}>📷</span>
            </label>
          </div>
          <h2 className={styles.userName}>{form.name}</h2>
          <p className={styles.userEmail}>{form.email}</p>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Status Message:</label>
          {editMode.status ? (
            <div className={styles.editContainer}>
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
                className={styles.input}
                placeholder="What's on your mind?"
                maxLength={100}
              />
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => handleSubmit('status')}>Save</button>
                <button className={styles.cancelButton} onClick={() => handleCancel('status')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>{form.status || 'Set your status...'}</span>
              <button className={styles.editButton} onClick={() => handleEdit('status')}>Edit</button>
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Bio:</label>
          {editMode.bio ? (
            <div className={styles.editContainer}>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
              />
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => handleSubmit('bio')}>Save</button>
                <button className={styles.cancelButton} onClick={() => handleCancel('bio')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>{form.bio || 'Add a bio...'}</span>
              <button className={styles.editButton} onClick={() => handleEdit('bio')}>Edit</button>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Name:</label>
          {editMode.name ? (
            <div className={styles.editContainer}>
              <input name="name" value={form.name} onChange={handleChange} className={styles.input} />
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => handleSubmit('name')}>Save</button>
                <button className={styles.cancelButton} onClick={() => handleCancel('name')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>{form.name}</span>
              <button className={styles.editButton} onClick={() => handleEdit('name')}>Edit</button>
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email:</label>
          {editMode.email ? (
            <div className={styles.editContainer}>
              <input name="email" value={form.email} onChange={handleChange} className={styles.input} />
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => handleSubmit('email')}>Save</button>
                <button className={styles.cancelButton} onClick={() => handleCancel('email')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>{form.email}</span>
              <button className={styles.editButton} onClick={() => handleEdit('email')}>Edit</button>
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Password:</label>
          {editMode.password ? (
            <div className={styles.editContainer}>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter new password"
              />
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => handleSubmit('password')}>Save</button>
                <button className={styles.cancelButton} onClick={() => handleCancel('password')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>••••••••</span>
              <button className={styles.editButton} onClick={() => handleEdit('password')}>Change</button>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <button className={styles.logoutButton} onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {showCropModal && (
        <Modal isOpen={showCropModal} onClose={handleCropCancel} title="Crop Avatar">
          <AvatarCrop
            imageSrc={tempImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        </Modal>
      )}
    </div>,
    document.body
  );
};

export default UserProfile;