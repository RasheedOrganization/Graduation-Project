import TextBox from './TextBox';
import '../styles/App.css'
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLHS from './LHS/MainLHS';
import ChatBox from './ChatBox';
import AIChatBox from './AIChatBox';
import MembersList from './MembersList';
import IconButton from '@mui/material/IconButton';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import BACKEND_URL from '../config';
import '../styles/RoomPage.css';
import leave from '../assets/images/logout_1.png'
import styled from "styled-components";
import CFparser from './LHS/CFparser';
import CustomProblemPanel from './CustomProblemPanel';



const Container = styled.div`
    padding: 20px;
    display: flex;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
    max-height: 40vh;
    overflow-y: auto;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
      props.peer.on("stream", stream => {
          ref.current.srcObject = stream;
      });
  }, [props.peer]);

  return (
      <StyledVideo playsInline autoPlay ref={ref} />
  );
}


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
};

export default function Room() {
    const roomid = localStorage.getItem('roomid');
    const userid = localStorage.getItem('userid');
    const username = localStorage.getItem('username');
    console.log(`roomid is: ${roomid}`);
    console.log(`userid is: ${userid}`);
    const [peers,setPeers] = useState([]);
    const [members, setMembers] = useState([]);
    const [isMicOn, setIsMicOn] = useState(false);
    const [currentProbId,setCurrentProb] = useState(null);
    const [showProblem, setShowProblem] = useState(false);
    const [problemStatement, setProblemStatement] = useState("");
    const [sampleInput, setSampleInput] = useState("");
    const [sampleOutput, setSampleOutput] = useState("");
    const [fetchOpen, setFetchOpen] = useState(false);
    const [customOpen, setCustomOpen] = useState(false);
    const [tests, setTests] = useState([]);
    const [activeTab, setActiveTab] = useState('general');
    const [code, setCode] = useState('');

    const handleFetchClick = () => setFetchOpen(true);
    const handleWriteClick = () => setCustomOpen(true);
    const clearProblem = () => {
      setProblemStatement('');
      setSampleInput('');
      setSampleOutput('');
      setTests([]);
      setShowProblem(false);
      setCurrentProb(null);
      socketRef.current?.emit('clear-problem');
    };
    const userVideo = useRef();
    const socketRef = useRef();
    const [socket, setSocket] = useState(null);
    const peersRef = useRef([]);
    const streamRef = useRef();
    const navigate = useNavigate();
    // TODO: get the username
    // TODO: we join room here

    useEffect(() => {
      const handleUnload = () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('offline', handleUnload);
      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        window.removeEventListener('offline', handleUnload);
      };
    }, []);

    const toggleMic = () => {
      if (isMicOn) {
        // turn off mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        peersRef.current.forEach(p => p.peer.destroy());
        peersRef.current = [];
        setPeers([]);
        setIsMicOn(false);
        if (socketRef.current) {
          socketRef.current.emit('mic-status', { userid, micOn: false });
        }
      } else {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
          streamRef.current = stream;
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
          setIsMicOn(true);
          if (socketRef.current) {
            socketRef.current.emit('mic-status', { userid, micOn: true });
            socketRef.current.emit('get-users-in-room');
          }
        });
      }
    };

    const leaveRoom = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      navigate('/rooms');
    };



    useEffect(() => {
      socketRef.current = io(BACKEND_URL, { transports: ['websocket'] });
      setSocket(socketRef.current);

      // previous implementation relied on an 'all users' broadcast which
      // could fire before a microphone stream was available, leaving new
      // participants without peers. The logic has moved to the
      // 'users-in-room' handler.

      socketRef.current.on('offer received', (payload) => {
        console.log('offer received');
        console.log(`callerid received with offer is: ${payload.callerID}`);
        const peer = addPeer(payload.signal, payload.callerID, streamRef.current); // {signal,senderid,stream}
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });

        setPeers(users => [...users, peer]);
      });

      socketRef.current.on('reply received', (payload) => {
        // whatever this step is
        console.log('flag received, end!');
        const item = peersRef.current.find(p => p.peerID === payload.id);
        console.log(peersRef);
        if (!item) {
          console.log('item shit not found');
        }

        item.peer.signal(payload.signal);
      });

      socketRef.current.on('users-in-room', (payload) => {
        setMembers(payload.users);
        if (streamRef.current) {
          const newPeers = [];
          payload.users.forEach((user) => {
            if (user.userid !== userid && !peersRef.current.some(p => p.peerID === user.userid)) {
              const peer = createPeer(user.userid, userid, streamRef.current);
              peersRef.current.push({ peerID: user.userid, peer });
              newPeers.push(peer);
            }
          });
          if (newPeers.length) {
            setPeers(prev => [...prev, ...newPeers]);
          }
        }
      });

      socketRef.current.on('mic-status', (payload) => {
        setMembers((prev) => prev.map(m => m.userid === payload.userid ? { ...m, micOn: payload.micOn } : m));
      });

      socketRef.current.on('problem-fetched', (payload) => {
        setProblemStatement(payload.statement);
        setSampleInput(payload.sampleInput);
        setSampleOutput(payload.sampleOutput);
        setTests(payload.tests || []);
        setShowProblem(true);
      });

      socketRef.current.on('problem-cleared', () => {
        setProblemStatement('');
        setSampleInput('');
        setSampleOutput('');
        setTests([]);
        setShowProblem(false);
      });

      socketRef.current.emit('join room', { roomid: roomid, userid: userid, username: username });
      socketRef.current.emit('get-users-in-room');

      return () => {
        socketRef.current.disconnect();
      };
    }, [roomid, userid, username]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream,
        });
    
        peer.on("signal", signal => {
          console.log(`sending offer to ${userToSignal} from ${callerID}`); // callerID is fine here
          socketRef.current.emit("sending offer", { userToSignal, callerID, signal });
        })
    
        return peer;
      }
    
      function addPeer(incomingSignal, callerID, stream) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        })
    
        peer.on("signal", (signal) => {
          console.log(`reply sent to ${callerID}`);
          socketRef.current.emit("sending reply", { signal, callerID, userid }); // {signal,the person I am sending the reply to, my id}
        })
    
        peer.signal(incomingSignal);
    
        return peer;
      }

      return (
        <div className="editor-background">
        
        <div className='room-wrapper'>
          <button className="leave-room-button" onClick={leaveRoom}><img src={leave} style={{width: "25px", height: "25px", textAlign: "center"}}/> </button>
          <aside className='left-sidebar'>
            <div className='members-section'>
              <IconButton variant="contained" color="primary" onClick={toggleMic}>
                {isMicOn ? <HeadsetMicIcon /> : <MicOffIcon />}
              </IconButton>
              <div className='members-list'>
                <MembersList members={members} />
              </div>
            </div>
            <div className='chat-section'>
              <div className='chat-tabs'>
                <div
                  className={`chat-tab${activeTab === 'general' ? ' active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  Chat
                </div>
                <div
                  className={`chat-tab${activeTab === 'ai' ? ' active' : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  AI
                </div>
              </div>
              {activeTab === 'general' ? (
                <ChatBox socket={socket} username={username} />
              ) : (
                <AIChatBox code={code} socketRef={socketRef} username={username} />
              )}
            </div>
          </aside>
          <div className='room-main'>
            <div className='problem-view' style={{position: "relative", paddingLeft:"30px", marginTop: "40px"}}>
              {showProblem ? (
                <>
                  <button className='view-problem-button' onClick={clearProblem}>Clear Problem</button>
                  <MainLHS
                    currentProbId={currentProbId}
                    setCurrentProb={setCurrentProb}
                    externalInput={problemStatement}
                    externalSampleInput={sampleInput}
                    externalSampleOutput={sampleOutput}
                  />
                </>
              ) : (
                <div className='problem-options'>
                  <button
                    className='view-problem-button'
                    onClick={handleFetchClick}
                    title='Fetch a problem from Codeforces'
                  >
                    Fetch from Codeforces
                  </button>
                  <button
                    className='view-problem-button'
                    onClick={handleWriteClick}
                    title='Create and share your own problem'
                  >
                    Write a Problem
                  </button>
                </div>
              )}
            </div>
            <div className='editor-container'>
              <TextBox
                socketRef={socketRef}
                currentProbId={currentProbId}
                tests={tests}
                onCodeChange={setCode}
              />
            </div>
          </div>
        </div>
        <Modal open={fetchOpen} onClose={() => setFetchOpen(false)}>
          <Box sx={modalStyle}>
            <CFparser
              socketRef={socketRef}
              setStatement={(stmt) => { setProblemStatement(stmt); }}
              setProblemName={() => {}}
              setSampleInput={setSampleInput}
              setSampleOutput={setSampleOutput}
              setInput={(stmt) => { setProblemStatement(stmt); }}
              onFetched={() => { setFetchOpen(false); setShowProblem(true); }}
            />
          </Box>
        </Modal>
        <Modal open={customOpen} onClose={() => setCustomOpen(false)}>
          <Box sx={modalStyle}>
            <CustomProblemPanel
              onAdd={(stmt, genTests) => {
                setProblemStatement(stmt);
                setSampleInput('');
                setSampleOutput('');
                setTests(genTests);
                if (socketRef.current) {
                  socketRef.current.emit('problem-fetched', { statement: stmt, sampleInput: '', sampleOutput: '', tests: genTests });
                }
                setShowProblem(true);
              }}
              onClose={() => setCustomOpen(false)}
            />
          </Box>
        </Modal>
        <Container style={{ display: 'none' }}>
          <StyledVideo muted ref={userVideo} autoPlay playsInline />
          {peers.map((peer, index) => (
            <Video key={index} peer={peer} />
          ))}
        </Container>
        </div>
    );
};
