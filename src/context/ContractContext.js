// ✅ ContractContext.js - React Context for Contract State
import React, { createContext, useContext, useState, useCallback } from "react";
import contractService from "../services/contractService";

const ContractContext = createContext();

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used inside ContractProvider");
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("0");
  const [totalSupply, setTotalSupply] = useState(0);
  const [userNFTs, setUserNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [mintFee, setMintFee] = useState("0");

  // ✅ INITIALIZE CONTRACT
  const initialize = useCallback(async (walletProvider) => {
    try {
      setLoading(true);
      setError(null);

      const success = await contractService.initialize(walletProvider);

      if (success) {
        const acc = await contractService.getAccount();
        setAccount(acc);
        setIsConnected(true);

        // Fetch initial data
        await refreshData();
      } else {
        setError("Failed to initialize contract service");
      }
    } catch (e) {
      console.error("Initialize error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ REFRESH ALL DATA
  const refreshData = useCallback(async () => {
    try {
      const acc = await contractService.getAccount();
      const bal = await contractService.getAccountBalance();
      const supply = await contractService.getTotalSupply();
      const fee = await contractService.getMintFee();
      const paused = await contractService.isPaused();
      const nfts = await contractService.getUserNFTs(acc);

      setAccount(acc);
      setBalance(bal);
      setTotalSupply(supply);
      setMintFee(fee.toString());
      setIsPaused(paused);
      setUserNFTs(nfts);
    } catch (e) {
      console.error("Refresh data error:", e);
      setError(e.message);
    }
  }, []);

  // ✅ MINT 1 NFT
  const mint1 = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Starting mint 1 NFT...");
      const receipt = await contractService.mint1();

      console.log("✅ Mint 1 successful!");
      await refreshData();

      return receipt;
    } catch (e) {
      console.error("Mint 1 error:", e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // ✅ MINT 3 NFTs
  const mint3 = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Starting mint 3 NFTs...");
      const receipt = await contractService.mint3();

      console.log("✅ Mint 3 successful!");
      await refreshData();

      return receipt;
    } catch (e) {
      console.error("Mint 3 error:", e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // ✅ MINT 5 NFTs
  const mint5 = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Starting mint 5 NFTs...");
      const receipt = await contractService.mint5();

      console.log("✅ Mint 5 successful!");
      await refreshData();

      return receipt;
    } catch (e) {
      console.error("Mint 5 error:", e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  
  // ✅ MINT 10 NFTs
  const mint10 = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Starting mint 10 NFTs...");
      const receipt = await contractService.mint10();

      console.log("✅ Mint 10 successful!");
      await refreshData();

      return receipt;
    } catch (e) {
      console.error("Mint 10 error:", e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // ✅ DISCONNECT
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setBalance("0");
    setTotalSupply(0);
    setUserNFTs([]);
    setError(null);
  }, []);

  const value = {
    // State
    account,
    isConnected,
    balance,
    totalSupply,
    userNFTs,
    loading,
    error,
    isPaused,
    mintFee,

    // Functions
    initialize,
    refreshData,
    mint1,
    mint3,
    mint5,
    mint10,
    disconnect,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
