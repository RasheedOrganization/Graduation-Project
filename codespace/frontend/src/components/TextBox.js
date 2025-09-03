import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/App.css';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config';

// Replace with the URL you want to send the request to
const apiUrl = `${BACKEND_URL}/test`; // compilation sandbox endpoint
const submitUrl = `${BACKEND_URL}/submit`;

const defaultCpp = "#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n int t;\n cin >> t;\n while(t--){\n\n }\n}";
const defaultPython = `import sys\n\n\ndef solve():\n    pass\n\n\ndef main():\n    t = int(sys.stdin.readline())\n    for _ in range(t):\n        solve()\n\n\nif __name__ == "__main__":\n    main()\n`;

const defaultJava = `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        int t = Integer.parseInt(br.readLine());\n        while (t-- > 0) {\n            // TODO: solve\n        }\n    }\n}\n`;
export default function TextBox({socketRef,currentProbId,onCodeChange}) {
    console.log('I am textbox and the current problem id is ' + currentProbId);
    const [language, setLanguage] = useState('cpp');
    const [textvalue, setTextvalue] = useState(defaultCpp);
    const [inputvalue, setInputvalue] = useState('');
    const [outputvalue, setOutputvalue] = useState('');
    const [color, setColor] = useState('black');
    const navigate = useNavigate();

    const SocketEmit = useCallback((channel,msg) => {
        if(socketRef.current){
            socketRef.current.emit(channel,{code:msg});
        }
    }, [socketRef]);

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
        // Ensure outputvalue is treated as a string before any string operations
        const outputStr = String(outputvalue);
        console.log(`outputvalue changed to ${outputStr}`);

        if(outputStr === "Submitting.." || outputStr === ""){
            setColor('black');
        }
        else{
            setColor(outputStr.trim()==="Accepted" ? 'green' : 'red');
        }
      }, [outputvalue]);


    const Handlechange = useCallback((val, viewUpdate) => {
        setTextvalue(val);
        SocketEmit('update-code',val);
        onCodeChange && onCodeChange(val);
    }, [SocketEmit,onCodeChange]);

    function handleLanguageChange(newLang){
        setLanguage(newLang);
        const template = newLang === 'cpp' ? defaultCpp : newLang === 'python' ? defaultPython : defaultJava;
        setTextvalue(template);
        SocketEmit('update-code',template);
        onCodeChange && onCodeChange(template);
    }

    function Handlechangeinput(e) {
        setInputvalue(e.target.value);
        const newval = e.target.value;
        SocketEmit('update-input',newval);
    }

    async function sendcompilereq(){
        setOutputvalue("Submitting..");
        try{
            const requestData = {
                code: textvalue,
                input: inputvalue,
                language: language
            };
            const response = await axios.post(apiUrl, requestData);
            setOutputvalue(response.data);
        }
        catch(error){
            setOutputvalue(error.message);
        }
    }

    async function sendsubmitreq(){
        setOutputvalue("Submitting..");
        try{
            const requestData = {
                code: textvalue,
                problem_id: currentProbId,
                language: language
            };
            const token = localStorage.getItem('token');
            const response = await axios.post(submitUrl, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOutputvalue(response.data);
        }
        catch(error){
            if (error.response && error.response.status === 401) {
                navigate('/login');
                return;
            }
            setOutputvalue(error.message);
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
                extensions={[
                    language === 'cpp'
                        ? cpp()
                        : language === 'python'
                        ? python()
                        : java()
                ]}
            />
        </div>
        <div className="io-wrapper">
            <div className="input-area">
                <textarea
                    id="input"
                    value={inputvalue}
                    onChange={Handlechangeinput}
                    placeholder="Enter input here"
                ></textarea>
            </div>
            <div className="output-area" style={{ color }}>
                Output: {String(outputvalue)}
            </div>
            <div className="action-buttons">
                <button onClick={Handlecompile}>Compile</button>
                <button onClick={Handlesubmit}>Submit</button>
            </div>
        </div>
    </div>
    )
}
