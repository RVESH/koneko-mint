// src/app/index.jsx
import React, { useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { WalletProvider } from "../context/WalletContext"; // Add this
import { ContractProvider } from '../context/ContractContext';

import { Header, Footer } from "../components";
import * as pages from '../pages';

// Optional scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <WalletProvider> {/* Wrap everything with WalletProvider */}
      <BrowserRouter>
        <ScrollToTop />
        <Header />
         <ContractProvider>
        <main className="app-main">
          <Routes>
          {/* Default index route */}
          <Route index element={<pages.Home />} />
          {/* Or redirect from “/” */}
            <Route path="/home" element={<pages.Home />} />
            <Route path="/mint" element={<pages.MintPage />} />
            <Route path="/explore" element={<pages.ExplorePage />} />
            <Route path="/profile" element={<pages.ProfilePage />} />
            <Route path="/RandomMint" element={<pages.RandomMint />} />


          </Routes>
        </main>
         </ContractProvider>
        <Footer />
      </BrowserRouter>
    </WalletProvider>
  );
}





export default App;
