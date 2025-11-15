// WalletContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be used within WalletProvider");
  return ctx;
};

const NETWORK_NAMES = {
  "0x1": "Ethereum",
  "0xA": "Optimism",
  "0x89": "Polygon",
  "0x539": "Ganache (1337)",
  "0x1691": "Ganache (5777)",
  "0x38": "BSC"
};

const SIGNATURE_KEY = "koneko_signed_session"; // session storage key

export const WalletProvider = ({ children }) => {


  const [provider, setProvider] = useState(null); // ethers provider (BrowserProvider)
  const [signer, setSigner] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // assume locked until we confirm
  const [error, setError] = useState(null);

  // Helper: human friendly network name
  const getNetworkName = (cid = chainId) => NETWORK_NAMES[cid] || "Unknown Network";

  // Helper: check MetaMask is available
  const hasEthereum = () => typeof window !== "undefined" && !!window.ethereum;

  // Create ephemeral message (no backend) — include timestamp + random nonce
  const createLoginMessage = (address) => {
    const nonce = Math.floor(Math.random() * 1e9);
    const ts = new Date().toISOString();
    return `Koneko — Sign to confirm ownership\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${ts}`;
  };

  // Connect wallet + signature flow
const connectWallet = async () => {
  setError(null);

  // ⚠️ FIRST CHECK: MetaMask installed or not
  if (typeof window === "undefined" || !window.ethereum) {
    console.warn("MetaMask not detected → Show popup");
    setShowInstallPopup(true);
    return;
  }

  try {
    setIsConnecting(true);

    // 👍 open MetaMask popup
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("Unlock MetaMask to continue");
    }

    const user = ethers.getAddress(accounts[0]);
    setAccount(user);
    setIsLocked(false);

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(browserProvider);

    const signer = await browserProvider.getSigner();
    setSigner(signer);

    const chain = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(chain);

    const bal = await browserProvider.getBalance(user);
    setBalance(ethers.formatEther(bal));

    setIsConnected(true);

  } catch (err) {
    console.error("Connect Wallet Error:", err);

    if (err.code === 4001) setError("User rejected");
    else setError(err.message);

    setAccount(null);
    setIsConnected(false);

  } finally {
    setIsConnecting(false);
  }
};


  // Disconnect: clear local app state & sessionStorage. NOTE: cannot force MetaMask to revoke permissions programmatically.
  const disconnectWallet = async () => {
    // Clear session data
    sessionStorage.removeItem(SIGNATURE_KEY);
    setAccount(null);
    setIsConnected(false);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setBalance("0");
    setIsLocked(true);
    setError(null);

    // Try politely hinting provider to remove permissions (best-effort; not all wallets support programmatic revoke).
    try {
      if (hasEthereum() && window.ethereum.request) {
        // Many wallets do not implement revoke; this is best-effort. If unsupported it will throw and we ignore.
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        });
      }
    } catch (e) {
      // ignore - user can disconnect from MetaMask UI if they want permanent revoke
      console.debug("Permission revoke not supported programmatically.", e?.message);
    }
  };

  // Refresh balance & chain
  const refreshWalletInfo = async () => {
    try {
      if (!provider || !account) return;
      const bal = await provider.getBalance(account);
      setBalance(ethers.formatEther(bal));
      if (window.ethereum) {
        const cid = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(cid);
      }
    } catch (e) {
      console.warn("refreshWalletInfo failed", e);
    }
  };

  // Attach listeners for account / chain changes
  const attachListeners = () => {
    if (!hasEthereum()) return;
    // guard to avoid duplicating handlers
    try {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    } catch (_) {}

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
  };

  const handleAccountsChanged = (accounts) => {
    if (!accounts || accounts.length === 0) {
      // MetaMask locked or user disconnected from extension
      console.log("Accounts empty -> locked or disconnected");
      // we treat this as disconnected: clear app state
      setAccount(null);
      setIsConnected(false);
      setSigner(null);
      setProvider(null);
      setIsLocked(true);
      sessionStorage.removeItem(SIGNATURE_KEY);
    } else {
      const normalized = ethers.getAddress(accounts[0]);
      setAccount(normalized);
      setIsLocked(false);
      // update signer/provider
      if (window.ethereum) {
        const pb = new ethers.BrowserProvider(window.ethereum);
        setProvider(pb);
        pb.getSigner().then(s => setSigner(s)).catch(()=>{});
        pb.getBalance(normalized).then(b => setBalance(ethers.formatEther(b))).catch(()=>{});
      }
    }
  };

  const handleChainChanged = (cid) => {
    console.log("chainChanged ->", cid);
    setChainId(cid);
    // refresh balances with new provider
    setTimeout(() => refreshWalletInfo(), 200);
  };

  // On mount: set locked = true by default and add handlers to detect if user manually changes in MetaMask panel
  useEffect(() => {
    if (!hasEthereum()) {
      setIsLocked(true);
      return;
    }

    // We will not auto-connect. But we can read eth_accounts to know if extension has active accounts (but we won't auto-login).
    (async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          // there is an unlocked session in MetaMask, but we DO NOT auto-connect.
          setIsLocked(false);
          // set account but not 'isConnected' or signer until user actively connects & signs
          setAccount(ethers.getAddress(accounts[0]));
          const cid = await window.ethereum.request({ method: "eth_chainId" }).catch(()=>null);
          setChainId(cid);
        } else {
          setIsLocked(true);
        }
      } catch (e) {
        setIsLocked(true);
      }
    })();

    // attach listeners so UI updates on manual changes
    try { attachListeners(); } catch (e){}

    // cleanup
    return () => {
      try {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      } catch (_) {}
    };
  }, []);

  // Expose context values
  const value = {
    // state
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnected,
    isConnecting,
    isLocked,
    error,

    // actions
    connectWallet,
    disconnectWallet,
    refreshWalletInfo,
    getNetworkName,
          // ⭐ NEW (IMPORTANT)
  showInstallPopup,
  setShowInstallPopup,

  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
