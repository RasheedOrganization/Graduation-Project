import './styles/App.css';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JoinRoom from './components/JoinRoom';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import CreateNewRoom from './components/CreateNewRoom';
import Room from './components/Room';
import GetUsername from './components/GetUsername';

function App(){
  console.log(process.env);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/create" element={<CreateNewRoom />} />
        <Route path="/room/:roomid/:userid" element={<Room />} />
        <Route path="/room/:roomid/" element={<GetUsername />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
