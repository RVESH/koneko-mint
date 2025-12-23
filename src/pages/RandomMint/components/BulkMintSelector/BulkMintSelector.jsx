import React, { useState, useEffect } from 'react';
import './BulkMintSelector.scss';

const BulkMintSelector = ({
  isConnected,
  isLoading,
  nftPrice = 0,
  previewImage,
  availableCount = 12000,
  onQuantityChange,
  onMintClick,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [animate, setAnimate] = useState(false);

  const MAX_QTY = Math.min(10, availableCount || 0);
  const total = (quantity * nftPrice).toFixed(6);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [quantity, nftPrice]);

  const handleQty = (n) => {
    if (n >= 1 && n <= MAX_QTY) {
      setQuantity(n);
      onQuantityChange?.(n);
    }
  };

  const handleMint = async () => {
    if (!isConnected) return alert('Connect wallet first!');
    try {
      await onMintClick(quantity);
      setQuantity(1);
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  const btnText = !isConnected 
    ? '🔗 Connect Wallet'
    : isLoading 
    ? '⏳ Minting...'
    : availableCount === 0 
    ? '❌ Sold Out'
    : `🎲 Mint ${quantity}`;

  return (
    <div className="mint-card">
      {/* Header */}
      <div className="mint-header">
        <div className="preview">
          {previewImage ? (
            <img src={previewImage} alt="NFT" />
          ) : (
            <div className="empty">🎲</div>
          )}
        </div>
        <div className="info">
          <h2>Random Koneko</h2>
          <p>Limited • Unique • Secure</p>
          <div className="stats">
            <span>{availableCount} Available</span>
            <span>{nftPrice.toFixed(4)} ETH</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="control-box">
          <label>Quantity</label>
          <div className="qty-row">
            <button onClick={() => handleQty(quantity - 1)} disabled={quantity === 1}>−</button>
            <div className="qty-num">{quantity}</div>
            <button onClick={() => handleQty(quantity + 1)} disabled={quantity === MAX_QTY}>+</button>
          </div>
          <div className="quick">
            {[1, 3, 5, 10].filter(q => q <= MAX_QTY).map(q => (
              <button
                key={q}
                className={quantity === q ? 'active' : ''}
                onClick={() => handleQty(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="control-box">
          <label>Total Price</label>
          <div className={`price ${animate ? 'pulse' : ''}`}>{total} ETH</div>
          <div className="breakdown">{nftPrice.toFixed(6)} × {quantity}</div>
        </div>
      </div>

      {/* Mint Button */}
      <button
        className={`mint-btn ${!isConnected ? 'connect' : ''}`}
        onClick={handleMint}
        disabled={!isConnected || isLoading || availableCount === 0}
      >
        {btnText}
      </button>

      {/* Status */}
      <div className={`status ${
        !isConnected ? 'warn' : availableCount === 0 ? 'danger' : 'ok'
      }`}>
        {!isConnected ? '⚠️ Connect wallet' : availableCount === 0 ? '❌ Sold out' : '✅ Ready'}
      </div>

      {/* Features */}
      <div className="features">
        {[
          { icon: '⚡', name: 'Instant' },
          { icon: '💎', name: 'Unique' },
          { icon: '🎨', name: 'Random' },
          { icon: '🔒', name: 'Secure' },
        ].map(f => (
          <div key={f.name} className="feat">
            <div>{f.icon}</div>
            <div>{f.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkMintSelector;
