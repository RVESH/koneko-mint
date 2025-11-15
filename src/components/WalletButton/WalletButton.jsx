import React, { useState } from "react";
import { useWalletContext } from "../../context/WalletContext";
import WalletInstallPopup from "./WalletInstallPopup/WalletInstallPopup"; 
import "./WalletButton.scss";

const WalletButton = () => {
  const {
    account,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    showInstallPopup      // ✅ IMPORTANT
  } = useWalletContext();

  const [open, setOpen] = useState(false);

  const short = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  // ------------------ IF CONNECTED ------------------
  if (isConnected) {
    return (
      <>
        <div className="wallet-wrapper">
          <button className="wallet-btn connected" onClick={() => setOpen(!open)}>
            {balance} ETH — {short(account)}
          </button>

          {open && (
            <div className="wallet-menu">
              <div className="menu-address">{account}</div>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                🔌 Disconnect
              </button>
            </div>
          )}
        </div>

        {/* ✅ Always render here */}
        <WalletInstallPopup />
      </>
    );
  }

  // ------------------ NOT CONNECTED ------------------
  return (
    <>
      <button
        className="wallet-btn connect"
        onClick={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>

      {/* ✅ Popup ALWAYS available */}
      <WalletInstallPopup />
    </>
  );
};

export default WalletButton;
