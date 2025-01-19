import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../layout/Navbar';

export default function GrantAccess() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '', 
    durationDays: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Получаем список пользователей с ролью student
        const usersResponse = await axios.get('https://adilgazyback.onrender.com/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data.users);

        // Получаем список курсов
        const coursesResponse = await axios.get('https://adilgazyback.onrender.com/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(coursesResponse.data.courses);

      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://adilgazyback.onrender.com/api/course/grant-access',
        {
          user_id: parseInt(formData.userId),
          course_id: parseInt(formData.courseId),
          duration_days: parseInt(formData.durationDays)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка при предоставлении доступа');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Предоставить доступ к курсу</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  Студент
                </label>
                <select
                  id="userId"
                  name="userId"
                  required
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите студента</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} ({user.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                  Курс
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  required
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите курс</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
                  Срок доступа (в днях)
                </label>
                <input
                  type="number"
                  name="durationDays"
                  id="durationDays"
                  required
                  min="1"
                  value={formData.durationDays}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Предоставление доступа...' : 'Предоставить доступ'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
