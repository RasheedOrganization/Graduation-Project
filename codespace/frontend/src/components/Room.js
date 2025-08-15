import TextBox from './TextBox';
import '../styles/App.css'
import React, { useEffect, useRef, useState } from 'react';
import MiniDrawer from './SideDrawer';
import Split from 'react-split';
import MainLHS from './LHS/MainLHS';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import BACKEND_URL from '../config';
import '../styles/RoomPage.css';

import styled from "styled-components";



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
    const userVideo = useRef();
    const socketRef = useRef();
    const peersRef = useRef([]);
    const streamRef = useRef();
    // TODO: get the username
    // TODO: we join room here

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
      } else {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
          streamRef.current = stream;
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
          setIsMicOn(true);
          // Rejoin to trigger offers from existing users
          socketRef.current.emit('join room', { roomid, userid, username });
        });
      }
    };

    useEffect(() => {
      socketRef.current = io(BACKEND_URL, { transports: ['websocket'] });

      socketRef.current.on('receive message', (payload) => {
        console.log(`I am ${userid}`);
        console.log(payload.msg);
      });

      socketRef.current.on('all users', (payload) => {
        if (!streamRef.current) return;
        const peers = [];
        const tmp = payload.users;
        tmp.forEach((user) => {
          if (user !== userid) {
            const peer = createPeer(user, userid, streamRef.current); // {target,my id,stream}
            peersRef.current.push({
              peerID: user,
              peer,
            });
            peers.push(peer);
          }
        });
        setPeers(peers);
      });

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
        <div className='main'>
              <Split
                  sizes={[20, 80]}
                minSize={200}
                maxSize={1000}
                direction="horizontal"
                gutterSize={10}
                gutterAlign="center"
                className="split"
                gutter={(index, direction) => {
                    const gutter = document.createElement('div');
                    gutter.className = `gutter gutter-${direction}`;
                    return gutter;
                }}
            >
                <div className="LHS-container">
                    <MainLHS socketRef={socketRef} currentProbId={currentProbId} setCurrentProb={setCurrentProb} />
                </div>
                <div className="RHS-container">
                    <TextBox socketRef={socketRef} currentProbId={currentProbId} />
                </div>
            </Split>
              <MiniDrawer toggleMic={toggleMic} roomid={roomid} members={members} />
            {/* <AudioRecorder socket={socket} username={username} roomid={roomid}/> */}
            <Container>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
                {peers.map((peer, index) => (
                    <Video key={index} peer={peer} />
                ))}
            </Container>
        </div>
        </div>
    );
};
