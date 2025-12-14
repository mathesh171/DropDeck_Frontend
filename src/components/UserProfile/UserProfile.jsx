import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import styles from './UserProfile.module.css';
import AvatarCrop from '../AvatarCrop/AvatarCrop';
import Modal from '../ui/Model/Model';
import { API_LINK } from '../../config.js';
import EditIcon from '../../assets/Edit.png';
import TickIcon from '../../assets/tick.png';
import CrossIcon from '../../assets/cross.png';

const UserProfile = ({ user, onUpdate, onClose, onLogout }) => {
  const [editMode, setEditMode] = useState({ name: false, bio: false, password: false });
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar_url || null);
  const [nameAvailable, setNameAvailable] = useState(null);
  const [nameChecking, setNameChecking] = useState(false);
  const [passwordStep, setPasswordStep] = useState('method');
  const [passwordMethod, setPasswordMethod] = useState('oldPassword');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const checkName = async () => {
      if (!editMode.name || !form.name || form.name === user?.name) {
        setNameAvailable(null);
        return;
      }

      if (form.name.length < 3) {
        setNameAvailable(false);
        return;
      }

      setNameChecking(true);
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`${API_LINK}/api/auth/check-username?username=${encodeURIComponent(form.name)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setNameAvailable(data.available);
      } catch (error) {
        console.error('Username check error:', error);
      } finally {
        setNameChecking(false);
      }
    };

    const debounce = setTimeout(checkName, 300);
    return () => clearTimeout(debounce);
  }, [form.name, editMode.name, user?.name]);

  const handleEdit = (field) => {
    if (field === 'password') {
      setEditMode((prev) => ({ ...prev, [field]: true }));
      setPasswordStep('method');
      setPasswordMethod('oldPassword');
      setPasswordForm({ oldPassword: '', otp: ['', '', '', '', '', ''], newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setOtpSent(false);
    } else {
      setEditMode((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleCancel = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: false }));
    if (field === 'name') {
      setForm((prev) => ({ ...prev, name: user?.name || '' }));
      setNameAvailable(null);
    } else if (field === 'password') {
      setPasswordStep('method');
      setPasswordMethod('oldPassword');
      setPasswordForm({ oldPassword: '', otp: ['', '', '', '', '', ''], newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setOtpSent(false);
    } else {
      setForm((prev) => ({ ...prev, [field]: user?.[field] || '' }));
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (field) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (field === 'name' && !nameAvailable) {
      return;
    }

    try {
      const response = await fetch(`${API_LINK}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: form[field] })
      });

      if (response.ok) {
        setEditMode((prev) => ({ ...prev, [field]: false }));
        if (onUpdate) onUpdate({ [field]: form[field] });
        if (field === 'name') setNameAvailable(null);
        
        const fieldLabels = {
          name: 'Username',
          bio: 'Bio'
        };
        toast.success(`${fieldLabels[field]} updated successfully!`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImageSrc(event.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewAvatar(url);
    setAvatarFile(blob);
    setShowCropModal(false);
    setTempImageSrc(null);

    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');

    try {
      const response = await fetch(`${API_LINK}/api/auth/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (onUpdate) {
          onUpdate({ avatar_url: data.avatar_url });
        }
        toast.success('Profile photo updated successfully!');
      } else {
        toast.error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
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

  const handleVerifyOldPassword = async () => {
    const token = localStorage.getItem('token');
    setPasswordError('');

    try {
      const response = await fetch(`${API_LINK}/api/auth/verify-old-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword: passwordForm.oldPassword })
      });

      const data = await response.json();
      if (data.verified) {
        setPasswordStep('newPassword');
        toast.success('Password verified! Enter new password');
      } else {
        setPasswordError('Incorrect password');
        toast.error('Incorrect password');
      }
    } catch (error) {
      setPasswordError('Verification failed');
      toast.error('Verification failed');
    }
  };

  const handleGetOTP = async () => {
    const token = localStorage.getItem('token');
    setPasswordError('');

    try {
      const response = await fetch(`${API_LINK}/api/auth/generate-password-otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setOtpSent(true);
        setPasswordError('');
        toast.success('OTP sent to your email!');
      } else {
        setPasswordError('Failed to send OTP');
        toast.error('Failed to send OTP');
      }
    } catch (error) {
      setPasswordError('Failed to send OTP');
      toast.error('Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    const token = localStorage.getItem('token');
    const otpValue = passwordForm.otp.join('');
    setPasswordError('');

    if (otpValue.length !== 6) {
      setPasswordError('Please enter complete OTP');
      toast.error('Please enter complete OTP');
      return;
    }

    try {
      const response = await fetch(`${API_LINK}/api/auth/verify-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: otpValue })
      });

      const data = await response.json();
      if (data.verified) {
        setPasswordStep('newPassword');
        toast.success('OTP verified! Enter new password');
      } else {
        setPasswordError('Invalid OTP');
        toast.error('Invalid OTP');
      }
    } catch (error) {
      setPasswordError('OTP verification failed');
      toast.error('OTP verification failed');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...passwordForm.otp];
    newOtp[index] = value.slice(0, 1);
    setPasswordForm({ ...passwordForm, otp: newOtp });

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !passwordForm.otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[a-z]/.test(password) && 
           /[A-Z]/.test(password) && 
           /\d/.test(password);
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!validatePassword(passwordForm.newPassword)) {
      const errorMsg = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = { newPassword: passwordForm.newPassword };
    
    if (passwordMethod === 'oldPassword') {
      payload.oldPassword = passwordForm.oldPassword;
    } else {
      payload.otp = passwordForm.otp.join('');
    }

    try {
      const response = await fetch(`${API_LINK}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Password changed successfully! Check your email for confirmation');
        handleCancel('password');
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Password change failed');
        toast.error(data.error || 'Password change failed');
      }
    } catch (error) {
      setPasswordError('Password change failed');
      toast.error('Password change failed');
    }
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
          <label className={styles.fieldLabel}>Name (Username):</label>
          {editMode.name ? (
            <div className={styles.editContainer}>
              <div className={styles.usernameInputWrapper}>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  className={styles.input} 
                  placeholder="Enter username (min 3 chars)"
                />
                {!nameChecking && nameAvailable !== null && form.name && form.name.length >= 3 && (
                  <img 
                    src={nameAvailable ? TickIcon : CrossIcon} 
                    alt={nameAvailable ? 'Available' : 'Taken'} 
                    className={styles.availabilityIcon}
                  />
                )}
              </div>
              <div className={styles.buttonGroup}>
                <button 
                  className={styles.saveButton} 
                  onClick={() => handleSubmit('name')}
                  disabled={!nameAvailable || nameChecking}
                >
                  Save
                </button>
                <button className={styles.cancelButton} onClick={() => handleCancel('name')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>{form.name || 'Set username...'}</span>
              <button className={styles.editButton} onClick={() => handleEdit('name')}>
                <img src={EditIcon} alt="Edit" className={styles.editIcon} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email:</label>
          <div className={styles.valueContainer}>
            <span className={styles.value}>{form.email}</span>
          </div>
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
              <div className={styles.charCount}>{form.bio.length}/500</div>
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => handleSubmit('bio')}>Save</button>
                <button className={styles.cancelButton} onClick={() => handleCancel('bio')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>{form.bio || 'Add a bio...'}</span>
              <button className={styles.editButton} onClick={() => handleEdit('bio')}>
                <img src={EditIcon} alt="Edit" className={styles.editIcon} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Password:</label>
          {editMode.password ? (
            <div className={styles.passwordChangeContainer}>
              {passwordStep === 'method' && (
                <>
                  {passwordMethod === 'oldPassword' ? (
                    <div className={styles.editContainer}>
                      <input
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className={styles.input}
                        placeholder="Enter current password"
                      />
                      <div className={styles.methodSwitchContainer}>
                        <button 
                          type="button"
                          className={styles.methodSwitch} 
                          onClick={() => setPasswordMethod('otp')}
                        >
                          Forgot password? Get OTP instead
                        </button>
                      </div>
                      {passwordError && <div className={styles.passwordError}>{passwordError}</div>}
                      <div className={styles.buttonGroup}>
                        <button className={styles.saveButton} onClick={handleVerifyOldPassword}>Verify</button>
                        <button className={styles.cancelButton} onClick={() => handleCancel('password')}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.editContainer}>
                      {!otpSent ? (
                        <>
                          <p className={styles.otpInfo}>We'll send a 6-digit OTP to your email</p>
                          <div className={styles.buttonGroup}>
                            <button className={styles.saveButton} onClick={handleGetOTP}>Send OTP</button>
                            <button className={styles.cancelButton} onClick={() => handleCancel('password')}>Cancel</button>
                          </div>
                          <button 
                            type="button"
                            className={styles.methodSwitch} 
                            onClick={() => setPasswordMethod('oldPassword')}
                          >
                            Use current password instead
                          </button>
                        </>
                      ) : (
                        <>
                          <p className={styles.otpInfo}>Enter the 6-digit OTP sent to {form.email}</p>
                          <div className={styles.otpContainer}>
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={passwordForm.otp[index]}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className={styles.otpInput}
                              />
                            ))}
                          </div>
                          {passwordError && <div className={styles.passwordError}>{passwordError}</div>}
                          <div className={styles.buttonGroup}>
                            <button className={styles.saveButton} onClick={handleVerifyOTP}>Verify OTP</button>
                            <button className={styles.cancelButton} onClick={() => handleCancel('password')}>Cancel</button>
                          </div>
                          <button 
                            type="button"
                            className={styles.methodSwitch} 
                            onClick={handleGetOTP}
                          >
                            Resend OTP
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {passwordStep === 'newPassword' && (
                <div className={styles.editContainer}>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className={styles.input}
                    placeholder="New password"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={styles.input}
                    placeholder="Confirm new password"
                  />
                  <p className={styles.passwordHint}>
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                  {passwordError && <div className={styles.passwordError}>{passwordError}</div>}
                  <div className={styles.buttonGroup}>
                    <button className={styles.saveButton} onClick={handleChangePassword}>Change Password</button>
                    <button className={styles.cancelButton} onClick={() => handleCancel('password')}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.valueContainer}>
              <span className={styles.value}>••••••••</span>
              <button className={styles.editButton} onClick={() => handleEdit('password')}>
                <img src={EditIcon} alt="Edit" className={styles.editIcon} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <button className={styles.logoutButton} onClick={onLogout}>
          Logout
        </button>
      </div>

      {showCropModal && (
        <Modal isOpen={showCropModal} onClose={handleCropCancel} title="Crop Avatar">
          <AvatarCrop
            imageSrc={tempImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />sea
        </Modal>
      )}
    </div>,
    document.body
  );
};

export default UserProfile;
