// Remove this import:
// import WalletConnect from './WalletConnect';


const MintForm = ({ nft, walletConnected, minting, onMint, mintPrice, error }) => {
  return (
    <div className="mint-form-container">
    

      {/* Keep rest of your mint form */}
      <div className="mint-price">
        Mint Price: <strong>{mintPrice}</strong>
      </div>

      <button
        className="btn btn-mint"
        onClick={onMint}
        disabled={minting || !walletConnected}
      >
        {minting ? "Minting..." : "Mint NFT"}
      </button>

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default MintForm;
