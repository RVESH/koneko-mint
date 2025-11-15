import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * WalletContext
 *
 * Behaviour:
 * - No auto-connect on page load.
 * - connectWallet() triggers eth_requestAccounts -> then personal_sign message for login proof.
 * - disconnectWallet() clears app state (and attempts a best-effort permission hint).
 * - Detects MetaMask locked state by calling eth_accounts (returns [] when locked).
 * - Listens to accountsChanged & chainChanged.
 *
 * NOTE: Programmatic full revoke of site permissions isn't reliably exposed by MetaMask to dapps.
 * We clear internal state and suggest user remove site permissions manually if they want a full revoke.
 */

const WalletContext = createContext();

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be used inside WalletProvider");
  return ctx;
};

export const WalletProvider = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState(typeof window !== "undefined" && !!window.ethereum);
  const [isConnected, setIsConnected] = useState(false);   // app-level connected
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState(null);

  // helper: format hex chain id -> friendly
  const getNetworkName = useCallback((chId = chainId) => {
    const map = {
      "0x1": "Ethereum",
      "0x5": "Goerli",
      "0x539": "Ganache (1337)",
      "0x1691": "Ganache (5777)",
      "0xA": "Optimism",
      "0x89": "Polygon",
    };
    return map[String(chId)] || `Chain ${String(chId) || "?"}`;
  }, [chainId]);

  // helper: check if metamask is unlocked (eth_accounts non-empty)
  const isMetaMaskUnlocked = useCallback(async () => {
    try {
      if (!window.ethereum) return false;
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      return Array.isArray(accounts) && accounts.length > 0;
    } catch (e) {
      console.warn("Could not check unlocked:", e);
      return false;
    }
  }, []);

  // fetch balance (uses ethers? we keep simple with eth_getBalance)
  const fetchBalance = useCallback(async (acct) => {
    try {
      if (!window.ethereum || !acct) return;
      const balHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [acct, "latest"]
      });
      // hex to decimal ETH string
      const bn = BigInt(balHex);
      // 1 ETH = 10^18 wei
      const ethStr = Number(bn) / 1e18;
      setBalance(ethStr.toFixed(4));
    } catch (e) {
      console.warn("Fetch balance failed", e);
      setBalance("0");
    }
  }, []);

  // called when user clicks Connect Wallet
  const connectWallet = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // First check unlocked
      // If locked, prompt user to open MetaMask and unlock — we do NOT auto-request accounts.
      const unlocked = await isMetaMaskUnlocked();
      if (!unlocked) {
        throw new Error("MetaMask is locked. Please unlock MetaMask and then press Connect.");
      }

      // Request accounts (this triggers the MetaMask popup)
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from MetaMask");
      }
      const acct = accounts[0];

      // Get chainId
      const ch = await window.ethereum.request({ method: "eth_chainId" });

      // Create a small message for signature login (nonce + timestamp)
      const message = `Koneko Mint login\n\nAddress: ${acct}\nTimestamp: ${Date.now()}\n\nSign this message to authenticate. This will not cost gas.`;
      // Request signature
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, acct]
      });

      // signature present — treat as logged-in
      setAccount(acct);
      setIsConnected(true);
      setChainId(ch);
      await fetchBalance(acct);

      // Optionally store a small proof in sessionStorage (not auto-reconnect)
      sessionStorage.setItem("koneko_login_proof", JSON.stringify({ address: acct, signature, message }));

      // done
      return { account: acct, chainId: ch, signature };
    } catch (e) {
      // friendly messages
      const msg = e?.message || String(e);
      setError(msg);
      // Do NOT auto connect on errors
      console.warn("Connect failed:", e);
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance, isMetaMaskUnlocked]);

  // Disconnect: clear app state. (MetaMask permissions removal cannot reliably be forced)
  const disconnectWallet = useCallback(async () => {
    try {
      // Clear stored proof
      sessionStorage.removeItem("koneko_login_proof");

      // Clear app state
      setAccount(null);
      setIsConnected(false);
      setChainId(null);
      setBalance("0");
      setError(null);

      // Best-effort: ask MetaMask to remove permissions (not guaranteed across providers)
      // Many MetaMask versions don't support programmatic revoke; guiding user to remove site access manually is safest.
      if (window.ethereum?.request) {
        try {
          // This will open a prompt in some wallets; in many it does nothing. Keep it in try/catch.
          await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }]
          });
        } catch (e) {
          // ignore silently
        }
      }
    } catch (e) {
      console.warn("Disconnect procedure error:", e);
    }
  }, []);

  // event handlers
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accounts) => {
      // accounts is an array from MetaMask
      if (!accounts || accounts.length === 0) {
        // locked or disconnected from MetaMask side
        setAccount(null);
        setIsConnected(false);
        setBalance("0");
      } else {
        setAccount(accounts[0]);
        setIsConnected(true);
        fetchBalance(accounts[0]);
      }
    };

    const handleChain = (ch) => {
      setChainId(ch);
    };

    window.ethereum.on && window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on && window.ethereum.on("chainChanged", handleChain);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
      window.ethereum?.removeListener?.("chainChanged", handleChain);
    };
  }, [fetchBalance]);

  // On mount detect metamask installed
  useEffect(() => {
    setIsInstalled(typeof window !== "undefined" && !!window.ethereum);
  }, []);

  const value = {
    // state
    isInstalled,
    isConnected,
    isConnecting,
    account,
    chainId,
    balance,
    error,

    // actions
    connectWallet,
    disconnectWallet,
    fetchBalance,

    // helpers
    isMetaMaskUnlocked,
    getNetworkName
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
