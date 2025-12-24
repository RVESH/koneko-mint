import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletContext } from '../../context/WalletContext';
import WalletButton from '../WalletButton/WalletButton';
import './Header.scss';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isConnected } = useWalletContext();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/explore', label: 'Explore' },
    { path: '/randomMint', label: 'Random Mint' },
    ...(isConnected ? [{ path: '/profile', label: 'Profile' }] : [])
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);
  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/home" className="header-logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">Koneko</span>
        </Link>

        <nav className={`header-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <WalletButton />
          <button
            className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
