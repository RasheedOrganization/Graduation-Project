import React, { useCallback, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../styles/App.css';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// Replace with the URL you want to send the request to
const apiUrl = `${BACKEND_URL}/test`; // compilation sandbox endpoint
const submitUrl = `${BACKEND_URL}/submit`;

const defaultCpp = "#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n int t;\n cin >> t;\n while(t--){\n\n }\n}";
const defaultPython = `import sys\n\n\ndef solve():\n    pass\n\n\ndef main():\n    t = int(sys.stdin.readline())\n    for _ in range(t):\n        solve()\n\n\nif __name__ == "__main__":\n    main()\n`;

const defaultJava = `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int t = Integer.parseInt(br.readLine());\n        while (t-- > 0) {\n            // TODO: solve\n        }\n    }\n}\n`;

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}

class CursorWidget extends WidgetType {
    constructor(color, name) {
        super();
        this.color = color;
        this.name = name;
    }
    toDOM() {
        const span = document.createElement('span');
        span.style.borderLeft = `2px solid ${this.color}`;
        span.style.marginLeft = '-1px';
        span.style.height = '1em';
        span.style.position = 'relative';

        const label = document.createElement('div');
        label.textContent = this.name;
        label.style.position = 'absolute';
        label.style.top = '-1.2em';
        label.style.left = '0';
        label.style.fontSize = '0.6em';
        label.style.padding = '0 2px';
        label.style.background = this.color;
        label.style.color = 'white';
        label.style.opacity = '0.8';
        label.style.borderRadius = '2px';

        span.appendChild(label);
        return span;
    }
}
export default function TextBox({socketRef,currentProbId,tests,onCodeChange}) {
    console.log('I am textbox and the current problem id is ' + currentProbId);
    const [language, setLanguage] = useState('cpp');
    const [textvalue, setTextvalue] = useState(defaultCpp);
    const [inputvalue, setInputvalue] = useState('');
    const [outputvalue, setOutputvalue] = useState('');
    const [color, setColor] = useState('black');
    const navigate = useNavigate();
    const userid = localStorage.getItem('userid');
    const username = localStorage.getItem('username');
    const [cursors, setCursors] = useState({});

    const SocketEmit = useCallback((channel,payload) => {
        if(socketRef.current){
            socketRef.current.emit(channel,payload);
        }
    }, [socketRef.current]);

    useEffect(() => {
        onCodeChange && onCodeChange(defaultCpp);
    }, [onCodeChange]);

    useEffect(() => {
        if (!socketRef.current) return;
        const handleCodeUpdate = (payload) => {
            setTextvalue(payload.code);
            onCodeChange && onCodeChange(payload.code);
        };
        socketRef.current.on('receive-code-update', handleCodeUpdate);
        return () => {
            socketRef.current.off('receive-code-update', handleCodeUpdate);
        };
    }, [socketRef.current, onCodeChange]);

    useEffect(() => {
        if (!socketRef.current) return;
        const handleInputUpdate = (payload) => {
            setInputvalue(payload.input);
        };
        socketRef.current.on('receive-input-update', handleInputUpdate);
        return () => {
            socketRef.current.off('receive-input-update', handleInputUpdate);
        };
    }, [socketRef.current]);

    useEffect(() => {
        if (!socketRef.current) return;
        const handleLanguageUpdate = (payload) => {
            const newLang = payload.language;
            setLanguage(newLang);
            const template = newLang === 'cpp' ? defaultCpp : newLang === 'python' ? defaultPython : defaultJava;
            setTextvalue(template);
            onCodeChange && onCodeChange(template);
        };
        socketRef.current.on('receive-language-update', handleLanguageUpdate);
        return () => {
            socketRef.current.off('receive-language-update', handleLanguageUpdate);
        };
    }, [socketRef.current, onCodeChange]);

    useEffect(() => {
        if (!socketRef.current) return;
        const handleCursor = (payload) => {
            if (payload.userid === userid) return;
            setCursors(prev => {
                const color = stringToColor(payload.userid);
                return { ...prev, [payload.userid]: { pos: payload.cursor, username: payload.username, color } };
            });
        };
        const handleUsers = (payload) => {
            setCursors(prev => {
                const ids = payload.users.map(u => u.userid);
                const next = {};
                ids.forEach(id => { if (prev[id]) next[id] = prev[id]; });
                return next;
            });
        };
        socketRef.current.on('receive-cursor-update', handleCursor);
        socketRef.current.on('users-in-room', handleUsers);
        return () => {
            socketRef.current.off('receive-cursor-update', handleCursor);
            socketRef.current.off('users-in-room', handleUsers);
        };
    }, [socketRef.current, userid]);


    const Handlechange = useCallback((val, viewUpdate) => {
        setTextvalue(val);
        SocketEmit('update-code',{code: val});
        onCodeChange && onCodeChange(val);
    }, [SocketEmit,onCodeChange]);

    function handleLanguageChange(newLang){
        setLanguage(newLang);
        const template = newLang === 'cpp' ? defaultCpp : newLang === 'python' ? defaultPython : defaultJava;
        setTextvalue(template);
        SocketEmit('update-code',{code: template});
        SocketEmit('update-language',{language: newLang});
        onCodeChange && onCodeChange(template);
    }

    function Handlechangeinput(e) {
        setInputvalue(e.target.value);
        const newval = e.target.value;
        SocketEmit('update-input',{input: newval});
    }

    const handleEditorUpdate = useCallback((viewUpdate) => {
        if (viewUpdate.selectionSet) {
            const pos = viewUpdate.state.selection.main.head;
            SocketEmit('update-cursor', { cursor: pos, userid, username });
        }
    }, [SocketEmit, userid, username]);

    const cursorExtension = useMemo(() => {
        const builder = new RangeSetBuilder();
        Object.values(cursors).forEach(({ pos, username, color }) => {
            builder.add(pos, pos, Decoration.widget({
                widget: new CursorWidget(color, username),
                side: 1
            }));
        });
        return EditorView.decorations.of(builder.finish());
    }, [cursors]);

    async function sendcompilereq(){
        setOutputvalue("Submitting..");
        setColor('black');
        try{
            const requestData = {
                code: textvalue,
                input: inputvalue,
                language: language
            };
            const response = await axios.post(apiUrl, requestData);
            setOutputvalue(response.data);
            setColor('black');
        }
        catch(error){
            const errMsg = error.response?.data || error.message;
            setOutputvalue(errMsg);
            setColor('red');
        }
    }

    async function sendsubmitreq(){
        setOutputvalue("Submitting..");
        setColor('black');
        try{
            const requestData = {
                code: textvalue,
                language: language
            };
            if (currentProbId) {
                requestData.problem_id = currentProbId;
            } else if (tests && tests.length > 0) {
                requestData.tests = tests;
            } else {
                setOutputvalue('No tests found');
                setColor('red');
                return;
            }
            const token = localStorage.getItem('token');
            const response = await axios.post(submitUrl, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOutputvalue(response.data);
            setColor(response.data.trim()==="Accepted" ? 'green' : 'red');
        }
        catch(error){
            if (error.response && error.response.status === 401) {
                navigate('/login');
                return;
            }
            const errMsg = error.response?.data || error.message;
            setOutputvalue(errMsg);
            setColor('red');
        }
    }

    function Handlecompile(e) {
        sendcompilereq();
    }

    function Handlesubmit(e) {
        const res = sendsubmitreq();
        console.log(res);
    }
    

    return (
    <div className="editor-wrapper">
        <div className="code-area">
            <div className="language-select">
                <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                </select>
            </div>
            <CodeMirror
                value={textvalue}
                height="100%"
                width="100%"
                onChange={Handlechange}
                onUpdate={handleEditorUpdate}
                extensions={[
                    language === 'cpp'
                        ? cpp()
                        : language === 'python'
                        ? python()
                        : java(),
                    cursorExtension,
                ]}
            />
        </div>
        <div className="io-wrapper">
            <div className="io-section">
                <div className="io-title">Input</div>
                <div className="input-area">
                    <textarea
                        id="input"
                        value={inputvalue}
                        onChange={Handlechangeinput}
                        placeholder="Enter input here"
                    ></textarea>
                </div>
            </div>
            <div className="io-section">
                <div className="io-title">Output</div>
                <pre className="output-area" style={{ color }}>
{String(outputvalue)}
                </pre>
            </div>
            <div className="action-buttons">
                <button onClick={Handlecompile}>Compile</button>
                <button onClick={Handlesubmit}>Submit</button>
            </div>
        </div>
    </div>
    )
}
