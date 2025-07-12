// main.tsx or App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Wrap with Router */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
