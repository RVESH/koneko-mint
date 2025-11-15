import React from "react";
import FooterLinks from "../FooterLinks/FooterLinks";
import SocialLinks from "../SocialLinks/SocialLinks";
// import CopyRight from "./CopyRight/CopyRight"; // Jab banado
import "./Footer.scss";

const Footer = () => (
  <footer className="main-footer">
    <div className="footer-row">
      <FooterLinks />
      <SocialLinks />
    </div>
    {/* <CopyRight /> */}
  </footer>
);

export default Footer;
