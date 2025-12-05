import React from 'react';
import { createRoot } from 'react-dom/client';
import './scss/styles.scss';
import App from './app/index.jsx';
import reportWebVitals from './reportWebVitals';
import { ContractProvider } from './context/ContractContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
      <ContractProvider>

    <App />
      </ContractProvider>

  </React.StrictMode>
);

reportWebVitals();
