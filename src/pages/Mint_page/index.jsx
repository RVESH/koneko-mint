import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers"; // ✅ use ethers instead of web3
import { useWalletContext } from "../../context/WalletContext";
import { useContractContext } from "../../context/ContractContext";
import config from "../../utils/config";
import contractABI from "../../utils/contractABI.json";

import MintForm from "./components/MintForm";
import NFTCard from "./components/NFTCard";
import MintSuccess from "./mintSuccess/MintSuccess";
import WalletButton from "../../components/WalletButton/WalletButton";
import { CONTRACTS } from "../../contracts/config";
import MINT_CONTROLLER_ABI from "../../contracts/MintController.json";
import "./style.scss";

const MintPage = () => {
  const { account, isConnected } = useWalletContext();
  const {
    contractsInitialized,
    isMinting,
    userNFTs,
    refreshData,
  } = useContractContext();

  const [minting, setMinting] = useState(false);
  const [error, setError] = useState(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [nfts, setNfts] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const nftId = Number(id);

  useEffect(() => {
    fetch("/room/metadata.json")
      .then(res => res.json())
      .then(setNfts)
      .catch(console.error);
  }, []);

  const selectedNFT = nfts.find(nft => nft.id === nftId);
  const isAlreadyMinted = userNFTs.some(n => (n.tokenId) === Number(nftId));

  // inside MintPage component — replace handleMint with:
const handleMint = async (quantity = 1) => {
  setError(null);

  if (!isConnected || !account) {
    alert("Please connect your wallet");
    return;
  }

  setMinting(true);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const controller = new ethers.Contract(
      CONTRACTS.MINT_CONTROLLER,
      MINT_CONTROLLER_ABI.abi,
      signer
    );

    const mintFee = await controller.getMintFee();
    const totalFee = mintFee * BigInt(quantity);

    let tx;
    if (quantity === 1) {
      tx = await controller.mint(account, { value: totalFee });
    } else {
      tx = await controller.mintBatch(account, quantity, { value: totalFee });
    }

    const receipt = await tx.wait();

    const iface = new ethers.Interface(MINT_CONTROLLER_ABI.abi);
    const tokenIds = receipt.logs
      .map((log) => {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === "NewMint") {
            return Number(parsed.args.tokenId);
          }
        } catch {}
        return null;
      })
      .filter(Boolean);

    setMintedTokenId({
      tokenId: tokenIds[0],
      name: selectedNFT?.name,
      image: selectedNFT?.image,
    });

    setMintSuccess(true);
    await refreshData();
  } catch (err) {
    console.error("Mint error:", err);
    setError("Mint failed. Try again.");
  } finally {
    setMinting(false);
  }
};




  const handleClose = () => {
    setMintSuccess(false);
    setMintedTokenId(null);
  };

  const handleBack = () => navigate("/explore");

if (mintSuccess)
  return <MintSuccess mintedNFT={mintedTokenId} onClose={handleClose} />;


  if (isAlreadyMinted)
    return <MintSuccess isAlreadyMinted onClose={handleBack} />;

  if (!selectedNFT)
    return <p>NFT not found.</p>;

  return (
    <div className="mint-page-container">
      <div className="mint-header">
        <h1>🎨 Premium NFT Minting</h1>
      </div>

      <WalletButton />

      {isConnected ? (
        <div className="mint-content">
          <NFTCard nft={selectedNFT} />
          <MintForm
            nft={selectedNFT}
            walletConnected
            minting={minting || isMinting}
            onMint={handleMint}
            mintPrice={`${selectedNFT.price || "0.002"} Op`}
            error={error}
          />
        </div>
      ) : (
        <div className="lock-screen">
          <h3>🔐 Connect your wallet to mint</h3>
          {error && <p className="error-msg">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default MintPage;
