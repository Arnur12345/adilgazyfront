import axios from 'axios';

const API_BASE_URL = 'https://adilgazyback.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем интерцептор для токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courseApi = {
  createCourse: async (courseData) => {
    return api.post('/course', courseData);
  },
  
  uploadToCloudinary: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'adilgazy');
    
    return axios.post(
      'https://api.cloudinary.com/v1_1/dq2pbzrtu/image/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }
};