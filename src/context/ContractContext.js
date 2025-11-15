import React, { createContext, useContext, useState, useEffect } from 'react';
import contractService from '../services/contractService';
import { useWalletContext } from './WalletContext';

const ContractContext = createContext();

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContractContext must be used within ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { account, isConnected, chainId } = useWalletContext();

  const [contractsInitialized, setContractsInitialized] = useState(false);
  const [mintFee, setMintFee] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");
  const [userNFTs, setUserNFTs] = useState([]);
  const [contractInfo, setContractInfo] = useState(null);

  const [isInitializing, setIsInitializing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  // --- Auto initialize when wallet connects ---
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
      loadUserNFTs();
      loadContractInfo();
    }
  }, [contractsInitialized, account]);

  // ---------------------------------------------
  // 🚀 SAFE initializeContracts()
  // ---------------------------------------------
  const initializeContracts = async () => {
    try {
      setIsInitializing(true);

      // 🔐 BLOCK if MetaMask is locked
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0) {
        throw new Error("MetaMask is locked. Please unlock your wallet.");
      }

      await contractService.initialize(window.ethereum);

      setContractsInitialized(true);
      console.log("✅ Contracts initialized");

    } catch (error) {
      console.error("❌ Contract init failed:", error);
      setContractsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Load contract info
  const loadContractInfo = async () => {
    try {
      const info = await contractService.getContractInfo();
      setContractInfo(info);
      setMintFee(info.mintFee);
      setTotalSupply(info.totalSupply);
    } catch (error) {
      console.error('Failed to load contract info:', error);
    }
  };

  // Load NFTs of user
  const loadUserNFTs = async () => {
    if (!account) return;
    try {
      setIsLoadingNFTs(true);
      const nfts = await contractService.getUserNFTs(account);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Failed to load user NFTs:', error);
      setUserNFTs([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // ----------------------------------------------------
  // 🚀 SAFE mintNFT() (Blocks if MetaMask locked)
  // ----------------------------------------------------
  const mintNFT = async (quantity = 1) => {
    if (!account || !contractsInitialized) {
      throw new Error("Wallet not connected or contracts not initialized");
    }

    // 🔐 BLOCK if MetaMask locked
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (!accounts || accounts.length === 0) {
      throw new Error("MetaMask locked. Please unlock wallet before minting.");
    }

    try {
      setIsMinting(true);

      const canMint = await contractService.canUserMint(account);
      if (!canMint) throw new Error("You are not allowed to mint NFTs");

      const receipt = await contractService.mintNFT(account, quantity);

      await Promise.all([
        loadUserNFTs(),
        loadContractInfo()
      ]);

      return receipt;

    } catch (error) {
      console.error("❌ Minting failed:", error);
      throw error;
    } finally {
      setIsMinting(false);
    }
  };

  const resetContractData = () => {
    setMintFee("0");
    setTotalSupply("0");
    setUserNFTs([]);
    setContractInfo(null);
  };

  const refreshData = async () => {
    if (contractsInitialized && account) {
      await Promise.all([loadUserNFTs(), loadContractInfo()]);
    }
  };

  const value = {
    contractsInitialized,
    mintFee,
    totalSupply,
    userNFTs,
    contractInfo,
    isInitializing,
    isMinting,
    isLoadingNFTs,
    mintNFT,
    refreshData,
    initializeContracts
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
