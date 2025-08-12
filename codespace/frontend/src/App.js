import './App.css';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import JoinRoom from './Components/JoinRoom';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import CreateNewRoom from './Components/CreateNewRoom';
import Room from './Components/Room';
import GetUsername from './Components/GetUsername';

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
