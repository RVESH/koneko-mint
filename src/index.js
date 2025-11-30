import React from 'react';
import { createRoot } from 'react-dom/client';
import './scss/styles.scss';
import App from './app/index.jsx';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
