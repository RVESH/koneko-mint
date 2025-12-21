import React from "react";
import FooterLinks from "../FooterLinks/FooterLinks";
import SocialLinks from "../SocialLinks/SocialLinks";
import "./Footer.scss";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="main-footer">
      {/* Animated Background Elements */}
      <div className="footer-bg-elements">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
        <div className="grid-bg"></div>
      </div>

      <div className="footer-inner">
        {/* Top Section - Brand + Links + Social */}
        <div className="footer-top">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <span className="logo-emoji">🎨</span>
              <div className="logo-glow"></div>
            </div>
            
            <div className="brand-content">
              <h3 className="brand-name">Koneko</h3>
              <p className="brand-tagline">Discover & Mint Unique NFTs</p>
              <p className="brand-description">
                Join the creative revolution on Ethereum
              </p>
            </div>
          </div>

          {/* Center - Links & Social */}
          <div className="footer-center">
            <FooterLinks />
            <SocialLinks />
          </div>

          {/* Quick Stats */}
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-number">12K+</span>
              <span className="stat-label">NFTs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Collector</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">koneko</span>
              <span className="stat-label">Creator</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section - Copyright & Legal */}
        <div className="footer-bottom">
          <div className="footer-left">
            <span className="copyright">
              © {year} Koneko. All rights reserved.
            </span>
            <span className="footer-badge">
              <i className="fa-brands fa-ethereum"></i>
              Built on Ethereum
            </span>
          </div>

          <div className="footer-right">
            <a href="/" className="footer-logo-small">
              🎨 Koneko
            </a>
            <p className="footer-credit">
              Made with <span className="heart">❤️</span> by Creative Minds
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
