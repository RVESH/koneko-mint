// WalletButton.jsx
import React, { useState } from "react";
import { useWalletContext } from "../../context/WalletContext";
import WalletInstallPopup from "./WalletInstallPopup/WalletInstallPopup";
import "./WalletButton.scss";

const WalletButton = ({ className = "" }) => {
  const {
    account,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    getNetworkName,
    showInstallPopup
  } = useWalletContext();

  const [open, setOpen] = useState(false);

  const short = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  if (isConnected && account) {
    return (
      <>
        <div className={`wallet-button connected ${className}`}>
          <button
            className="wallet-display"
            onClick={() => setOpen((s) => !s)}
            title={account}
          >
            <div className="network-info">
              <span className="dot" />
              <span className="balance">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
            <div className="addr">{short(account)}</div>
            <div className="chev">▾</div>
          </button>

          {open && (
            <div className="wallet-dropdown">
              <div className="wallet-full">
                <div className="addr-full">{account}</div>
                <div className="network-name">{getNetworkName()}</div>
              </div>

              <div className="actions">
                <button className="btn small" onClick={() => { navigator.clipboard?.writeText(account); }}>
                  📋 Copy
                </button>
                <button
                  className="btn disconnect small"
                  onClick={() => {
                    disconnectWallet();
                    setOpen(false);
                  }}
                >
                  🔌 Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* install popup component (controlled by context) */}
        <WalletInstallPopup />
      </>
    );
  }

  // Not connected
  return (
    <>
      <button
        className={`wallet-button connect ${className}`}
        onClick={() => connectWallet()}
        disabled={isConnecting}
        title="Connect Wallet"
      >
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>

      {/* install popup component (controlled by context) */}
      <WalletInstallPopup />
    </>
  );
};

export default WalletButton;
