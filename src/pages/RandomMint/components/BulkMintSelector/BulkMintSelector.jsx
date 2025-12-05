import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './BulkMintSelector.scss';

const BulkMintSelector = ({
  isConnected,           // ✅ FROM PARENT (RandomMint)
  isLoading,             // ✅ FROM PARENT
  nftPrice = 0,          // ✅ FROM PARENT
  previewImage,          // ✅ FROM PARENT
  availableCount = 12000, // ✅ FROM PARENT
  onQuantityChange,      // ✅ FROM PARENT
  onMintClick,           // ✅ FROM PARENT
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showPriceAnimation, setShowPriceAnimation] = useState(false);

  const MIN_QUANTITY = 1;
  const MAX_QUANTITY = Math.min(10, availableCount || 0);
  const totalPrice = (quantity * nftPrice).toFixed(6);

  // Animate price change
  useEffect(() => {
    setShowPriceAnimation(true);
    const timer = setTimeout(() => setShowPriceAnimation(false), 300);
    return () => clearTimeout(timer);
  }, [quantity, nftPrice]);

  // Update quantity
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= MIN_QUANTITY && newQuantity <= MAX_QUANTITY) {
      setQuantity(newQuantity);
      onQuantityChange && onQuantityChange(newQuantity);
    }
  };

  const quickSelectOptions = [1, 3, 5, 10].filter(q => q <= MAX_QUANTITY);

  // ✅ HANDLE MINT CLICK
  const handleMintClick = async () => {
    if (!isConnected) {
      alert('❌ Please connect wallet first!');
      return;
    }

    try {
      console.log(`🚀 Minting ${quantity}...`);
      await onMintClick(quantity); // ✅ CALL PARENT FUNCTION
      setQuantity(1); // Reset
    } catch (e) {
      console.error('❌ Mint error:', e.message);
      alert(`Error: ${e.message}`);
    }
  };

  const getMintButtonContent = () => {
    if (!isConnected) return '🔗 Connect Wallet';
    if (isLoading) return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Minting...</span>
      </div>
    );
    if (availableCount === 0) return '❌ Sold Out';
    return `🎲 Mint ${quantity} NFT${quantity > 1 ? 's' : ''}`;
  };

  const isMintDisabled = !isConnected || isLoading || availableCount === 0;

  return (
    <div className="bulk-mint-selector">
      {/* PREVIEW SECTION */}
      <div className="preview-section">
        <div className="mystery-box">
          {previewImage ? (
            <img src={previewImage} alt="Mystery NFT" />
          ) : (
            <div className="mystery-placeholder">
              <span className="mystery-icon">❓</span>
            </div>
          )}
        </div>
        <div className="mystery-info">
          <h3>Random NFTs</h3>
          <p>Mint random NFTs on blockchain — limited collection</p>
        </div>
      </div>

      {/* CONTROLS SECTION */}
      <div className="controls-section">
        {/* Quantity */}
        <div className="quantity-area">
          <div className="quantity-header">
            <span className="dice-icon">🎲</span>
            <span>Select Quantity</span>
          </div>

          <div className="quantity-controls">
            <button
              className="qty-btn decrease"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= MIN_QUANTITY}
            >
              −
            </button>

            <div className="qty-display">
              <div className="qty-number">{quantity}</div>
              <div className="qty-label">NFTs</div>
            </div>

            <button
              className="qty-btn increase"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= MAX_QUANTITY}
            >
              +
            </button>
          </div>

          <div className="quick-select">
            {quickSelectOptions.map(option => (
              <button
                key={option}
                className={`quick-btn ${quantity === option ? 'active' : ''}`}
                onClick={() => handleQuantityChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="price-area">
          <div className="price-label">Total Price</div>
          <div className={`price-amount ${showPriceAnimation ? 'animate' : ''}`}>
            {totalPrice} ETH
          </div>
          <div className="price-calculation">
            {nftPrice.toFixed(6)} × {quantity}
          </div>
        </div>

        {/* Mint Button */}
        <div className="action-area">
          <button
            className={`mint-btn ${!isConnected ? 'connect-btn' : 'primary-btn'}`}
            onClick={handleMintClick}
            disabled={isMintDisabled}
          >
            {getMintButtonContent()}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="features-row">
        <div className="feature-item">
          <span className="feature-icon">⚡</span> On-Chain
        </div>
        <div className="feature-item">
          <span className="feature-icon">💎</span> Unique
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎨</span> Random
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔒</span> Secure
        </div>
      </div>

      {/* Availability */}
      <div className="status-info">
        <div className="info-item">
          <span>Available: {availableCount}</span>
        </div>
        {!isConnected && (
          <div className="info-item warning">
            <span>⚠️ Please connect your wallet to mint</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkMintSelector;
