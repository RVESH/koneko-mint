import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMintedNFTs } from "../../utils/storageHelpers";
import "./NFTPopup.scss";
import zoom from '../../images/zoom.png'; // Import the PNG

const NFTPopup = ({ nft, onClose, showFromSearch = false }) => {
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
        <button className="btn-close" onClick={onClose}>×</button>
        
        <div className="popup-main">
          {/* Image Section */}
          <div className="popup-image-section">
            
            <figure className="popup-image">
              
              <img src={`/room/images/${nft.filename}`} alt={nft.name || `NFT #${nft.id}`} />
              <img className="zoom" src={zoom} alt="zoom"/>

              {isMinted && <span className="tag-owned">OWNED</span>}
            </figure>
          </div>

          {/* Info Section */}
          <div className="popup-info">
            {/* Header */}
            <div className="popup-header-info">
              <h3 className="title">{nft.name || `Character #${nft.id}`}</h3>
              <small className="rarity-badge">RARE</small>
              <small className="id">#{String(nft.id).padStart(5, '0')}</small>
             </div>

            {/* Details Grid - Compact */}
            <dl className="details-grid">
              <div className="detail-item">
                <dt>Price</dt>
                <dd className="price-value">{nft.price || "0.002"} OP</dd>
              </div>
              <div className="detail-item">
                <dt>Status</dt>
                <dd className={`status-badge ${isMinted ? 'minted' : 'available'}`}>
                  {isMinted ? '✓ Minted' : '◆ Available'}
                </dd>
              </div>
              <div className="detail-item">
                <dt>Chain</dt>
                <dd>Optimism</dd>
              </div>
              <div className="detail-item">
                <dt>Collection</dt>
                <dd>Mint Random</dd>
              </div>
            </dl>

            {/* Actions */}
            <div className="actions-container">
              {!isMinted ? (
                <button className="btn-primary" onClick={() => go("/RandomMint")}>
                  🚀 Mint
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => go("/profile")}>
                  👤 Profile
                </button>
              )}
              <button className="btn-outline" onClick={() => go("/explore")}>
                🎨 View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTPopup;
