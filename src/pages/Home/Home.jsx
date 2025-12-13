import React, { useEffect, useState } from "react";
import "./Home.scss";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import CTA from "./components/CTA";
import NFTSlider from "./NFTSlider/slideBar";
import NFTPopup from "../../components/NFTPopup/NFTPopup";
import AnimatedNFT from "./components/AnimatedNFT/animatedNFT";

const Home = () => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [allNfts, setAllNfts] = useState([]);

  useEffect(() => {
    fetch("/room/metadata.json")
      .then(res => res.json())
      .then(data => setAllNfts(data))
      .catch(console.error);
  }, []);

  const closePopup = () => setSelectedNFT(null);

  const openPopup = (id) => {
    const nft = allNfts.find(n => n.id === id);
    if (nft) setSelectedNFT(nft);
  };

  return (
    <div className="home-page">
      {/* Hero Section - Premium */}
      <section className="hero-premium">
        <div className="hero-badge">New Collection Available</div>
        <div className="container">
          <div className="hero-content">
            <h1>
              Own the Future
              <span className="gradient-gold"> One Block</span>
              <span className="gradient-purple"> at a Time</span>
            </h1>
            <p>Limited edition digital characters for collectors who shape tomorrow</p>
          </div>
        </div>
        <AnimatedNFT />
      </section>

      {/* Featured NFTs - Premium Slider */}
      <section className="featured-section-premium">
        <div className="container">
          <NFTSlider onZoomClick={openPopup} />
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* About Section */}
      <About />

      {/* Stats Section - Dark Premium */}
      <section className="stats-section-premium">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card-premium">
              <div className="stat-number">10K+</div>
              <div className="stat-label">NFTs Minted</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Happy Collectors</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-number">500+</div>
              <div className="stat-label">Unique Artists</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-number">99%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <CTA />

      {/* NFT Popup */}
      {selectedNFT && (
        <NFTPopup nft={selectedNFT} onClose={closePopup} showFromSearch />
      )}
    </div>
  );
};

export default Home;
