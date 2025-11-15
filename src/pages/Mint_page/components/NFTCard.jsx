import React from "react";
import "./NFTCard.scss";
const NFTCard = ({ nft }) => {
  if (!nft) return null;
  return (
    <div className="nft-card">

    <img src={`/room/images/${nft.filename} `}  alt={`NFT ${nft.id}`} alt={nft.name} />

      <div className="nft-details">
        <h3>{nft.name}</h3>
        <p>Token ID: <code>#{nft.id}</code></p>
        <p className="chain-name">Optimism Chain</p>
      </div>
    </div>
  );
};

export default NFTCard;
