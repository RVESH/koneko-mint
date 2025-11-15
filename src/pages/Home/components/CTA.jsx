import React from "react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2>Ready to Start Your NFT Journey?</h2>
          <p>Join thousands of creators and collectors in the ArtBird community</p>
          <div className="cta-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/RandomMint')}
            >
              Mint Your First NFT
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.open('https://discord.gg/artbird', '_blank')}
            >
              Join Community
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
