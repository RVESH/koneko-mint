// src/utils/storageHelpers.js

// Get minted NFTs from localStorage
export const getMintedNFTs = () => {
  try {
    const mintedNFTs = localStorage.getItem("mintedNFTs");
    return mintedNFTs ? JSON.parse(mintedNFTs) : [];
  } catch (error) {
    console.error("Error getting minted NFTs:", error);
    return [];
  }
};

// Add NFT to minted list
export const addMintedNFT = (nftData) => {
  try {
    const currentMinted = getMintedNFTs();
    const newMintedNFT = {
      ...nftData,
      mintedAt: new Date().toISOString(),
      tokenId: nftData.id
    };

    // Check if already minted
    if (!currentMinted.find(nft => nft.id === nftData.id)) {
      const updatedMinted = [...currentMinted, newMintedNFT];
      localStorage.setItem("mintedNFTs", JSON.stringify(updatedMinted));
    }

    return true;
  } catch (error) {
    console.error("Error adding minted NFT:", error);
    return false;
  }
};

// Get user NFTs for profile
export const getUserNFTs = (userAddress) => {
  try {
    const mintedNFTs = getMintedNFTs();
    return mintedNFTs; // Return all minted NFTs for this demo
  } catch (error) {
    console.error("Error getting user NFTs:", error);
    return [];
  }
};

// Check if NFT is minted
export const isNFTMinted = (nftId) => {
  const mintedNFTs = getMintedNFTs();
  return mintedNFTs.some(nft => nft.id === nftId);
};

// **BACKWARD COMPATIBILITY FUNCTIONS** (for your old Mint_page)
export const storeMintedNFT = (nftData) => {
  return addMintedNFT(nftData);
};

export const storeUserNFT = (nftData) => {
  return addMintedNFT(nftData);
};

// Additional helper functions
export const clearMintedNFTs = () => {
  try {
    localStorage.removeItem("mintedNFTs");
    return true;
  } catch (error) {
    console.error("Error clearing minted NFTs:", error);
    return false;
  }
};

export const getMintedNFTIds = () => {
  try {
    const mintedNFTs = getMintedNFTs();
    return mintedNFTs.map(nft => nft.id);
  } catch (error) {
    console.error("Error getting minted NFT IDs:", error);
    return [];
  }
};

export const getMintedNFTCount = () => {
  try {
    return getMintedNFTs().length;
  } catch (error) {
    console.error("Error getting minted NFT count:", error);
    return 0;
  }
};

export const isMintLimitReached = (maxLimit = 10) => {
  return getMintedNFTCount() >= maxLimit;
};

// Get NFT by ID from minted list
export const getMintedNFTById = (nftId) => {
  try {
    const mintedNFTs = getMintedNFTs();
    return mintedNFTs.find(nft => nft.id === nftId) || null;
  } catch (error) {
    console.error("Error getting minted NFT by ID:", error);
    return null;
  }
};
