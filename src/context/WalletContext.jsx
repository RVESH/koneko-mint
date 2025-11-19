// WalletContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be used within WalletProvider");
  return ctx;
};

/* ------- Config / helpers ------- */
const NETWORK_NAMES = {
  "0x1": "Ethereum",
  "0xA": "Optimism",
  "0x89": "Polygon",
  "0x539": "Ganache (1337)",
  "0x1691": "Ganache (5777)",
  "0x38": "BSC"
};

const SIGNATURE_KEY = "koneko_signature_session"; // optional (we won't auto-login with it)

/* ------- Provider ------- */
export const WalletProvider = ({ children }) => {
  // core state
  const [provider, setProvider] = useState(null); // ethers BrowserProvider
  const [signer, setSigner] = useState(null);

  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");

  const [isConnected, setIsConnected] = useState(false); // connected & signature verified
  const [isConnecting, setIsConnecting] = useState(false); // currently connecting
  const [isLocked, setIsLocked] = useState(true); // whether extension currently locked
  const [error, setError] = useState(null);

  // UI control for install popup (shown when no provider detected)
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  const hasEthereum = () => typeof window !== "undefined" && !!window.ethereum;
  const getNetworkName = (cid = chainId) => NETWORK_NAMES[cid] || "Unknown Network";

  /* === create a login message for signature ===
     Every connect triggers a signature; message includes nonce & timestamp.
  */
  const createLoginMessage = (address) => {
    const nonce = Math.floor(Math.random() * 1e9);
    const ts = new Date().toISOString();
    return `Koneko — Sign to login\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${ts}`;
  };

  /* === connectWallet: always forces wallet popup + signature
     1) if window.ethereum missing -> show install popup
     2) call eth_requestAccounts -> will open extension popup
     3) get signer, request signMessage -> require signature to mark connected
  */
const connectWallet = async () => {
  setError(null);

  // No provider -> show install popup
  if (!hasEthereum()) {
    console.log("[wallet] no ethereum provider -> show install popup");
    setShowInstallPopup(true);
    return false;
  }

  setIsConnecting(true);

  try {
    console.log("[wallet] requesting accounts (eth_requestAccounts)...");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      .catch(err => {
        // user closed the popup or provider refused
        console.warn("[wallet] eth_requestAccounts aborted:", err && err.message);
        return null;
      });

    if (!accounts || accounts.length === 0) {
      console.log("[wallet] no accounts returned (user closed popup / locked).");
      return false; // user canceled or wallet locked — behave silently like NFTGO
    }

    const addr = ethers.getAddress(accounts[0]);
    console.log("[wallet] account selected:", addr);

    // create provider + signer
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const signerObj = await browserProvider.getSigner().catch(err => {
      console.warn("[wallet] getSigner failed:", err && err.message);
      return null;
    });

    if (!signerObj) {
      console.warn("[wallet] no signer -> aborting connect");
      return false;
    }

    // store intermediate state (not fully connected until signature is accepted)
    setProvider(browserProvider);
    setSigner(signerObj);
    setAccount(addr);

    // chain & balance
    const cid = await window.ethereum.request({ method: "eth_chainId" }).catch(() => null);
    setChainId(cid || null);
    const bal = await browserProvider.getBalance(addr).catch(() => null);
    if (bal != null) setBalance(ethers.formatEther(bal));

    // SIGNATURE FLOW
    const message = createLoginMessage(addr);
    console.log("[wallet] requesting signature...");
    const signature = await signerObj.signMessage(message).catch(err => {
      // user rejected signature or provider error
      console.warn("[wallet] signature rejected/failed:", err && err.message);
      return null;
    });

    if (!signature) {
      // user rejected signature -> clean intermediate state and return false silently
      console.log("[wallet] user rejected signature — clearing intermediate state");
      setAccount(null);
      setSigner(null);
      setProvider(null);
      setChainId(null);
      setBalance("0");
      setIsConnected(false);
      return false;
    }

    // Success: store session proof (optional)
    try {
      sessionStorage.setItem(SIGNATURE_KEY, JSON.stringify({ address: addr, signature, ts: Date.now() }));
    } catch (_) {}

    setIsConnected(true);
    console.log("[wallet] connected + signature accepted:", addr);
    setError(null);
    return true;

  } catch (err) {
    console.error("[wallet] connectWallet unexpected error:", err);
    setError(err?.message || String(err));
    // best-effort cleanup
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
    setIsConnected(false);
    return false;
  } finally {
    setIsConnecting(false);
  }
};


  /* === disconnectWallet ===
     clear app state. we do not force wallet revoke (wallet UI can do it).
  */
  const disconnectWallet = async () => {
    try {
      // Clear session storage
      try { sessionStorage.removeItem(SIGNATURE_KEY); } catch (_) {}
      setAccount(null);
      setIsConnected(false);
      setProvider(null);
      setSigner(null);
      setChainId(null);
      setBalance("0");
      setIsLocked(true);
      setError(null);
    } catch (e) {
      console.warn("disconnect error", e);
    }
  };

  /* === refreshWalletInfo: update balance & chainId === */
  const refreshWalletInfo = async () => {
    try {
      if (!provider || !account) return;
      const bal = await provider.getBalance(account);
      setBalance(ethers.formatEther(bal));
      if (window.ethereum) {
        const cid = await window.ethereum.request({ method: "eth_chainId" }).catch(() => null);
        setChainId(cid || chainId);
      }
    } catch (e) {
      console.warn("refreshWalletInfo failed", e);
    }
  };

  /* === Event handlers for provider events === */
  const handleAccountsChanged = async (accounts) => {
    try {
      if (!accounts || accounts.length === 0) {
        // user locked or removed permission in extension UI
        await disconnectWallet();
        return;
      }
      const addr = ethers.getAddress(accounts[0]);
      setAccount(addr);
      setIsLocked(false);
      // update signer/provider & balance
      if (window.ethereum) {
        const pb = new ethers.BrowserProvider(window.ethereum);
        setProvider(pb);
        pb.getSigner().then(s => setSigner(s)).catch(() => {});
        pb.getBalance(addr).then(b => setBalance(ethers.formatEther(b))).catch(()=>{});
      }
    } catch (e) {
      console.warn("handleAccountsChanged error", e);
    }
  };

  const handleChainChanged = (cid) => {
    setChainId(cid);
    setTimeout(() => refreshWalletInfo(), 200);
  };

  /* === On mount: detect provider, attach listeners, but DO NOT auto-login ===
     - we read eth_accounts only to detect whether extension is unlocked so UI can show "locked" state
     - we DO NOT treat unlocked as connected; user must explicitly click Connect -> signature
  */
  useEffect(() => {
    if (!hasEthereum()) {
      setIsLocked(true);
      return;
    }

    // attach listeners (remove first to avoid duplicates)
    try {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    } catch (_) {}
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    (async () => {
      try {
        const accs = await window.ethereum.request({ method: "eth_accounts" });
        if (accs && accs.length > 0) {
          setIsLocked(false);
          setAccount(ethers.getAddress(accs[0]));
          // set chainId if available
          const cid = await window.ethereum.request({ method: "eth_chainId" }).catch(() => null);
          setChainId(cid || null);
        } else {
          setIsLocked(true);
        }
      } catch (e) {
        setIsLocked(true);
      }
    })();

    return () => {
      try {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* value exposed to app */
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

    // install popup control
    showInstallPopup,
    setShowInstallPopup
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
