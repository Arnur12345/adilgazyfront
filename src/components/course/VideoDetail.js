import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../layout/Navbar';
import config from './config';

export default function VideoDetail() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();

  // Helper function to check if URL is YouTube
  const isYouTubeUrl = (url) => {
    return url && (
      url.includes('youtube.com') || 
      url.includes('youtu.be')
    );
  };

  // Helper function to get YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? match[2]
      : null;
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${config.apiUrl}/api/course/${courseId}/video/${videoId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setVideo(response.data.video);
      } catch (err) {
        console.error('Error fetching video:', err);
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError(err.response?.data?.error || 'Произошла ошибка при загрузке видео');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [courseId, videoId, navigate]);

  const handleBack = () => {
    navigate(`/course/${courseId}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${config.apiUrl}/api/course/${courseId}/video/${videoId}/comment`,
        { text: commentText },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setVideo({
        ...video,
        comments: [response.data.comment, ...video.comments]
      });
      
      setCommentText('');

    } catch (err) {
      console.error('Error posting comment:', err);
      alert(err.response?.data?.error || 'Ошибка при добавлении комментария');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-2xl text-gray-600">Загрузка...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-gray-600">Видео не найдено</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={handleBack}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Назад к курсу
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={isYouTubeUrl(video.file_path) ? "aspect-w-16 aspect-h-9 h-[600px]" : "aspect-w-16 aspect-h-9"}>
              {isYouTubeUrl(video.file_path) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(video.file_path)}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="w-full h-full object-cover"
                  controls
                  src={video.file_path}
                  poster={video.thumbnail_url}
                >
                  Ваш браузер не поддерживает видео
                </video>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{video.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span className="mr-4">Порядковый номер: {video.order}</span>
              </div>

              {/* Форма добавления комментария */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Добавить комментарий
                  </label>
                  <textarea
                    id="comment"
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Напишите ваш комментарий..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Отправить
                </button>
              </form>

              {/* Список комментариев */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Комментарии</h2>
                {video.comments && video.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-900">{comment.user_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
