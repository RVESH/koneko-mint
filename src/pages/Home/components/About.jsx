import React from "react";

const About = () => {
  return (
    <section className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2>About Koneko Project</h2>
            <p>
              Koneko is a next-generation NFT platform that connects digital artists
              and collectors in an innovative marketplace. We're building the future
              of digital ownership and creative expression.
            </p>
            <p>
              Our mission is to empower creators and provide collectors with
              access to the most exclusive and valuable digital assets in the world.
            </p>
            <div className="about-features">
              <div className="feature-point">
                <span className="checkmark">✓</span>
                <span>Verified Artists Only</span>
              </div>
              <div className="feature-point">
                <span className="checkmark">✓</span>
                <span>Low Gas Fees</span>
              </div>
              <div className="feature-point">
                <span className="checkmark">✓</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="image-placeholder">
              <span>🎨</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
