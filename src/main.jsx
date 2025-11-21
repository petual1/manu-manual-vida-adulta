import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { Toaster } from 'sonner'; 
import ThemeProvider from './context/ThemeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {}
    <ThemeProvider>
      <App />
      <Toaster richColors position="bottom-right" /> 
    </ThemeProvider>
  </React.StrictMode>,
);