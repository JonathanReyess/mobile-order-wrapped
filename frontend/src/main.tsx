import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EmailStatsViewer from './App.tsx';
import Intro from './Intro.tsx'; 
import './index.css'; 

import { inject } from '@vercel/analytics';  
inject();                                    

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/upload" element={<EmailStatsViewer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
