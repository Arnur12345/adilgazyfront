import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.courses) {
          // Получаем видео для каждого курса
          const coursesWithVideos = await Promise.all(
            response.data.courses.map(async (course) => {
              try {
                const videosResponse = await axios.get(
                  `http://localhost:5000/api/course/${course.id}/videos`,
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                );
                return {
                  ...course,
                  videos: videosResponse.data.videos || []
                };
              } catch (err) {
                console.error(`Error fetching videos for course ${course.id}:`, err);
                return {
                  ...course,
                  videos: []
                };
              }
            })
          );
          setCourses(coursesWithVideos);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.response?.data?.error || 'Ошибка при загрузке курсов');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

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
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
              {error}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Нет доступных курсов</h1>
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Доступные курсы</h1>
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/create-course')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Создать курс
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 ease-in-out"
              >
                <div className="relative pb-48 overflow-hidden">
                  <img
                    className="absolute inset-0 h-full w-full object-cover transform hover:scale-105 transition-transform duration-300"
                    src={course.thumbnail_url || 'https://via.placeholder.com/400x300'}
                    alt={course.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300';
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                    {course.access_expires && (
                      <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                        Доступ до: {new Date(course.access_expires).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Подробнее
                      <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {userRole === 'admin' && (
                      <button
                        onClick={() => navigate(`/course/${course.id}/edit`)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Редактировать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}