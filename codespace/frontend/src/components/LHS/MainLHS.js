import React, { useCallback, useEffect, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import Samples from './Samples';

export default function MainLHS({socketRef, externalInput = "", externalSampleInput = "", externalSampleOutput = ""}) {
  const [text, setText] = useState("");
  const [input, setInput] = useState(externalInput); // current raw statement
  const [sampleInput,setSampleInput] = useState(externalSampleInput);
  const [sampleOutput,setSampleOutput] = useState(externalSampleOutput);

  function renderTextWithKaTeX(text) {
    // Normalize multiple dollar signs to exactly two dollar signs
    function normalizeDollarSigns(input) {
        // This regex matches sequences of three or more dollar signs and ensures we only replace them with $$.
        return input.replace(/\${3,}/g, '$$$$');
    }

    // Preprocess text to normalize dollar signs
    const normalizedText = normalizeDollarSigns(text);

    // Patterns for KaTeX and image rendering
    const kaTeXPattern = /\$\$([^$]+)\$\$/g;
    const imagePattern = /\${img:([^}]+)}/g; // Updated image pattern

    const renderedText = normalizedText
        .replace(kaTeXPattern, (match, content) => {
            try {
                const rendered = katex.renderToString(content, {
                    throwOnError: false,
                });
                return `$$${rendered}$$`; // Keep the original formatting inside $$
            } catch (error) {
                console.error("KaTeX rendering error:", error);
                return match; // Return the original text if there's an error
            }
        })
        .replace(imagePattern, (match, link) => {
            return `<img src="${link}" alt="Image" />`; // Render image tag
        });

    // Preserve line breaks and formatting, remove unmatched $$ and escape single $
    return renderedText
        .replace(/\n/g, "<br>")
        .replace(/\t/g, "&nbsp;&nbsp;")
        .replace(/\$\$/g, "")
        .replace(/\$/g, "&#36;");
}

  
  const SocketEmit = useCallback((channel,msg) => {
    if(socketRef.current){
      socketRef.current.emit(channel,{statement:msg});
    }
  }, [socketRef]);

  useEffect(() => {
    if(socketRef.current){
        socketRef.current.on('receive-problem-statement', (payload) => {
          setInput(payload.statement);
        });
    }
  },[socketRef]);

  useEffect(() => { setInput(externalInput); }, [externalInput]);
  useEffect(() => { setSampleInput(externalSampleInput); }, [externalSampleInput]);
  useEffect(() => { setSampleOutput(externalSampleOutput); }, [externalSampleOutput]);

  useEffect(() => {
    console.log("input is " + input);
    setText(renderTextWithKaTeX(input));
    SocketEmit('update-problem-statement',input);
  },[input, SocketEmit]);

  return (
    <div>
      {/* <div style={{ fontSize: '32px', fontWeight: 'bold' , marginBottom: '20  px'}}>{problemName}</div> */}

      <div className='problem-statement'><span id="inline-math" dangerouslySetInnerHTML={{ __html: text }} style={{ fontSize: '18px' }}></span></div>
      {/* <ProblemInputModal text={text} setText={setText} input={input} setInput={setInput}/> */}
      {/* <CopyLinkButton link={sharedlink} /> */}

      {text!=="" && <Samples sampleInput={sampleInput} sampleOutput={sampleOutput}/>}

    </div>
  )
}
