import './styles/App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Route, Routes, Navigate } from 'react-router-dom';
import Room from './components/Room';
import ContestPage from './pages/ContestPage';
import RoomsPage from './pages/RoomsPage';
import ProblemsPage from './pages/ProblemsPage';
import ResourcesPage from './pages/ResourcesPage';
import SectionsPage from './pages/SectionsPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';

function App(){
  console.log(process.env);
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/sections" element={<SectionsPage />} />
        <Route path="/contest" element={<ContestPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/room" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
