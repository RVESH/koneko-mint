import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletContext } from "./WalletContext";

import config from "../utils/config";
import contractABI from "../utils/contractABI.json";

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
  // 🔥 INITIALIZE CONTRACT (READ + WRITE)
  // ------------------------------------------------------------------
  const initializeContracts = async () => {
    try {
      setIsInitializing(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        config.contractAddress,
        contractABI,
        signer
      );

      window._nftContract = contract;
      window._readProvider = provider;

      setContractsInitialized(true);
    } catch (e) {
      console.error("Contract init failed:", e);
    } finally {
      setIsInitializing(false);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 LOAD CONTRACT INFO
  // ------------------------------------------------------------------
  const loadContractInfo = async () => {
    if (!window._nftContract) return;

    try {
      const contract = window._nftContract;

      const fee = await contract.mintFee();
      const supply = await contract.totalSupply();

      setMintFee(ethers.formatEther(fee));
      setTotalSupply(Number(supply));
    } catch (e) {
      console.error("Failed to load contract info:", e);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 LOAD USER NFTS (WORKS FOR ALL CONTRACT TYPES)
  // ------------------------------------------------------------------
  const loadUserNFTs = async () => {
    if (!account || !window._nftContract || !window._readProvider) return;

    try {
      setIsLoadingNFTs(true);

      const provider = window._readProvider;
      const contract = window._nftContract;

      // Check if ERC721Enumerable exists
      const isEnumerable =
        typeof contract.tokenOfOwnerByIndex === "function";

      let owned = [];

      if (isEnumerable) {
        // ⭐ BEST WAY
        const balance = await contract.balanceOf(account);
        const total = Number(balance);

        for (let i = 0; i < total; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(account, i);
          owned.push({ tokenId: Number(tokenId), owner: account });
        }
      } else {
        // ⭐ FALLBACK: READ TRANSFER LOGS
        const iface = new ethers.Interface(contractABI);

        const logs = await provider.getLogs({
          address: config.contractAddress,
          fromBlock: 0,
          toBlock: "latest",
          topics: [iface.getEventTopic("Transfer")],
        });

        const tokens = logs
          .map((log) => {
            try {
              const decoded = iface.parseLog(log);
              if (
                decoded.args.to.toLowerCase() === account.toLowerCase()
              ) {
                return Number(decoded.args.tokenId);
              }
            } catch {}
            return null;
          })
          .filter(Boolean);

        const unique = [...new Set(tokens)];
        owned = unique.map((id) => ({
          tokenId: id,
          owner: account,
        }));
      }

      setUserNFTs(owned);
    } catch (e) {
      console.error("Failed to loadUserNFTs:", e);
      setUserNFTs([]);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // ------------------------------------------------------------------
  // 🔥 MINT NFT
  // ------------------------------------------------------------------
  const mintNFT = async (quantity = 1) => {
    if (!window._nftContract) throw new Error("Contract not initialized");

    const contract = window._nftContract;

    try {
      setIsMinting(true);

      const fee = await contract.mintFee();
      const totalPrice = fee * BigInt(quantity);

      const tx = await contract.mint(quantity, { value: totalPrice });
      const receipt = await tx.wait();

      await refreshData();

      return receipt;
    } catch (e) {
      console.error("Minting failed:", e);
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
    if (!window._nftContract || !account) return;

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
