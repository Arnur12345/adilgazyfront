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
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  
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
            setUploadProgress(percentCompleted);
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

  // Обработка загрузки thumbnail
  const handleThumbnailUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.cloudinaryPreset);

      const response = await axios.post(
        config.cloudinaryUrl,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setThumbnailProgress(percentCompleted);
          }
        }
      );

      if (!response.data?.secure_url) {
        throw new Error('Не удалось получить URL превью');
      }

      return response.data.secure_url;
    } catch (err) {
      console.error('Error uploading thumbnail:', err);
      throw new Error(`Ошибка при загрузке превью: ${err.message}`);
    }
  };

  // Обработка изменения thumbnail
  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (например, максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер превью не должен превышать 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Создаем превью
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      const thumbnailUrl = await handleThumbnailUpload(file);
      setFormData(prev => ({
        ...prev,
        thumbnail_url: thumbnailUrl
      }));

      return () => URL.revokeObjectURL(previewUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Добавить видео</h2>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => handleVideoSourceChange('local')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    videoSource === 'local'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Локальное видео
                </button>
                <button
                  onClick={() => handleVideoSourceChange('youtube')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    videoSource === 'youtube'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  YouTube
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

              {/* Video Input Section */}
              <div className="space-y-4">
                {videoSource === 'local' ? (
                  <div>
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer block text-center"
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

                    {/* Upload Progress */}
                    {loading && (
                      <div className="mt-4">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                Загрузка
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                {uploadProgress}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                            <div
                              style={{ width: `${uploadProgress}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Предпросмотр</h3>
                        <div className="relative rounded-lg overflow-hidden shadow-lg aspect-video">
                          <video
                            ref={videoRef}
                            src={videoPreview}
                            controls
                            className="w-full h-full object-contain bg-black"
                          >
                            Ваш браузер не поддерживает видео тег.
                          </video>
                        </div>
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
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Предпросмотр</h3>
                        <div className="relative rounded-lg overflow-hidden shadow-lg aspect-video">
                          <iframe
                            width="100%"
                            height="100%"
                            src={formData.video_url}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnail Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Превью видео (опционально)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="thumbnail-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Загрузить превью</span>
                        <input
                          id="thumbnail-upload"
                          name="thumbnail"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                      <p className="pl-1">или перетащите сюда</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF до 5MB</p>
                  </div>
                </div>

                {/* Thumbnail Progress */}
                {loading && thumbnailProgress > 0 && (
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            Загрузка превью
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {thumbnailProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${thumbnailProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Thumbnail Preview */}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Превью изображения</h3>
                    <div className="relative rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={thumbnailPreview}
                        alt="Превью видео"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

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
    </>
  );
}
