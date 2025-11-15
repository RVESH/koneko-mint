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
  const isAlreadyMinted = userNFTs.some(n => n.tokenId === String(nftId));

  const handleMint = async (quantity, totalPrice) => {
    try {
      setError(null);

      if (!isConnected || !account) {
        alert("Please connect your wallet first!");
        return;
      }

      if (!window.ethereum) {
        alert("Please start Ganache and unlock MetaMask.");
        return;
      }

      // ✅ Ensure Ganache Network
      const netId = await window.ethereum.request({ method: "net_version" });
      if (netId !== "5777" && netId !== "1337") {
        alert("Please switch MetaMask to the Ganache Local network.");
        return;
      }

      setMinting(true);

      // ✅ Use ethers provider from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✅ Create contract instance connected to signer
      const contract = new ethers.Contract(
        config.contractAddress,
        contractABI,
        signer
      );

      const weiValue = ethers.parseEther(totalPrice.toString());
      const tx = await contract.mint(quantity, { value: weiValue });
      const receipt = await tx.wait();

      console.log("🎉 Mint successful:", receipt);
      setMintSuccess(true);
      refreshData && refreshData();
    } catch (error) {
      console.error("💥 Mint failed:", error);
      if (error?.code === -32002) {
        alert("MetaMask RPC is busy or locked. Unlock and try again.");
      } else {
        setError(error.message || "Mint failed. Try again.");
      }
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
    return <MintSuccess onClose={handleClose} />;

  if (isAlreadyMinted)
    return <MintSuccess isAlreadyMinted onBack={handleBack} />;

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
            mintPrice={`${selectedNFT.price || "0.002"} ETH`}
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
