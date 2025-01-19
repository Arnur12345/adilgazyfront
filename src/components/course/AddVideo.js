import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../layout/Navbar';

export default function AddVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    video: null,
    video_url: '',
    thumbnail: null,
    thumbnail_url: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        // Загружаем видео в Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'adilgazy');
        formData.append('resource_type', 'video');
        
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dq2pbzrtu/video/upload',
          formData
        );

        setFormData(prev => ({
          ...prev,
          video_url: response.data.secure_url
        }));
      } catch (err) {
        setError('Ошибка при загрузке видео');
        console.error('Upload error:', err);
      } finally {
        setLoading(false);
      }
    }
};

const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        // Загружаем thumbnail в Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'adilgazy');
        
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dq2pbzrtu/image/upload',
          formData
        );

        setFormData(prev => ({
          ...prev,
          thumbnail_url: response.data.secure_url
        }));
      } catch (err) {
        setError('Ошибка при загрузке изображения');
        console.error('Upload error:', err);
      } finally {
        setLoading(false);
      }
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/course/${id}/video`,
        {
          title: formData.title,
          video_url: formData.video_url,  // URL из Cloudinary
          thumbnail_url: formData.thumbnail_url  // URL из Cloudinary
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      navigate(`/course/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка при добавлении видео');
    } finally {
      setLoading(false);
    }
};

  

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Добавить видео</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Название
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="video" className="block text-sm font-medium text-gray-700">
                  Видео файл
                </label>
                <input
                  type="file"
                  name="video"
                  id="video"
                  required
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.video_url && (
                  <p className="mt-2 text-sm text-green-600">Видео успешно загружено</p>
                )}
              </div>

              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                  Превью (необязательно)
                </label>
                <input
                  type="file"
                  name="thumbnail"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.thumbnail_url && (
                  <p className="mt-2 text-sm text-green-600">Превью успешно загружено</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/course/${id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.video_url}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Загрузка...' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
