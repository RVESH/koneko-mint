// src/components/Footer/Footer.jsx
import React from "react";
import FooterLinks from "../FooterLinks/FooterLinks";
import SocialLinks from "../SocialLinks/SocialLinks";
import "./Footer.scss";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">🎨</div>
            <div className="footer-title">
              <span className="name">Koneko</span>
              <span className="tagline">Discover & mint unique NFTs</span>
            </div>
          </div>

          <FooterLinks />
          <SocialLinks />
        </div>

        <div className="footer-bottom">
          <span className="copy">
            © {year} Koneko. All rights reserved.
          </span>
          {/* <span className="status">Built with ❤️ on Ethereum.</span> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
