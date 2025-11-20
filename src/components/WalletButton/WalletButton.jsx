// src/components/WalletButton/WalletButton.jsx
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
  } = useWalletContext();

  const [open, setOpen] = useState(false);

  // Short address for chip
  const short = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  // Dropdown me masked address (beech me **** / dots)
  const masked = (addr) => {
    if (!addr) return "";
    const start = addr.slice(0, 6);
    const end = addr.slice(-4);
    // beech ke liye fixed dots
    const hidden = "••••••••";
    return `${start}${hidden}${end}`;
  };

  // Copy address with proper fallbacks
  const handleCopy = async () => {
    if (!account) return;

    try {
      // Modern clipboard API (secure context: https or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(account);
      } else {
        // Fallback textarea trick
        const textarea = document.createElement("textarea");
        textarea.value = account;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      console.log("Wallet address copied:", account);
      // yahan chaaho to toast dikhwa sakte ho
    } catch (err) {
      console.error("Copy failed:", err);
      // worst-case fallback: user ko khud copy karne ke liye prompt
      window.prompt("Copy your wallet address:", account);
    }
  };

  // ---------- CONNECTED ----------
  if (isConnected && account) {
    return (
      <>
        <div className={`wb-wrapper ${className}`}>
          <button
            className="wb-chip wb-chip--connected"
            onClick={() => setOpen((prev) => !prev)}
            title={account}
          >
            <div className="wb-left">
              <div className="wb-token">Ξ</div>
              <div className="wb-balance">
                <span className="wb-balance-value">
                  {Number(balance || 0).toFixed(4)} ETH
                </span>
                <span className="wb-network">{getNetworkName()}</span>
              </div>
            </div>
            <div className="wb-right">
              <span className="wb-address">{short(account)}</span>
              <span
                className={`wb-chevron ${open ? "wb-chevron--open" : ""}`}
              >
                ▾
              </span>
            </div>
          </button>

          {open && (
            <div className="wb-dropdown">
              <div className="wb-dropdown-header">
                <div className="wb-avatar">
                  {account.slice(2, 4).toUpperCase()}
                </div>
                <div className="wb-dropdown-info">
                  {/* 🔒 yahan full address nahi dikh raha, sirf masked */}
                  <div
                    className="wb-dropdown-address"
                    title={account} // hover pe full dikhe, UI me masked
                  >
                    {masked(account)}
                  </div>
                  <div className="wb-dropdown-network">
                    {getNetworkName()} • {Number(balance || 0).toFixed(4)} ETH
                  </div>
                </div>
              </div>

              <div className="wb-dropdown-actions">
                <button
                  className="wb-btn wb-btn--ghost"
                  onClick={handleCopy}
                >
                  📋 Copy address
                </button>
                <button
                  className="wb-btn wb-btn--danger"
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

        <WalletInstallPopup />
      </>
    );
  }

  // ---------- NOT CONNECTED ----------
  return (
    <>
      <div className={`wb-wrapper ${className}`}>
        <button
          className="wb-chip wb-chip--connect"
          onClick={connectWallet}
          disabled={isConnecting}
          title="Connect Wallet"
        >
          <div className="wb-left">
            <div className="wb-token wb-token--ghost">🦊</div>
            <span className="wb-connect-label">
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </span>
          </div>
        </button>
      </div>

      <WalletInstallPopup />
    </>
  );
};

export default WalletButton;
