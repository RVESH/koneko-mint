// mintSuccess.jsx
import React from "react";
import PropTypes from "prop-types";
import "./MintSuccess.scss";

function MintSuccess({ mintedNFT, onClose, isAlreadyMinted }) {
  // First check if already minted
  if (isAlreadyMinted) {
    return (
      <div className="mint-page-container">
        <h1 className="page-title">NFT Already Minted</h1>
        <p className="already-minted-msg">
          This NFT has already been minted and is no longer available.
        </p>
      </div>
    );
  }

  // Then check if no minted NFT data
  if (!mintedNFT) return null;

  // Show success page
  return (
    <div className="mint-success-container">
      <h1 className="page-title">🎉 NFT Minted Successfully!</h1>
      <p className="success-message">
        Your NFT has been minted and added to your profile.
      </p>
      <div className="minted-nft-preview">
        <img src={mintedNFT.image} alt={mintedNFT.name} />
        <h3>{mintedNFT.name}</h3>
        <p>Token ID: #{mintedNFT.tokenId}</p>
      </div>
      <button className="btn btn-close" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

MintSuccess.propTypes = {
  mintedNFT: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tokenId: PropTypes.number.isRequired,
  }),
  isAlreadyMinted: PropTypes.bool,
  onClose: PropTypes.func ,
};

MintSuccess.defaultProps = {
  isAlreadyMinted: false,
};

export default MintSuccess;
