require("dotenv").config();
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const cors = require('cors');
const { callGemini, extractText } = require('./utils/gemini');
const codeRunner = require("./routes/codeRunner")
const submit = require("./routes/submit")
const api1 = require("./routes/api")
const auth = require("./routes/auth")
const roomsRoute = require("./routes/rooms");
const contestsRoute = require("./routes/contests")
const authMiddleware = require("./middleware/authMiddleware")
const usersRoute = require("./routes/users");
const adminRoute = require("./routes/admin");
const resourcesRoute = require("./routes/resources");
const topicsRoute = require("./routes/topics");
const problemsRoute = require("./routes/problems");
const rateLimit = require('express-rate-limit');
const aiRoute = require("./routes/ai");
const Room = require('./model/roomModel');

const app = express();

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 20, // Limit each IP to 20 requests per `window`.
})

app.use('/api/parse_problem',limiter);

app.use(rateLimit({
    windowMs: 15 * 60 * 100,
    limit: 1000, // a bit generous here
}))

app.use(cors());
const server = createServer(app);
const io = new Server(server); // this shit creates a separate websocket server whenever a connection opens

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth',auth)
app.use('/api',api1)
app.use('/api/contests',contestsRoute)
app.use('/api/rooms', authMiddleware, roomsRoute)
app.use('/api/users', usersRoute);
app.use('/api/admin', adminRoute);
app.use('/api/resources', resourcesRoute)
app.use('/api/topics', topicsRoute)
app.use('/api/problems', problemsRoute)
app.use('/api/ai', aiRoute)
app.use('/test',codeRunner)
app.use('/submit',submit)

app.get('/', (req, res) => {
    res.send('omg hewwo fren!!');
});

const {
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
  updateMicStatus,
  addMessage,
  getMessages,
  deleteMessages,
} = require('./utils/roomStore');
const username_to_socket = {};
const pairSet = new Map();
const roomState = {};

function getRoomState(roomid){
  if(!roomState[roomid]){
    roomState[roomid] = { code: '', statement: '', aiChat: [], language: 'cpp', input: '', sampleInput: '', sampleOutput: '', tests: [] };
  }
  return roomState[roomid];
}

// Function to add a pair to the set
function addPair(key, value) {
  pairSet.set(key, value);
}

// Function to check if a pair exists in the set
function pairExists(key, value) {
  return pairSet.get(key) === value;
}

function removeuserfrompair(){
    // pairSet.clear();
}



