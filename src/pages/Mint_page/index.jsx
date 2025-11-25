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
  const isAlreadyMinted = userNFTs.some(n => (n.tokenId) === Number(nftId));

  // inside MintPage component — replace handleMint with:
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

    setMinting(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    // if you want Ganache check chainId 1337 or 5777 — adapt to your local
    if (![1337, 5777].includes(network.chainId)) {
      alert("Please switch MetaMask to the Ganache Local network.");
      setMinting(false);
      return;
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(config.contractAddress, contractABI, signer);

    // Ensure totalPrice is a plain numeric string (no "ETH")
    const priceStr = String(totalPrice).replace(/\s*ETH\s*$/i, "");
    const weiValue = ethers.parseEther(priceStr);

    const tx = await contract.mint(quantity, { value: weiValue });
    const receipt = await tx.wait();

    // decode logs robustly to get minted token IDs (ethers v6)
    const iface = new ethers.Interface(contractABI);
    const contractAddr = (contract.target || contract.address).toLowerCase();

    const tokenIds = receipt.logs
      .filter(l => l.address && l.address.toLowerCase() === contractAddr)
      .map(l => {
        try {
          const parsed = iface.parseLog(l);
          if (parsed && parsed.name === "Transfer") {
            // ERC-721 Transfer(from,to,tokenId)
            return Number(parsed.args.tokenId);
          }
        } catch (e) { /* ignore parse errors */ }
        return null;
      })
      .filter(Boolean);

    console.log("🎉 Mint successful tokenIds:", tokenIds);

    // build mintedNFT to show in MintSuccess (first token)
    const mintedNFT = {
      tokenId: tokenIds[0] ?? null,
      name: selectedNFT?.name ?? `NFT #${nftId}`,
      image: selectedNFT?.image ?? `/room/images/${nftId}.png`,
    };

    setMintedTokenId(mintedNFT);
    setMintSuccess(true);

    // IMPORTANT: refreshData must re-fetch userNFTs from the contract
    if (refreshData) await refreshData();

  } catch (err) {
    console.error("💥 Mint failed:", err);
    if (err?.code === -32002) {
      alert("MetaMask RPC is busy or locked. Unlock and try again.");
    } else if (err?.code === 4001) {
      setError("Transaction rejected by user.");
    } else {
      setError(err.message || "Mint failed. Try again.");
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
