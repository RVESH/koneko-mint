// src/components/SocialLinks/SocialLinks.jsx
import React from "react";
import "./SocialLinks.scss";

const SocialLinks = () => (
  <div className="social-links" aria-label="Social media links">
    <a href="#" aria-label="Twitter">
      <i className="fa-brands fa-x-twitter" />
    </a>
    <a href="#" aria-label="Discord">
      <i className="fa-brands fa-discord" />
    </a>
    <a href="#" aria-label="Telegram">
      <i className="fa-brands fa-telegram" />
    </a>
    <a href="#" aria-label="Instagram">
      <i className="fa-brands fa-instagram" />
    </a>
  </div>
);

export default SocialLinks;
