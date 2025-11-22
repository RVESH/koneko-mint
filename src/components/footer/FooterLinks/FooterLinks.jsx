// src/components/FooterLinks/FooterLinks.jsx
import React from "react";

const FooterLinks = () => (
  <nav className="footer-nav" aria-label="Footer navigation">
    <ul className="footer-links">
      <li>
        <a href="/terms.pdf.pdf" target="_blank" rel="noopener noreferrer">
          Koneko&apos;s Terms
        </a>
      </li>
      <li>
        <a href="/privacy">Privacy</a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/faq">FAQ</a>
      </li>
    </ul>
  </nav>
);

export default FooterLinks;
