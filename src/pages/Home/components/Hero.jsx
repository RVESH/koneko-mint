import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span> New Collection Available</span>
          </div>
          <h1>
           Own the Future
            <span className="gradient-text"> One Block at a Time</span>
          </h1>
          <p>
          A once-in-a-lifetime drop of 10,000 exclusive NFTs — designed for pioneers, dreamers, and collectors.
  No second editions. No reruns. When they’re gone, they’re gone forever.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/explore')}
            >
              Explore NFTs
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/RandomMint')}
            >
              Start Minting
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
