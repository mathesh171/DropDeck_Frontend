import { API_LINK } from '../config.js';

export const getImageUrl = (path) => `${API_LINK}/uploads/${path}`;
export const getFileDownloadUrl = (fileId) => `${API_LINK}/api/files/${fileId}/download`;
