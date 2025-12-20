// src/app/index.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import Preloader from "../components/Preloader/Preloader";

import { WalletProvider } from "../context/WalletContext";
import { ContractProvider } from '../context/ContractContext';

import { Header, Footer } from "../components";
import * as pages from '../pages';

// Auto scroll to top when navigating
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function App() {

const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // Simulate wallet + contract loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
    };

    initApp();
  }, []);

  if (loading) return <Preloader />;



  return (
    <WalletProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header />

        <ContractProvider>
          <main className="app-main">
            <Routes>

              {/* Homepage */}
              <Route path="/" element={<pages.Home />} />

              {/* Other pages */}
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
