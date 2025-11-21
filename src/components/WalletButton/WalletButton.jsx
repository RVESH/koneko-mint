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
    // getNetworkName,
  } = useWalletContext();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const short = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  // dropdown mein masked address (center mein ****)
  const maskedAddress = (addr) =>
    addr ? `${addr.slice(0, 6)} **** ${addr.slice(-4)}` : "";

  // 🔗 Copy helper – secure context + fallback for 192.168 / http
const copyAddress = async () => {
  if (!account) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(account);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = account;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    // ✅ Yahan se “Copied!” show karo
    setCopied(true);
    setTimeout(() => setCopied(false), 500); // 0.5 second ke liye

  } catch (err) {
    console.error("Failed to copy address:", err);
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
                {/* <span className="wb-network">{getNetworkName()}</span> */}
              </div>
            </div>
            <div className="wb-right">
              <span className="wb-address">{short(account)}</span>
              <span className={`wb-chevron ${open ? "wb-chevron--open" : ""}`}>
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
                  {/* yahan sirf masked address show hoga */}
                  <div
                    className="wb-dropdown-address"
                    title={account} // tooltip mein full address
                  >
                    {maskedAddress(account)}
                  </div>
                  {/* <div className="wb-dropdown-network">
                    {getNetworkName()} • {Number(balance || 0).toFixed(4)} ETH
                  </div> */}
                </div>
              </div>

              <div className="wb-dropdown-actions">
                <button
                  type="button"
                  className="wb-btn wb-btn--ghost"
                  onClick={copyAddress}
                >
                {copied ? " Copied!" : " Copy address"}
                </button>
                <button
                  type="button"
                  className="wb-btn wb-btn--danger"
                  onClick={() => {
                    disconnectWallet();
                    setOpen(false);
                  }}
                >
                   Disconnect
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
            {/* <div className="wb-token wb-token--ghost">🦊</div> */}
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
