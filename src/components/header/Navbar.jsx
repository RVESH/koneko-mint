import React, { useState } from 'react';
import "./Navbar.scss";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* Hamburger button for mobile */}


      {/* Navigation menu */}
      <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        <li><a href="/home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
        <li><a href="/explore" onClick={() => setIsMenuOpen(false)}>Explore</a></li>
        <li><a href="/RandomMint" onClick={() => setIsMenuOpen(false)}>Mint NOW</a></li>
        <li><a href="/profile" onClick={() => setIsMenuOpen(false)}>Profile</a></li>
        <li><a href="/supporters" onClick={() => setIsMenuOpen(false)}>Supporters</a></li>
        <li><a href="/guide" onClick={() => setIsMenuOpen(false)}>Guide</a></li>
      </ul>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      {/* Overlay for mobile menu */}


    </nav>
  );
};

export default Navbar;
