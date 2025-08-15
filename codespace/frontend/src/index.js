import React from 'react';
import ReactDOM from 'react-dom/client';
// import './styles/index.css';
import App from './App';
import process from 'process';

// Polyfill process for browser environment
if (!window.process) {
  window.process = process;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
