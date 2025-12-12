import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/CreateGroupPage.module.css';
import BackIcon from '../assets/Back.png';
import Confetti from '../components/Confetti/Confetti';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { API_LINK } from '../config.js';
import { toast } from '../utils/toast';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    expiry_time: '',
    access_type: 'public'
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const form = new FormData();
      form.append('group_name', formData.group_name);
      form.append('description', formData.description);
      form.append('expiry_time', new Date(formData.expiry_time).toISOString());
      form.append('access_type', formData.access_type);
      if (avatarFile) form.append('group_image', avatarFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const isFirstGroup = localStorage.getItem('hasCreatedGroup') !== 'true';
          
          if (isFirstGroup) {
            localStorage.setItem('hasCreatedGroup', 'true');
            setShowConfetti(true);
            toast.success('🎉 Congratulations on your first group!');
            setTimeout(() => {
              navigate('/chat');
            }, 3000);
          } else {
            toast.success('Group created successfully!');
            navigate('/chat');
          }
        } else {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || 'Failed to create group');
          toast.error(data.error || 'Failed to create group');
        }
        setLoading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Network error. Try again.');
        toast.error('Network error. Try again.');
        setLoading(false);
      });

      xhr.open('POST', `${API_LINK}/api/groups/create`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(form);
    } catch {
      setError('Network error. Try again.');
      toast.error('Network error. Try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.createGroupPage}>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={() => navigate('/chat')}>
            <img src={BackIcon} alt="Back" />
          </button>
        </div>
        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <h2 className={styles.title}>Create New Group</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarPreview}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Group avatar" />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <span>📷</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className={styles.fileInput}
                  disabled={loading}
                />
                <label htmlFor="avatar" className={styles.avatarLabel}>
                  Choose Group Photo
                </label>
              </div>

              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="group_name"
                  placeholder="Group Name"
                  value={formData.group_name}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <textarea
                  name="description"
                  placeholder="Group Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Expiry Date</label>
                <input
                  type="datetime-local"
                  name="expiry_time"
                  value={formData.expiry_time}
                  onChange={handleInputChange}
                  required
                  className={styles.dateInput}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Access Type</label>
                <select
                  name="access_type"
                  value={formData.access_type}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="approval">Approval Required</option>
                </select>
              </div>

              {loading && uploadProgress > 0 && (
                <div className={styles.progressWrapper}>
                  <ProgressBar
                    progress={uploadProgress}
                    showLabel
                    label="Uploading..."
                    color="primary"
                  />
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}

              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Confetti 
        active={showConfetti} 
        duration={3000}
        onComplete={() => setShowConfetti(false)}
      />
    </>
  );
};

export default CreateGroupPage;