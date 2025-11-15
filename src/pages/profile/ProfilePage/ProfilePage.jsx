// src/pages/Profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useWalletContext } from "../../../context/WalletContext";
import { useContractContext } from "../../../context/ContractContext";
import "./ProfilePage.scss";
import CopyButton from "../../../components/CopyButton/CopyButton";
import ProfileNFT from "../profileNFT/profileNFT";
import NFTPopup from "../../../components/NFTPopup/NFTPopup";

const ProfilePage = () => {
  const { account, isConnected } = useWalletContext();
  const { userNFTs, refreshData } = useContractContext();

  const [allNfts, setAllNfts] = useState([]);
  const [userMetaNFTs, setUserMetaNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // ✅ Load full metadata once
  useEffect(() => {
    fetch("/room/metadata.json")
      .then(res => res.json())
      .then(data => setAllNfts(data))
      .catch(err => console.error("Metadata load failed:", err));
  }, []);

  // ✅ Refresh blockchain data when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      refreshData();
    }
  }, [isConnected, account]);

  // ✅ Combine metadata + owned NFTs
  useEffect(() => {
    if (userNFTs && allNfts.length > 0) {
      const merged = userNFTs.map(onChainNft => {
        const meta = allNfts.find(m => Number(m.id) === Number(onChainNft.tokenId));
        return {
          ...onChainNft,
          image: meta ? `/room/images/${meta.filename}` : `/room/images/${onChainNft.tokenId}.png`,
          name: meta?.name || `NFT #${onChainNft.tokenId}`,
          description: meta?.description || "No description available",
        };
      });
      setUserMetaNFTs(merged);
    }
  }, [userNFTs, allNfts]);

  const openPopup = (nft) => setSelectedNFT(nft);
  const closePopup = () => setSelectedNFT(null);

  const truncate = (s) =>
    s && s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img
          src={`https://api.dicebear.com/5.x/identicon/svg?seed=${account || 'default'}`}
          alt="User avatar"
          className="profile-avatar"
        />
        <div className="profile-wallet">
          <span className="wallet-address">{truncate(account || '')}</span>
          <CopyButton value={account || ''} className="profile-copy" />
        </div>
      </div>

      {isConnected ? (
        <ProfileNFT
          userNFTs={userMetaNFTs}
          onZoomClick={openPopup}
        />
      ) : (
        <div style={{ textAlign: "center", margin: "2rem 0", color: "#8ca2b3", fontSize: "1.05rem" }}>
          Please connect your wallet to view your NFTs.
        </div>
      )}

      {selectedNFT && (
        <NFTPopup nft={selectedNFT} onClose={closePopup} showFromSearch />
      )}
    </div>
  );
};

export default ProfilePage;
