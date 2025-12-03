// ✅ PRODUCTION READY: src/context/ContractContext.js
// Clean - uses contractService for ALL contract calls
// NO direct window._nftContract, NO iface.getEventTopic, NO duplicates

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWalletContext } from "./WalletContext";
import contractService from "./../services/contractService";

const ContractContext = createContext();
export const useContractContext = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
  const { account, isConnected, chainId } = useWalletContext();

  const [contractsInitialized, setContractsInitialized] = useState(false);
  const [mintFee, setMintFee] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");
  const [userNFTs, setUserNFTs] = useState([]);

  const [isInitializing, setIsInitializing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  // ------------------------------------------------------------------
  // 🔥 AUTO INITIALIZE WHEN WALLET CONNECTS
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isConnected && account && window.ethereum) {
      initializeContracts();
    } else {
      setContractsInitialized(false);
      resetContractData();
    }
  }, [isConnected, account, chainId]);

  useEffect(() => {
    if (contractsInitialized && account) {
      refreshData();
    }
  }, [contractsInitialized, account]);

  // ------------------------------------------------------------------
  // 🔥 INITIALIZE CONTRACTS
  // ------------------------------------------------------------------
  const initializeContracts = async () => {
    try {
      setIsInitializing(true);
      console.log("🔧 Initializing contracts...");

      // Initialize contractService with wallet provider
      const success = await contractService.initialize(window.ethereum);

      if (!success) {
        throw new Error("Contract service initialization failed");
      }

      // Load initial data
      await loadContractInfo();
      await loadUserNFTs();

      setContractsInitialized(true);
      console.log("✅ Contracts initialized successfully");
    } catch (e) {
      console.error("❌ Contract init failed:", e);
      setContractsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 LOAD CONTRACT INFO
  // ------------------------------------------------------------------
  const loadContractInfo = async () => {
    try {
      console.log("📝 Loading contract info...");

      // Get fee from MintController via contractService
      const fee = await contractService.getMintFee();
      
      // Get total supply from ERC721TOKEN via contractService
      const supply = await contractService.getTotalSupply();

      console.log("💰 Mint Fee:", fee, "ETH");
      console.log("📊 Total Supply:", supply);

      setMintFee(fee);
      setTotalSupply(Number(supply));
    } catch (e) {
      console.error("❌ Failed to load contract info:", e);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 LOAD USER NFTS
  // ------------------------------------------------------------------
  const loadUserNFTs = async () => {
    if (!account) return;

    try {
      setIsLoadingNFTs(true);
      console.log("📋 Loading user NFTs...");

      // Get user NFTs from ERC721TOKEN via contractService
      const nfts = await contractService.getUserNFTs(account);

      console.log("✅ NFTs loaded:", nfts.length);
      setUserNFTs(nfts);
    } catch (e) {
      console.error("❌ Failed to loadUserNFTs:", e);
      setUserNFTs([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 MINT NFT
  // ------------------------------------------------------------------
  const mintNFT = async (quantity = 1) => {
    if (!account) throw new Error("Account not connected");

    try {
      setIsMinting(true);
      console.log("💎 Starting mint...");

      // Call contractService which handles MintController
      const receipt = await contractService.mintNFT(account, quantity);

      console.log("✅ Mint successful:", receipt.transactionHash);

      // Refresh data after mint
      await refreshData();

      return receipt;
    } catch (e) {
      console.error("❌ Minting failed:", e);
      throw e;
    } finally {
      setIsMinting(false);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 RESET DATA
  // ------------------------------------------------------------------
  const resetContractData = () => {
    setMintFee("0");
    setTotalSupply("0");
    setUserNFTs([]);
  };

  // ------------------------------------------------------------------
  // 🔥 REFRESH ALL DATA
  // ------------------------------------------------------------------
  const refreshData = async () => {
    if (!account) return;

    console.log("🔄 Refreshing data...");
    await loadContractInfo();
    await loadUserNFTs();
  };

  // ------------------------------------------------------------------
  const value = {
    contractsInitialized,
    mintFee,
    totalSupply,
    userNFTs,
    isInitializing,
    isMinting,
    isLoadingNFTs,
    mintNFT,
    refreshData,
    initializeContracts,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
