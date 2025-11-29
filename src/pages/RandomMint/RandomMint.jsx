// src/pages/RandomMint/RandomMint.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWalletContext } from "../../context/WalletContext";
import { useContractContext } from "../../context/ContractContext";
import BulkMintSelector from "./components/BulkMintSelector/BulkMintSelector";
import config from "../../utils/config";
import contractABI from "../../utils/contractABI.json";
import { CONTRACTS } from "../../contracts/config"; // path adjust if necessary
import MINT_CONTROLLER_ABI from "../../contracts/MintController.json"; // path adjust

import "./RandomMint.scss";

const RandomMint = () => {
  const { account, isConnected } = useWalletContext();
  const {
    contractsInitialized,
    isMinting,
    mintNFT,
    mintFee,
    totalSupply,
    userNFTs,
    refreshData,
  } = useContractContext();

  const [isLoading, setIsLoading] = useState(false);
  const [mintedTokenIds, setMintedTokenIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allNfts, setAllNfts] = useState([]);
  const [previewNft, setPreviewNft] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const mintSectionRef = useRef(null);

  const MAX_SUPPLY = 12000;

  // ---------------------- LOAD NFT METADATA ----------------------
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        const response = await fetch("/room/metadata.json");
        const allNFTsData = await response.json();
        setAllNfts(allNFTsData);
        setRandomPreview(allNFTsData);
      } catch (error) {
        console.error("Error loading NFTs:", error);
      }
    };

    const scrollTimer = setTimeout(() => {
      mintSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);

    loadNFTs();
    return () => clearTimeout(scrollTimer);
  }, []);

  const setRandomPreview = (nfts) => {
    if (nfts.length > 0) {
      const randomIndex = Math.floor(Math.random() * nfts.length);
      setPreviewNft(nfts[randomIndex]);
    }
  };

  // ---------------------- BULK MINT HANDLER ----------------------
  // inside RandomMint component — replace handleBulkMint with:
const handleBulkMint = async (quantity) => {
  setError(null);

  if (!isConnected || !account) {
    setError("Please connect your wallet first!");
    return;
  }

  setIsLoading(true);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // USE MintController contract (IMPORTANT)
    const controller = new ethers.Contract(
      CONTRACTS.MINT_CONTROLLER,
      MINT_CONTROLLER_ABI.abi,
      signer
    );

    // Read mint fee (BigInt)
    const mintFee = await controller.getMintFee();
    const totalFee = mintFee * BigInt(quantity);

    let tx;
    if (quantity === 1) {
      tx = await controller.mint(account, { value: totalFee });
    } else {
      tx = await controller.mintBatch(account, quantity, { value: totalFee });
    }

    const receipt = await tx.wait();

    // Decode token IDs
    const iface = new ethers.Interface(MINT_CONTROLLER_ABI.abi);
    const tokenIds = receipt.logs
      .map((log) => {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === "NewMint") {
            return Number(parsed.args.tokenId);
          }
        } catch {}
        return null;
      })
      .filter(Boolean);

    console.log("Minted token IDs:", tokenIds);
    setMintedTokenIds(tokenIds);
    setShowSuccess(true);

    await refreshData();
  } catch (err) {
    console.error("Mint failed:", err);
    setError("Minting failed! Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  const handleQuantityChange = () => setRandomPreview(allNfts);

  const resetMint = () => {
    setShowSuccess(false);
    setMintedTokenIds([]);
    setError(null);
    setRandomPreview(allNfts);
  };

  const availableCount = MAX_SUPPLY - parseInt(totalSupply || 0);

  // ---------------------- RENDER UI ----------------------
  return (
    <div className="random-mint">
      <div className="mint-container">
        <div className="mint-header">
          <h1 className="mint-title">
            <span className="title-icon">🎲</span> Random Mint
          </h1>
          <p className="mint-subtitle">Mint random NFTs</p>
        </div>

        {/* Wallet Status */}
        {isConnected && (
          <div className="wallet-status">
            <span className="status-connected">
              🟢 Wallet: {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            {!contractsInitialized && (
              <div className="status-warning">
                ⚠️ Please switch network
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Available</span>
            <span className="stat-value">{availableCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Minted</span>
            <span className="stat-value">{totalSupply}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Your NFTs</span>
            <span className="stat-value">{userNFTs.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Price</span>
            <span className="stat-value">{mintFee} ETH</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Success or Mint UI */}
        <div ref={mintSectionRef}>
          {showSuccess ? (
            <div className="success-section">
              <div className="success-card">
                <div className="success-icon">🎉</div>
                <h2>Mint Successful!</h2>
                <p>
                  You minted {mintedTokenIds.length} NFT
                  {mintedTokenIds.length > 1 ? "s" : ""}.
                </p>

                <div className="success-stats">
                  <div className="stat">
                    <span className="label">Token IDs:</span>
                    <span className="value">
                      {mintedTokenIds.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="success-actions">
                  <button
                    className="profile-btn"
                    onClick={() => navigate("/profile")}
                  >
                    👤 View in Profile
                  </button>

                  <button
                    className="mint-more-btn"
                    onClick={resetMint}
                    disabled={availableCount === 0}
                  >
                    🎲 Mint More
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <BulkMintSelector
              onQuantityChange={handleQuantityChange}
              onMintClick={handleBulkMint}
              isConnected={isConnected}
              contractsInitialized={contractsInitialized}
              isLoading={isLoading || isMinting}
              nftPrice={parseFloat(mintFee || 0)}
              previewImage={
                previewNft ? `/room/images/${previewNft.filename}` : null
              }
              availableCount={availableCount}
            />
          )}
        </div>

        <div className="bottom-actions">
          <button className="explore-btn" onClick={() => navigate("/explore")}>
            🎨 Explore
          </button>
          <button
            className="refresh-btn"
            onClick={refreshData}
            disabled={!contractsInitialized}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomMint;
