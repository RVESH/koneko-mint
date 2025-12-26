import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMintedNFTs } from "../../utils/storageHelpers";
import "./NFTPopup.scss";
import ImageModal from "../ImageModal/imageModal.jsx";

const NFTPopup = ({ nft, onClose, showFromSearch = false }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const mintedList = getMintedNFTs();
  const isMinted = mintedList.some(m => m.id === nft.id);

  useEffect(() => {
    const handler = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const go = path => {
    onClose();
    navigate(path);
  };

  return (
    <div className="nft-popup-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nft-popup-card">
        <button className="btn-close" onClick={onClose} aria-label="Close">×</button>

        <div className="popup-main">
          {/* Image Section */}
          <div className="popup-image-section" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <figure className="popup-image">
              <img
                src={`/room/images/${nft.filename}`}
                alt={nft.name || `NFT #${nft.id}`}
                className="nft-img"
              />
              
              <button
                className="zoom-btn"
                onClick={() => setIsImageOpen(true)}
                aria-label="Zoom image"
                style={{ opacity: isHovering ? 1 : 0.7 }}
              >
                🔍
              </button>

              {isMinted && <span className="tag-owned">✓ OWNED</span>}
            </figure>
          </div>

          {/* Info Section */}
          <div className="popup-info">
            {/* Header */}
            <div className="popup-header-info">
              <h3 className="title">{nft.name || `Character #${nft.id}`}</h3>
              <div className="badges-row">
                <span className="badge-rarity">⭐ RARE</span>
                <span className="badge-id">#{String(nft.id).padStart(5, '0')}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">💎 Price</span>
                <span className="detail-value price">{nft.price || "0.002"} OP</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🎯 Status</span>
                <span className={`detail-value status ${isMinted ? 'minted' : 'available'}`}>
                  {isMinted ? '✓ Minted' : '◆ Available'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🔗 Chain</span>
                <span className="detail-value">Optimism</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📦 Collection</span>
                <span className="detail-value">Koneko</span>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-container">
              {!isMinted ? (
                <button className="btn-primary" onClick={() => go("/RandomMint")}>
                  🚀 Mint Now
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => go("/profile")}>
                  👤 Profile
                </button>
              )}
              <button className="btn-outline" onClick={() => go("/explore")}>
                🎨 Explore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal nft={nft} isOpen={isImageOpen} onClose={() => setIsImageOpen(false)} />
    </div>
  );
};

export default NFTPopup;
