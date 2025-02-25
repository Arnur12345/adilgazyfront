import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../layout/Navbar';
import config from './config';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchCourseDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }
      
          console.log('Fetching course details...');
      
          const courseResponse = await axios.get(`${config.apiUrl}/api/course/${id}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          console.log('Course response:', courseResponse.data);
      
          if (!courseResponse.data.course) {
            throw new Error('Курс не найден');
          }
      
          setCourse(courseResponse.data.course);
      
          const videosResponse = await axios.get(`${config.apiUrl}/api/course/${id}/videos`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          console.log('Videos response:', videosResponse.data);
      
          setVideos(videosResponse.data.videos || []);

          const pdfsResponse = await axios.get(`${config.apiUrl}/api/course/${id}/pdfs`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('PDFs response:', pdfsResponse.data);

          setPdfs(pdfsResponse.data.pdfs || []);
      
        } catch (err) {
          console.error('Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            statusText: err.response?.statusText
          });
      
          if (err.response?.status === 401) {
            navigate('/login');
            return;
          }
          if (err.response?.status === 403) {
            setError('У вас нет доступа к этому курсу');
            return;
          }
          if (err.response?.status === 404) {
            setError('Курс не найден');
            return;
          }
          setError(err.response?.data?.error || err.message || 'Произошла ошибка при загрузке курса');
        } finally {
          setLoading(false);
        }
      };

    fetchCourseDetails();
  }, [id, navigate]);

  const handleAddVideo = () => {
    navigate(`/course/${id}/add-video`);
  };

  const handleAddPdf = () => {
    navigate(`/course/${id}/add-pdf`);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это видео?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`${config.apiUrl}/api/course/${id}/video/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const videosResponse = await axios.get(`${config.apiUrl}/api/course/${id}/videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videosResponse.data.videos || []);
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Ошибка при удалении видео');
    }
  };

  const handleDeletePdf = async (pdfId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот PDF документ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`${config.apiUrl}/api/course/${id}/pdf/${pdfId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pdfsResponse = await axios.get(`${config.apiUrl}/api/course/${id}/pdfs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPdfs(pdfsResponse.data.pdfs || []);
    } catch (err) {
      console.error('Error deleting PDF:', err);
      setError('Ошибка при удалении PDF документа');
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`${config.apiUrl}/api/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/courses');
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Ошибка при удалении курса');
      if (err.response) {
        console.log('Server Error:', err.response.data);
        console.log('Status:', err.response.status);
        setError(`Ошибка при удалении курса: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.log('Network Error:', err.request);
        setError('Ошибка сети при удалении курса. Проверьте подключение к интернету.');
      } else {
        console.log('Error:', err.message);
        setError(`Неизвестная ошибка: ${err.message}`);
      }
    }
  };
  const handleDownloadPdf = async (pdfId, title) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios({
        method: 'GET',
        url: `${config.apiUrl}/api/course/${id}/pdf/${pdfId}`,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/pdf'
        },
        responseType: 'blob'
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading PDF:', err);
      if (err.response?.status === 403) {
        setError('У вас нет доступа к этому PDF документу');
      } else if (err.response?.status === 404) {
        setError('PDF документ не найден'); 
      } else {
        setError('Ошибка при скачивании PDF документа');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
              {error}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Курс не найден</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="relative h-64">
              <img
                className="w-full h-full object-cover"
                src={course.thumbnail_url || 'https://via.placeholder.com/800x400'}
                alt={course.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400';
                }}
              />
              {userRole === 'admin' && (
                <button
                  onClick={handleDeleteCourse}
                  className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Удалить курс
                </button>
              )}
            </div>
            
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Видео курса</h2>
                {userRole === 'admin' && (
                  <button
                    onClick={handleAddVideo}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Добавить видео
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative pb-[56.25%]">
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        src={video.thumbnail_url || 'https://via.placeholder.com/400x225'}
                        alt={video.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x225';
                        }}
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{video.title}</h3>
                      
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/course/${id}/video/${video.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Смотреть
                        </button>
                        
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {videos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Видео пока не добавлены
                </div>
              )}

              {/* PDF Documents Section */}
              <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">PDF Документы</h2>
                  {userRole === 'admin' && (
                    <button
                      onClick={handleAddPdf}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Добавить PDF
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{pdf.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadPdf(pdf.id, pdf.title)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Скачать
                          </button>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeletePdf(pdf.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pdfs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    PDF документы пока не добавлены
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
