import logo from './logo.svg';
import './App.css';
import Login from './components/auth/Login';
import CourseList from './components/course/CourseList';
import CreateCourse from './components/course/CreateCourse';
import CourseDetail from './components/course/CourseDetail';
import AddVideo from './components/course/AddVideo';
import GrantAccess from './components/course/GrantAccess';
import EditCourse from './components/course/EditCourse';
import VideoDetail from './components/course/VideoDetail';
import RegisterAccount from './components/auth/RegisterAccount';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/course/:id/add-video" element={<AddVideo />} />
        <Route path="/grant-access" element={<GrantAccess />} />
        <Route path="/course/:id/edit" element={<EditCourse />} />
        <Route path="/course/:courseId/video/:videoId" element={<VideoDetail />} />
        <Route path="/register-account" element={<RegisterAccount />} />
      </Routes>
    </Router>
  );
}

export default App;
