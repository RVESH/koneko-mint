// src/pages/Mint_page/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import { useWalletContext } from "../../context/WalletContext";
import contractService from "../../services/contractService";

import MintForm from "./components/MintForm";
import NFTCard from "./components/NFTCard";
import MintSuccess from "./mintSuccess/MintSuccess";

import "./style.scss";

const MintPage = () => {
  const { account, isConnected } = useWalletContext();
  const { id } = useParams();
  const nftId = Number(id);

  const [metadata, setMetadata] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ---------------------- LOAD NFT METADATA ----------------------
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/room/metadata.json");
      const json = await res.json();
      setMetadata(json);

      const nft = json.find((x) => x.id === nftId);
      setSelectedNFT(nft);
    };

    load();
  }, [nftId]);

  if (!selectedNFT) return <p>Loading NFT…</p>;

  // ---------------------- MINT FUNCTION ----------------------
  const handleMint = async () => {
    if (!isConnected || !account) {
      alert("Please connect wallet first!");
      return;
    }

    try {
      setError("");
      setMinting(true);

      // Mint exactly 1 NFT
      const receipt = await contractService.mintNFT(account, 1);

      console.log("Mint receipt:", receipt);

      // 🔥 Decode Token ID (NewMint event)
      let mintedId = null;
      const iface = new ethers.Interface([
        "event NewMint(address indexed account, uint256 tokenId)"
      ]);

      receipt.logs.forEach((log) => {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === "NewMint") {
            mintedId = Number(parsed.args.tokenId);
          }
        } catch {}
      });

      setMintSuccess({
        tokenId: mintedId,
        name: selectedNFT.name,
        image: `/room/images/${selectedNFT.filename}`,
      });

    } catch (err) {
      console.error("Mint failed:", err);
      setError("❌ Mint failed! Make sure Ganache + MetaMask are correct.");
    } finally {
      setMinting(false);
    }
  };

  // ---------------------- SUCCESS CLOSE ----------------------
  const handleClose = () => {
    setMintSuccess(false);
    navigate("/profile");
  };

  // ---------------------- RENDER ----------------------
  if (mintSuccess)
    return <MintSuccess mintedNFT={mintSuccess} onClose={handleClose} />;

  return (
    <div className="mint-page-container">
      <div className="mint-header">
        <h1>🎨 Premium NFT Mint</h1>
      </div>

      <div className="mint-content">
        <NFTCard nft={selectedNFT} />

        <MintForm
          nft={selectedNFT}
          walletConnected={isConnected}
          minting={minting}
          onMint={handleMint}
          mintPrice={`${selectedNFT.price || "0.002"} ETH`}
          error={error}
        />
      </div>
    </div>
  );
};

export default MintPage;
