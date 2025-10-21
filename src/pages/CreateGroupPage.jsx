import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/CreateGroupPage.module.css';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    expiry_time: '',
    access_type: 'public'
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Format expiry_time to ISO format
    const expiryDate = new Date(formData.expiry_time).toISOString();

    try {
      const response = await fetch('http://localhost:5000/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          expiry_time: expiryDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/chat');
      } else {
        setError(data.error || 'Failed to create group');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  return (
    <div className={styles.createGroupPage}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.backButton} onClick={handleBack}>
            ←
          </button>
          <input
            type="text"
            placeholder="Search groups..."
            className={styles.searchInput}
          />
          <button className={styles.createButton}>+</button>
        </div>
      </div>

      <div className={styles.formContainer}>
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
              />
              <button type="button" className={styles.clearButton}>×</button>
            </div>

            <div className={styles.formGroup}>
              <textarea
                name="description"
                placeholder="Group Description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                rows="3"
              />
              <button type="button" className={styles.clearButton}>×</button>
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
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Access Type</label>
              <select
                name="access_type"
                value={formData.access_type}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="approval">Approval Required</option>
              </select>
            </div>

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

        <div className={styles.brandingSection}>
          <h1 className={styles.brandText}>Drop Deck</h1>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
