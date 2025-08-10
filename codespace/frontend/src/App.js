// import io from 'socket.io-client';
import './App.css'
import JoinRoom from './Components/JoinRoom';
import { Route,Routes, BrowserRouter } from 'react-router-dom';
import CreateNewRoom from './Components/CreateNewRoom';
import Room from './Components/Room';
import GetUsername from './Components/GetUsername';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Navbar from './Components/Navbar';
import CreateProblem from './Components/CreateProblem';
import SolveProblem from './Components/SolveProblem';

// const socket = io("localhost:6909/",{transports: ['websocket']});

function App(){
  console.log(process.env)
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/create" element={<CreateNewRoom />} />
          <Route path="/room/:roomid/:userid" element={<Room />} />
          <Route path="/room/:roomid/" element={<GetUsername />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-problem" element={<CreateProblem />} />
          <Route path="/solve-problem" element={<SolveProblem />} />
          <Route path="/" element={<div></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
