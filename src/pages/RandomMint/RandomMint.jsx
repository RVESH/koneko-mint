import React, { useState, useEffect } from "react";
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

  // ✅ FIXED: INITIALIZE ON COMPONENT MOUNT + WHEN WALLET CONNECTS
  useEffect(() => {
    const initAndLoad = async () => {
      // Initialize contract service if wallet is connected
      if (isConnected && account && window.ethereum) {
        console.log("🔧 Initializing contract service...");
        try {
          await contractService.initialize(window.ethereum);
          console.log("✅ Contract service initialized");
        } catch (e) {
          console.error("❌ Init failed:", e);
        }
      }

      // Load metadata
      try {
        const res = await fetch("/room/metadata.json");
        const json = await res.json();
        setMetadata(json);
        setPreview(json[Math.floor(Math.random() * json.length)]);
      } catch (e) {
        console.error("❌ Metadata load failed:", e);
      }

      // Load contract data
      await loadContractData();
    };

    initAndLoad();
  }, [isConnected, account]); // ✅ RE-RUN WHEN WALLET CHANGES

  async function loadContractData() {
    try {
      const fee = await contractService.getMintFee();
      const supply = await contractService.getTotalSupply();

      console.log("💰 Mint Fee:", ethers.formatEther(fee), "ETH");
      console.log("📊 Total Supply:", supply);

      setMintFee(fee);
      setTotalSupply(supply);
      setAvailable(12000 - supply);
    } catch (e) {
      console.error("❌ Load contract data failed:", e);
    }
  }

  // ✅ FIXED: HANDLE MINT - USE CORRECT FUNCTIONS
  const handleMint = async (qty) => {
    try {
      setError("");
      setLoading(true);

      if (!isConnected) {
        setError("❌ Please connect wallet first!");
        return;
      }

      console.log(`🚀 Minting ${qty} NFTs...`);

      let receipt;

      // ✅ CALL CORRECT MINT FUNCTION BASED ON QUANTITY
      if (qty === 1) {
        receipt = await contractService.mint1();
      } else if (qty === 3) {
        receipt = await contractService.mint3();
      } else if (qty === 5) {
        receipt = await contractService.mint5();
      } else if (qty === 10) {
        receipt = await contractService.mint10();
      }

      console.log("✅ Mint successful!");
      console.log("Tx Hash:", receipt.hash);

      // Reload contract data
      await loadContractData();

      // Show success
      alert(`✅ Successfully minted ${qty} NFTs!\n\nTx: ${receipt.hash}`);
    } catch (e) {
      console.error("❌ Mint failed:", e.message);
      setError(`❌ Minting failed! ${e.message}`);
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
        nftPrice={parseFloat(ethers.formatEther(mintFee)) || 0}
        previewImage={preview ? `/room/images/${preview.filename}` : null}
        availableCount={available}
        isLoading={loading}
        onQuantityChange={() => {
          // Change preview on quantity change
          if (metadata.length > 0) {
            setPreview(metadata[Math.floor(Math.random() * metadata.length)]);
          }
        }}
      />
    </div>
  );
};

export default RandomMint;
