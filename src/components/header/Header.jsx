// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletContext } from '../../context/WalletContext';
import WalletButton from '../WalletButton/WalletButton'; // Direct import
import './Header.scss';




// Add this in your Header component temporarily:
// <TestWalletPopup />






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

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/home" className="header-logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">Koneko</span>
        </Link>

        <nav className="header-nav desktop-nav">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <WalletButton />

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="header-nav mobile-nav">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
