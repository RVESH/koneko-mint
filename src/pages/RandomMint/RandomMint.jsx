import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWalletContext } from "../../context/WalletContext";
import BulkMintSelector from "./components/BulkMintSelector/BulkMintSelector";
import contractService from "../../services/contractService";
import "./RandomMint.scss";

const RandomMint = () => {
  const { account, isConnected } = useWalletContext();

  const [mintFee, setMintFee] = useState("0");
  const [totalSupply, setTotalSupply] = useState(0);
  const [available, setAvailable] = useState(12000);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------- LOAD PAGE DATA ----------------------
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const res = await fetch("/room/metadata.json");
    const json = await res.json();
    setMetadata(json);
    setPreview(json[Math.floor(Math.random() * json.length)]);

    await loadContractData();
  }

  async function loadContractData() {
    const fee = await contractService.getMintFee();
    const supply = await contractService.getTotalSupply();

    setMintFee(fee);
    setTotalSupply(supply);
    setAvailable(12000 - supply);
  }

  // ---------------------- HANDLE MINT ----------------------
  const handleMint = async (qty) => {
    try {
      setError("");
      setLoading(true);

      const receipt = await contractService.mintNFT(account, qty);

      console.log("Mint receipt:", receipt);
      await loadContractData();
    } catch (e) {
      console.error("Mint failed:", e);
      setError("Minting failed! Check Ganache + metamask + fee balance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="random-mint">
      
      {error && <div className="error-banner">⚠️ {error}</div>}

      <BulkMintSelector
        isConnected={isConnected}
        onMintClick={handleMint}
        nftPrice={parseFloat(mintFee)}
        previewImage={preview ? `/room/images/${preview.filename}` : null}
        availableCount={available}
        isLoading={loading}
        onQuantityChange={() =>
          setPreview(metadata[Math.floor(Math.random() * metadata.length)])
        }
      />
    </div>
  );
};

export default RandomMint;
