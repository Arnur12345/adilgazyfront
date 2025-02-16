import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../layout/Navbar';
import config from './config';

export default function AddVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoSource, setVideoSource] = useState('local');
  const [videoPreview, setVideoPreview] = useState(null);
  const videoRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    thumbnail_url: '',
    video_source: 'local'
  });

  // Обработка изменения текстовых полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Переключение между YouTube и локальным видео
  const handleVideoSourceChange = (source) => {
    setVideoSource(source);
    setFormData(prev => ({
      ...prev,
      video_source: source,
      video_url: '',
      thumbnail_url: ''
    }));
    setVideoPreview(null);
  };

  // Создание превью для локального видео
  const createVideoPreview = (file) => {
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url);
  };

  // Обработка YouTube URL
  const getYoutubeEmbedUrl = (url) => {
    try {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      } else {
        throw new Error('Invalid YouTube URL');
      }
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (err) {
      throw new Error('Неверный формат YouTube ссылки');
    }
  };

  // Обработка загрузки локального видео
  const handleVideoUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.cloudinaryPreset);
      formData.append('resource_type', 'video');

      const response = await axios.post(
        config.cloudinaryUrl.replace('image', 'video'),
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        }
      );

      if (!response.data?.secure_url) {
        throw new Error('Не удалось получить URL видео');
      }

      console.log('Cloudinary response:', response.data);
      return response.data.secure_url;
    } catch (err) {
      console.error('Error uploading to Cloudinary:', err);
      throw new Error(`Ошибка при загрузке видео: ${err.message}`);
    }
  };

  // Обработка изменения видео файла
  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (например, максимум 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Размер файла не должен превышать 100MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Создаем превью
      const cleanup = createVideoPreview(file);

      const videoUrl = await handleVideoUpload(file);
      console.log('Received video URL:', videoUrl);

      setFormData(prev => ({
        ...prev,
        video_url: videoUrl,
        video_source: 'local'
      }));

      return cleanup;
    } catch (err) {
      console.error('Error handling video change:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Обработка YouTube URL
  const handleYoutubeUrlChange = (e) => {
    try {
      const url = e.target.value;
      if (!url) {
        setFormData(prev => ({ ...prev, video_url: '' }));
        return;
      }
      
      const embedUrl = getYoutubeEmbedUrl(url);
      setFormData(prev => ({
        ...prev,
        video_url: embedUrl
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url) {
      setError('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      console.log('Sending data to server:', formData);

      const response = await axios.post(
        `${config.apiUrl}/api/course/${id}/video`,
        {
          title: formData.title,
          video_url: formData.video_url,
          video_source: formData.video_source,
          thumbnail_url: formData.thumbnail_url || ''
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        navigate(`/course/${id}`);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(
        err.response?.data?.error || 
        'Ошибка при добавлении видео. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800">
              <h2 className="text-2xl font-bold text-white">Добавить видео</h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Selection */}
              <div className="mb-6">
                <div className="flex space-x-4 bg-gray-50 p-2 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleVideoSourceChange('local')}
                    className={`flex-1 py-3 px-4 rounded-md transition-all duration-200 ${
                      videoSource === 'local'
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Локальное видео
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVideoSourceChange('youtube')}
                    className={`flex-1 py-3 px-4 rounded-md transition-all duration-200 ${
                      videoSource === 'youtube'
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    YouTube видео
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Video Input */}
                <div>
                  {videoSource === 'local' ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Видео файл
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="cursor-pointer block"
                        >
                          <div className="space-y-2">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="text-sm text-gray-600">
                              <span className="text-blue-600 hover:text-blue-500">
                                Загрузите видео
                              </span>{' '}
                              или перетащите его сюда
                            </div>
                            <p className="text-xs text-gray-500">
                              MP4, MOV до 100MB
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Video Preview */}
                      {videoPreview && (
                        <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                          <video
                            ref={videoRef}
                            src={videoPreview}
                            controls
                            className="w-full"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        onChange={handleYoutubeUrlChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {formData.video_url && (
                        <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            width="100%"
                            height="315"
                            src={formData.video_url}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/course/${id}`)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.video_url}
                    className={`px-6 py-2 rounded-lg text-white transition-all duration-200 ${
                      loading || !formData.video_url
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Загрузка...
                      </div>
                    ) : (
                      'Добавить видео'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
