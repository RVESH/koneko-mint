import React, { useEffect, useRef, useState } from "react";
import "./Home.scss";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import CTA from "./components/CTA";
import NFTSlider from "./NFTSlider/slideBar";
import NFTPopup from "../../components/NFTPopup/NFTPopup";
// Minor update for contribution test



const Home = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [allNfts, setAllNfts] = useState([]); // Add this state

  // ✅ Added useEffect to load NFT data
  useEffect(() => {
    fetch("/room/metadata.json")
      .then(res => res.json())
      .then(data => {
        setAllNfts(data);
      })
      .catch(console.error);
  }, []);


  const closePopup = () => setSelectedNFT(null);

  const openPopup = (id) => {
    const nft = allNfts.find(n => n.id === id);
    if (nft) setSelectedNFT(nft);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero />

      {/* Featured NFTs Slider */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>🎨 Featured Collections</h2>
            <p>Discover trending digital art and exclusive drops</p>
          </div>
          <NFTSlider onZoomClick={openPopup} /> {/* Fix: Pass openPopup function */}
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* About Section */}
      <About />

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">NFTs Minted</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Happy Collectors</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Unique Artists</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">99%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />

      {/* NFT Popup */}
      {selectedNFT && (
        <NFTPopup nft={selectedNFT} onClose={closePopup} showFromSearch />
      )}
    </div>
  );
};

export default Home;
