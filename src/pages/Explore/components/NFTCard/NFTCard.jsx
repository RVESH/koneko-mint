import React from "react";
import PropTypes from "prop-types";

import "./NFTCard.scss";
import { useNavigate } from "react-router-dom";
import { getMintedNFTs } from "../../../../utils/storageHelpers";

const NFTCard = ({ nft, onZoomClick }) => {
  const navigate = useNavigate();
  const mintedNFTs = getMintedNFTs(); // Use helper function
  const isMinted = mintedNFTs.includes(nft.id);

  const handleCardClick = () => {
    if (!isMinted) {
      navigate(`/RandomMint`); // Fixed route case
    }
  };

  const handleZoomClick = (e) => {
    e.stopPropagation();
    if (onZoomClick) { // Check if onZoomClick exists
      onZoomClick(nft);
    }
  };
  return (
    <div
      className={`nft-card ${isMinted ? "minted" : ""}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >

    {/* Zoom Button - only show if onZoomClick prop exists */}



      <div className="nft-image-wrapper">
        <img
          src={`/room/images/${nft.filename}`}
          alt={nft.name || `NFT ${nft.id}`}
          onClick={handleZoomClick}

          className="nft-image"
        />
        {isMinted && (
          <div className="nft-overlay">
            <span className="minted-badge">✅ Minted</span>
          </div>
        )}
      </div>

      <div className="nft-info">
        <h3 className="nft-title">{nft.name || `NFT #${nft.id}`}</h3>
        <div className="nft-details">
          <p className="nft-id">TOKEN ID: {nft.id}</p>
          <p className="nft-price">
            _____ {nft.price ?? "0.002"} OP
          </p>
        </div>


      </div>
    </div>
  );
};

NFTCard.propTypes = {
  nft: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    filename: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onZoomClick: PropTypes.func // Optional function
};
export default NFTCard;
