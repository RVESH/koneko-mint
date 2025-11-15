// src/components/WalletButton/WalletButton.jsx
import React, { useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import WalletInstallPopup from "./WalletInstallPopup/WalletInstallPopup";
import "./WalletButton.scss";

const WalletButton = ({ className = "" }) => {
  const {
    isInstalled,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    account,
    balance,
    getNetworkName,
    chainId,
    error
  } = useWallet();

  const [open, setOpen] = useState(false);

  const truncate = (s) => s ? `${s.slice(0,6)}…${s.slice(-4)}` : "";

  if (!isInstalled) {
    return <WalletInstallPopup />;
  }

  if (isConnected && account) {
    return (
      <div className={`wallet-button connected ${className}`}>
        <div className="wallet-display" onClick={() => setOpen(!open)}>
          <div className="wallet-info">
            <div className="network-info">
              <span className="network-dot" />
              <span className="balance">{balance} ETH</span>
            </div>
            <div className="address">{truncate(account)}</div>
          </div>
          <div className="dropdown-arrow">▾</div>
        </div>

        {open && (
          <div className="wallet-dropdown">
            <div className="dropdown-header">
              <div className="account-info">
                <div className="address-full">{account}</div>
                <div className="network">{getNetworkName(chainId)}</div>
              </div>
            </div>

            <div className="dropdown-actions">
              <button className="dropdown-btn" onClick={() => navigator.clipboard.writeText(account)}>📋 Copy</button>
              <button className="dropdown-btn disconnect" onClick={() => { disconnectWallet(); setOpen(false); }}>🔌 Disconnect</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not connected state
  return (
    <>
      <button className={`wallet-button connect ${className}`} onClick={connectWallet} disabled={isConnecting}>
        {isConnecting ? <span>Connecting…</span> : <span>Connect Wallet</span>}
      </button>
      <WalletInstallPopup />
      {error && <div className="wallet-error">{error}</div>}
    </>
  );
};

export default WalletButton;
