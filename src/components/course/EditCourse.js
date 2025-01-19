import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../layout/Navbar';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    thumbnail: null,
    thumbnail_url: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/course/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCourse(response.data.course);
        setPreviewUrl(response.data.course.thumbnail_url);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('description', course.description);
      if (course.thumbnail) {
        formData.append('thumbnail', course.thumbnail);
      }

      await axios.put(
        `http://localhost:5000/api/course/${id}/edit`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate('/courses');
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'thumbnail') {
      const file = e.target.files[0];
      setCourse({
        ...course,
        thumbnail: file
      });
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setCourse({
        ...course,
        [e.target.name]: e.target.value
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Course</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                name="title"
                value={course.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                name="description"
                value={course.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              <div className="mt-2 flex flex-col items-center">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Course thumbnail preview" 
                    className="mb-4 w-64 h-48 object-cover rounded-lg shadow-md"
                  />
                )}
                <input
                  type="file"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => navigate('/courses')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
