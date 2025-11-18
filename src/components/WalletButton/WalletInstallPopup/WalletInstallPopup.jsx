// src/components/WalletButton/WalletInstallPopup/WalletInstallPopup.jsx
import React from "react";
import { useWalletContext } from "../../../context/WalletContext";
import "./WalletInstallPopup.scss";

const WalletInstallPopup = () => {
  const { showInstallPopup, setShowInstallPopup } = useWalletContext();

  if (!showInstallPopup) return null;

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'The most popular Ethereum wallet',
      features: ['Browser Extension', 'Mobile App', 'Hardware Wallet Support'],
      installUrl: 'https://metamask.io/download/',
      mobileUrl: {
        ios: 'https://apps.apple.com/app/metamask/id1438144202',
        android: 'https://play.google.com/store/apps/details?id=io.metamask'
      },
      color: '#f6851b'
    },
    {
      name: 'TrustWallet',
      icon: '🛡️',
      description: 'Secure multi-chain wallet',
      features: ['Mobile First', 'Multi-Chain Support', 'DeFi Integration'],
      installUrl: 'https://trustwallet.com/download',
      mobileUrl: {
        ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
        android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
      },
      color: '#3375bb'
    }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowInstallPopup(false);
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const getInstallUrl = (wallet) => {
    if (isMobile()) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      return isIOS ? wallet.mobileUrl.ios : wallet.mobileUrl.android;
    }
    return wallet.installUrl;
  };

  return (
    <div className="wallet-install-overlay" onClick={handleBackdropClick}>
      <div className="wallet-install-popup">
        <div className="popup-header">
          <h2>Connect Your Wallet</h2>
          <p>To start minting NFTs, you'll need a crypto wallet</p>
          <button
            className="close-btn"
            onClick={() => setShowInstallPopup(false)}
          >
            ✕
          </button>
        </div>

        <div className="wallet-options">
          {walletOptions.map((wallet, index) => (
            <div key={index} className="wallet-option" style={{'--accent-color': wallet.color}}>
              <div className="wallet-header">
                <div className="wallet-icon">{wallet.icon}</div>
                <div className="wallet-info">
                  <h3>{wallet.name}</h3>
                  <p>{wallet.description}</p>
                </div>
              </div>

              <div className="wallet-features">
                {wallet.features.map((feature, idx) => (
                  <span key={idx} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="install-actions">
                <a
                  href={getInstallUrl(wallet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="install-btn"
                >
                  <span className="install-icon">⬇️</span>
                  Install {wallet.name}
                </a>

                {!isMobile() && (
                  <div className="mobile-options">
                    <span className="mobile-label">Mobile:</span>
                    <a
                      href={wallet.mobileUrl.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-btn ios"
                    >
                      📱 iOS
                    </a>
                    <a
                      href={wallet.mobileUrl.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-btn android"
                    >
                      🤖 Android
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="popup-footer">
          <div className="security-note">
            <div className="security-icon">🔒</div>
            <div className="security-text">
              <h4>Your Security Matters</h4>
              <p>Only download wallets from official websites and app stores</p>
            </div>
          </div>

          <div className="help-section">
            <h4>Need Help?</h4>
            <div className="help-links">
              <a href="https://ethereum.org/en/wallets/" target="_blank" rel="noopener noreferrer">
                📚 Learn about wallets
              </a>
              <a href="https://support.metamask.io/" target="_blank" rel="noopener noreferrer">
                ❓ MetaMask Help
              </a>
              <a href="https://community.trustwallet.com/" target="_blank" rel="noopener noreferrer">
                💬 TrustWallet Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletInstallPopup;
