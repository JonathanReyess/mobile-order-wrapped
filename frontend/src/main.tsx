import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EmailStatsViewer from './App.tsx';
import Intro from './Intro.tsx'; // ✅ import your intro page
import './index.css'; // ✅ import your CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />        {/* Intro animation page */}
        <Route path="/upload" element={<EmailStatsViewer />} /> {/* Upload interface */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
