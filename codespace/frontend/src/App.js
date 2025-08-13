import './styles/App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Room from './components/Room';
import GetUsername from './components/GetUsername';
import ContestPage from './pages/ContestPage';
import RoomsPage from './pages/RoomsPage';

function App(){
  console.log(process.env);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contest" element={<ContestPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:roomid/:userid" element={<Room />} />
        <Route path="/rooms/:roomid" element={<GetUsername />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
