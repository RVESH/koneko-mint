import React, { useEffect, useState } from "react";
import "./Home.scss";
import Features from "./components/Features";
import About from "./components/About";
import CTA from "./components/CTA";
import NFTSlider from "./NFTSlider/slideBar";
import NFTPopup from "../../components/NFTPopup/NFTPopup";
import AnimatedNFT from "./components/AnimatedNFT/animatedNFT";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [allNfts, setAllNfts] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/room/metadata.json")
      .then(res => res.json())
      .then(data => setAllNfts(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✨ Mouse tracking for interactive effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const closePopup = () => setSelectedNFT(null);

  const openPopup = (id) => {
    const nft = allNfts.find(n => n.id === id);
    if (nft) setSelectedNFT(nft);
  };

  const handleStartMinting = () => {
    navigate("/RandomMint");
  };

  const handleExplore = () => {
    navigate("/explore");
  };

  return (
    <div className="home-page">
      {/* ============ PREMIUM HERO SECTION ============ */}
      <section 
        className="hero-premium" 
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        {/* Interactive background with mouse tracking */}
        <div className="hero-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
          <div 
            className="mouse-glow"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
            }}
          ></div>
        </div>

        <div className="hero-content-premium">
          {/* Animated Badge */}
          <div className="hero-badge-premium">
            <span className="badge-dot"></span>
            <span className="badge-text">New Collection Available</span>
          </div>

          {/* Main Title with Split Animation */}
          <h1 className="hero-title-premium">
            <span className="title-word">Own</span>
            <span className="title-word">the</span>
            <span className="title-word">Future</span>
            <br />
            <span className="text-gradient-gold title-word">One</span>
            <span className="text-gradient-gold title-word">Block</span>
            <br />
            <span className="text-gradient-purple title-word">at</span>
            <span className="text-gradient-purple title-word">a</span>
            <span className="text-gradient-purple title-word">Time</span>
          </h1>

          {/* Subtitle with fade effect */}
          <p className="hero-subtitle">
            Limited edition digital characters for collectors who shape tomorrow. 
            <span className="highlight"> Join our community of 5K+ collectors.</span>
          </p>

          {/* Enhanced Buttons with ripple effect */}
          <div className="hero-buttons">
            <button 
              className="btn-hero btn-hero-primary"
              onClick={handleStartMinting}
            >
              <span className="btn-icon">🚀</span>
              <span className="btn-text">Start Minting</span>
              <span className="btn-ripple"></span>
            </button>
            <button 
              className="btn-hero btn-hero-secondary"
              onClick={handleExplore}
            >
              <span className="btn-icon">✨</span>
              <span className="btn-text">Explore Collection</span>
              <span className="btn-ripple"></span>
            </button>
          </div>
             </div>

        {/* Animated NFT Carousel */}
        <AnimatedNFT />
      </section>

      {/* ============ FEATURED SECTION ============ */}
      <section className="featured-section-premium">
        <div className="container">
          <div className="section-header-premium">
            <h2 className="section-title-animated">🎨 Featured Collections</h2>
            <p className="section-subtitle">Curated drops from top creators</p>
          </div>
          <NFTSlider onZoomClick={openPopup} />
        </div>
      </section>

      {/* Feature Components */}
      <Features />
      <About />

      {/* ============ STATS SECTION ============ */}
      <section className="stats-premium">
        <div className="stats-background">
          <div className="stats-orb stats-orb-1"></div>
          <div className="stats-orb stats-orb-2"></div>
        </div>

        <div className="container">
          <h2 className="stats-title">Our Impact</h2>
          <div className="stats-grid-premium">
            <div className="stat-card-premium">
              <div className="stat-icon stat-icon-1">📊</div>
              <div className="stat-number-premium">10K+</div>
              <div className="stat-label-premium">NFTs Minted</div>
              <p className="stat-desc">Growing every day</p>
            </div>

            <div className="stat-card-premium">
              <div className="stat-icon stat-icon-2">👥</div>
              <div className="stat-number-premium">5K+</div>
              <div className="stat-label-premium">Happy Collectors</div>
              <p className="stat-desc">Community driven</p>
            </div>

            <div className="stat-card-premium">
              <div className="stat-icon stat-icon-3">🎨</div>
              <div className="stat-number-premium">500+</div>
              <div className="stat-label-premium">Unique Artists</div>
              <p className="stat-desc">From around world</p>
            </div>

            <div className="stat-card-premium">
              <div className="stat-icon stat-icon-4">✅</div>
              <div className="stat-number-premium">99%</div>
              <div className="stat-label-premium">Success Rate</div>
              <p className="stat-desc">Trust & security</p>
            </div>
          </div>
        </div>
      </section>

      <CTA />

      {selectedNFT && (
        <NFTPopup nft={selectedNFT} onClose={closePopup} showFromSearch />
      )}
    </div>
  );
};

export default Home;
