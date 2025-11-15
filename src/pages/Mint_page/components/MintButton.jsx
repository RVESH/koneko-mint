import React from "react";
import "./MintButton.scss";
const MintButton = ({ minting, onMint }) => {
  return (
    <button
      className="btn btn-mint"
      onClick={onMint}
      disabled={minting}
      aria-label="Mint NFT Button"
    >
      {minting ? "Minting..." : "Mint NFT (0.002 OP)"}
    </button>
  );
};

export default MintButton;
