import React from "react";
import "./FooterLinks.scss";

const FooterLinks = () => (
  <nav className="footer-nav" aria-label="Footer navigation">
    <ul className="footer-links">
      <li>
        <a 
          href="/terms.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link-item"
          data-label="Terms"
        >
          <span className="link-icon">
            <i className="fa-solid fa-file-contract"></i>
          </span>
          <span className="link-text">Koneko&apos;s Terms</span>
        </a>
      </li>
      <li>
        <a 
          href="/privacy"
          className="footer-link-item"
          data-label="Privacy"
        >
          <span className="link-icon">
            <i className="fa-solid fa-shield"></i>
          </span>
          <span className="link-text">Privacy</span>
        </a>
      </li>
      <li>
        <a 
          href="/about"
          className="footer-link-item"
          data-label="About"
        >
          <span className="link-icon">
            <i className="fa-solid fa-circle-info"></i>
          </span>
          <span className="link-text">About</span>
        </a>
      </li>
      <li>
        <a 
          href="/faq"
          className="footer-link-item"
          data-label="FAQ"
        >
          <span className="link-icon">
            <i className="fa-solid fa-circle-question"></i>
          </span>
          <span className="link-text">FAQ</span>
        </a>
      </li>
    </ul>
  </nav>
);

export default FooterLinks;
