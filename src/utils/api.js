import { API_LINK } from '../config.js';

// export const getImageUrl = (path) => `${API_LINK}/uploads/${path}`;
export const getFileDownloadUrl = (fileId) => `${API_LINK}/api/files/${fileId}/download`;

export const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  const url = `${API_LINK}/uploads/avatars/${filename}`;
  console.log('Image URL:', url); 
  return url;
}
