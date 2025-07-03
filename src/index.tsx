import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OpenCollidoscopeApp from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <OpenCollidoscopeApp />
  </React.StrictMode>
);