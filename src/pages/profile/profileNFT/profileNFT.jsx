// src/pages/Profile/profileNFT/profileNFT.jsx
import React from "react";
import "./profileNFT.scss";

const ProfileNFT = ({ userNFTs, onZoomClick }) => {
  if (!userNFTs || userNFTs.length === 0) {
    return (
      <div className="nft-empty">
        <div className="empty-icon">📭</div>
        <h4>No NFTs Yet</h4>
        <p>Start your collection by minting your first NFT!</p>
        <a href="/randomMint" className="explore-btn">
          🎲 Random Mint
        </a>
      </div>
    );
  }

  return (
    <div className="profile-nfts">
      <div className="nfts-header">
        <h3>
          <span className="icon">🖼️</span> Your NFT Collection
        </h3>
        <div className="nfts-count">{userNFTs.length} NFTs</div>
      </div>

      <div className="nft-list">
        {userNFTs.map((nft, index) => (
          <div
            key={nft.tokenId || index}
            className="nft-card"
            onClick={() => onZoomClick(nft)}
          >
            <div className="nft-image-wrapper">
              <img
                src={nft.image}
                alt={nft.name}
                className="nft-image"
                onError={(e) => {
                  e.target.src = `/room/images/${nft.tokenId}.png`;
                }}
              />
              <div className="nft-overlay">
                <span className="minted-badge">✅ Owned</span>
              </div>
            </div>
            <div className="nft-info">
              <div className="nft-title">{nft.name}</div>
              <div className="nft-details">
                <div className="nft-id">Token ID: #{nft.tokenId}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileNFT;