io.on('connection', (socket) => {
    socket.emit('welcome',{msg: 'welcome to room'});
    socket.on('join room', async (payload) => {
        socket.roomid = payload.roomid;
        socket.userid = payload.userid;
        socket.username = payload.username;

        socket.join(payload.roomid);
        username_to_socket[payload.userid] = socket;

        await addUserToRoom(payload.roomid, payload.userid, payload.username);

        console.log(`${payload.userid} joined ${payload.roomid}`)
        const usersInRoom = await getUsersInRoom(payload.roomid);
        io.to(socket.roomid).emit('all users',{users: usersInRoom.map(u => u.userid)});
        io.to(socket.roomid).emit('users-in-room', { users: usersInRoom.map(u => ({ userid: u.userid, username: u.username, micOn: u.micOn })) });

        const history = await getMessages(payload.roomid);
        socket.emit('room-messages', history.map(m => ({
            userid: m.userid,
            username: m.username,
            msg: m.message
        })));

        const roomDoc = await Room.findOne({ roomid: payload.roomid });
        const state = getRoomState(payload.roomid);
        if (roomDoc) {
            state.code = roomDoc.code || '';
            state.statement = roomDoc.statement || '';
            state.sampleInput = roomDoc.sampleInput || '';
            state.sampleOutput = roomDoc.sampleOutput || '';
            state.tests = roomDoc.tests || [];
            state.language = roomDoc.language || 'cpp';
            state.input = roomDoc.input || '';
        }
        if(state.code){
            socket.emit('receive-code-update',{code: state.code});
        }
        if(state.statement){
            socket.emit('problem-fetched',{statement: state.statement, sampleInput: state.sampleInput, sampleOutput: state.sampleOutput, tests: state.tests});
        }
        if(state.language){
            socket.emit('receive-language-update',{language: state.language});
        }
        if(state.input){
            socket.emit('receive-input-update',{input: state.input});
        }
        if(state.aiChat.length){
            socket.emit('ai-chat-history', state.aiChat);
        }
    })
    
    socket.on('update-code', async (payload) => {
        const state = getRoomState(socket.roomid);
        state.code = payload.code;
        await Room.findOneAndUpdate({ roomid: socket.roomid }, { code: payload.code });
        // Broadcast the latest code to everyone else in the room
        socket.to(socket.roomid).emit('receive-code-update', { code: payload.code });
    });

    socket.on('update-input', async (payload) => {
        const state = getRoomState(socket.roomid);
        state.input = payload.input;
        await Room.findOneAndUpdate({ roomid: socket.roomid }, { input: payload.input });
        socket.to(socket.roomid).emit('receive-input-update',{input: payload.input});
    });

    socket.on('update-language', async (payload) => {
        const state = getRoomState(socket.roomid);
        state.language = payload.language;
        await Room.findOneAndUpdate({ roomid: socket.roomid }, { language: payload.language });
        socket.to(socket.roomid).emit('receive-language-update',{language: payload.language});
    });

    socket.on('update-cursor', (payload) => {
        // broadcast cursor position to other users in the room
        socket.to(socket.roomid).emit('receive-cursor-update', payload);
    });

    socket.on('problem-fetched', async (payload) => {
        const state = getRoomState(socket.roomid);
        state.statement = payload.statement;
        state.sampleInput = payload.sampleInput;
        state.sampleOutput = payload.sampleOutput;
        state.tests = payload.tests || [];
        await Room.findOneAndUpdate(
            { roomid: socket.roomid },
            {
                statement: payload.statement,
                sampleInput: payload.sampleInput,
                sampleOutput: payload.sampleOutput,
                tests: payload.tests || [],
            }
        );
        socket.to(socket.roomid).emit('problem-fetched', payload);
    });

    socket.on('send-message', async (payload) => {
        await addMessage(socket.roomid, socket.userid, socket.username, payload.msg);
        io.to(socket.roomid).emit('receive message', {
            userid: socket.userid,
            username: socket.username,
            msg: payload.msg
        });
    })

    socket.on('get-messages', async () => {
        const history = await getMessages(socket.roomid);
        socket.emit('room-messages', history.map(m => ({
            userid: m.userid,
            username: m.username,
            msg: m.message
        })));
    })

    socket.on('get-ai-messages', () => {
        const state = getRoomState(socket.roomid);
        socket.emit('ai-chat-history', state.aiChat);
    });

    socket.on('ai-request', async (payload) => {
        const state = getRoomState(socket.roomid);
        const { prompt = '', code = '', mode = 'normal', username } = payload;
        io.to(socket.roomid).emit('ai-user-message', { username, text: prompt });
        state.aiChat.push({ type: 'user', username, text: prompt });

        let text = prompt;
        if (mode === 'fix') {
            text = `${prompt}\n\nFix the following code:\n${code}`;
        } else if (mode === 'explain') {
            text = `${prompt}\n\nExplain the following code:\n${code}`;
        }
        try {
            const data = await callGemini(text);
            const aiText = extractText(data);
            io.to(socket.roomid).emit('ai-bot-message', { text: aiText });
            state.aiChat.push({ type: 'ai', username: 'AI', text: aiText });
        } catch (err) {
            io.to(socket.roomid).emit('ai-bot-message', { text: 'Error contacting AI' });
            state.aiChat.push({ type: 'ai', username: 'AI', text: 'Error contacting AI' });
        }
    });

    socket.on('clear-messages', async () => {
        await deleteMessages(socket.roomid);
        io.to(socket.roomid).emit('messages-cleared');
    });

    socket.on('clear-ai-chat', () => {
        const state = getRoomState(socket.roomid);
        state.aiChat = [];
        io.to(socket.roomid).emit('ai-chat-cleared');
    });

    socket.on('clear-problem', async () => {
        const state = getRoomState(socket.roomid);
        state.statement = '';
        state.sampleInput = '';
        state.sampleOutput = '';
        state.tests = [];
        await Room.findOneAndUpdate(
            { roomid: socket.roomid },
            { statement: '', sampleInput: '', sampleOutput: '', tests: [] }
        );
        io.to(socket.roomid).emit('problem-cleared');
    });

    socket.on('sending offer', (payload) => {
        // if a has already sent to b, then don't sent from b to a
        if(!pairExists(payload.userToSignal,payload.callerID) && !pairExists(payload.callerID,payload.userToSignal)){
            addPair(payload.userToSignal,payload.callerID);
            console.log(`sending offer to ${payload.userToSignal} from ${payload.callerID}`);
            const targetSocket = username_to_socket[payload.userToSignal];
            // console.log(`target socket id is ${targetSocket.id}`);
            io.to(targetSocket.id).emit('offer received', { signal: payload.signal, callerID: payload.callerID});
        }
        // io.to(socket.roomid).emit('receive message',{msg: payload.msg});
    })

    socket.on('sending reply', (payload) => {
        const targetSocket = username_to_socket[payload.callerID];
        console.log('sending reply');
        // console.log(`userid is: ${[payload.userid]}`);
        // console.log(`callerID is: ${[payload.callerID]}`);
        // console.log(`sending to: ${payload.callerID}`);
        if(targetSocket){
            io.to(targetSocket.id).emit('reply received', { signal: payload.signal, id: payload.userid});
        }
        else{
            console.log('cutie doesnt exist');
        }
    })

    socket.on('private message', (payload) => {
        const targetSocket = username_to_socket[payload.target];
        if (targetSocket) {
            targetSocket.emit('receive message', { msg: payload.msg });
        }
        else{
            console.log('you messed something up cutie');
        }
    })

    socket.on('mic-status', async (payload) => {
        await updateMicStatus(socket.roomid, payload.userid, payload.micOn);
        io.to(socket.roomid).emit('mic-status', payload);
    });

    socket.on('get-users-in-room', async (payload) => {
        const usersInRoom = await getUsersInRoom(socket.roomid);
        console.log('someone is asking around');
        socket.emit('users-in-room', { users: usersInRoom.map(u => ({ userid: u.userid, username: u.username, micOn: u.micOn })) });
    });


    socket.on('disconnect', async () => {
        // this is trash bruh
        if (socket.roomid) {
          await removeUserFromRoom(socket.roomid, socket.userid);
          const usersInRoom = await getUsersInRoom(socket.roomid);
          io.to(socket.roomid).emit('users-in-room', { users: usersInRoom.map(u => ({ userid: u.userid, username: u.username, micOn: u.micOn })) });

          console.log('users currently in room are: ' + usersInRoom.map(u => u.username));

          console.log(`${socket.userid} left ${socket.roomid}`);
        }
        removeuserfrompair();
    });
    
})  
app.use((req, res, next) => {
    res.status(429).json({
      error: "Rate limit exceeded, please try again later",
    });
  });

server.listen(6909, () => {
    console.log(`server listening`);
})
