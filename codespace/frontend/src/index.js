import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import App from './App';
import ProblemDetailPage from './pages/ProblemDetailPage';
import process from 'process';

// Polyfill process for browser environment
if (!window.process) {
  window.process = process;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/problems/:id" element={<ProblemDetailPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
