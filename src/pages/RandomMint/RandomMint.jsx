// src/pages/RandomMint/RandomMint.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletContext } from "../../context/WalletContext";
import { useContractContext } from "../../context/ContractContext";
import BulkMintSelector from "./components/BulkMintSelector/BulkMintSelector";
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
    refreshData
  } = useContractContext();

  const [isLoading, setIsLoading] = useState(false);
  const [mintedCount, setMintedCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allNfts, setAllNfts] = useState([]);
  const [previewNft, setPreviewNft] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const mintSectionRef = useRef(null);

  const MAX_SUPPLY = 12000;

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        const response = await fetch("/room/metadata.json");
        const allNFTsData = await response.json();
        setAllNfts(allNFTsData);
        setRandomPreview(allNFTsData);
      } catch (error) {
        console.error('Error loading NFTs:', error);
      }
    };

    // Scroll to mint section on initial load
    const scrollTimer = setTimeout(() => {
      if (mintSectionRef.current) {
        mintSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
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

  const handleBulkMint = async (quantity, totalPrice) => {
    setError(null);

    if (!isConnected || !account) {
      setError('Please connect your wallet first!');
      return;
    }

    if (!contractsInitialized) {
      setError('Contracts not initialized. Please switch to Ganache Local network.');
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Call contract mintNFT for the specified quantity
      const receipt = await mintNFT(quantity);

      console.log('Bulk mint successful:', receipt);

      // Update state with success
      setMintedCount(quantity);
      setShowSuccess(true);

      // Refresh contract data
      await refreshData();

} catch (error) {
  console.error('Bulk minting failed:', error);

  let friendlyMessage = 'Minting failed! Please try again.';

  // Handle common blockchain/Metamask errors cleanly
  if (error.code === 4001) {
    friendlyMessage = 'Transaction rejected by user.';
  } else if (error.message?.includes('insufficient funds')) {
    friendlyMessage = 'Not enough ETH to complete the mint.';
  } else if (error.message?.includes('network') || error.message?.includes('RPC')) {
    friendlyMessage = 'Network issue detected. Please check your connection or RPC.';
  } else if (error.message?.includes('contract not initialized')) {
    friendlyMessage = 'Contracts are not initialized yet.';
  } else if (error.message?.includes('could not coalesce')) {
    friendlyMessage = 'Blockchain node is temporarily unavailable. Try again in a moment.';
  }

  setError(friendlyMessage);
} finally {
  setIsLoading(false);
}

  };

  const handleQuantityChange = (quantity) => {
    setRandomPreview(allNfts);
  };

  const resetMint = () => {
    setShowSuccess(false);
    setMintedCount(0);
    setError(null);
    setRandomPreview(allNfts);
  };

  // Calculate available NFTs (max supply - total minted)
  const availableCount = MAX_SUPPLY - parseInt(totalSupply || 0);

  return (
    <div className="random-mint">
      <div className="mint-container">
        {/* Header */}
        <div className="mint-header">
          <h1 className="mint-title">
            <span className="title-icon">🎲</span>
            Random Mint
          </h1>
          <p className="mint-subtitle">
            Mint random NFTs from our exclusive collection
          </p>
        </div>

        {/* Wallet Status */}
        {isConnected && (
          <div className="wallet-status">
            <span className="status-connected">
              🟢 Wallet Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
            {!contractsInitialized && (
              <div className="status-warning">
                ⚠️ Please switch to Ganache Local network
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Available</span>
            <span className="stat-value">{availableCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Minted</span>
            <span className="stat-value">{totalSupply || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Your NFTs</span>
            <span className="stat-value">{userNFTs.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Price per NFT</span>
            <span className="stat-value">{mintFee || '0'} ETH</span>
          </div>
        </div>

        {/* Error Display */}
        
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Success Message or Bulk Mint Selector */}
        <div ref={mintSectionRef}>
          {showSuccess ? (
            <div className="success-section">
              <div className="success-card">
                <div className="success-icon">🎉</div>
                <h2>NFT{mintedCount > 1 ? 's' : ''} Minted Successfully!</h2>
                <p>
                  {mintedCount} random NFT{mintedCount > 1 ? 's have' : ' has'} been minted on-chain and added to your collection.
                </p>
                <div className="success-stats">
                  <div className="stat">
                    <span className="label">Token IDs:</span>
                    <span className="value">Check your profile</span>
                  </div>
                  <div className="stat">
                    <span className="label">Total Cost:</span>
                    <span className="value">{(parseFloat(mintFee || 0) * mintedCount).toFixed(4)} ETH</span>
                  </div>
                </div>
                <div className="success-actions">
                  <button
                    className="profile-btn"
                    onClick={() => navigate('/profile')}
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
              previewImage={previewNft ? `/room/images/${previewNft.filename}` : null}
              availableCount={availableCount}
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="bottom-actions">
          <button
            className="explore-btn"
            onClick={() => navigate('/explore')}
          >
            🎨 Explore Collection
          </button>
          <button
            className="refresh-btn"
            onClick={refreshData}
            disabled={!contractsInitialized}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomMint;
