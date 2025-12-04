// ✅ EXPOSED: src/services/contractService.js
// WITH GLOBAL EXPORT

import { ethers } from "ethers";
import { CONTRACTS } from "../contracts/config";

import ERC721TOKEN_ABI from "../contracts/ERC721TOKEN.json";
import MINT_CONTROLLER_ABI from "../contracts/MintController.json";

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.metadataCache = {};
  }

  getABI(artifact) {
    if (artifact.abi) {
      return artifact.abi;
    }
    return artifact;
  }

  async initialize(walletProvider) {
    if (!walletProvider) {
      console.error("❌ No wallet provider");
      return false;
    }

    try {
      this.provider = new ethers.BrowserProvider(walletProvider);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      this.contracts = {};

      console.log("👤 Connected account:", address);
      console.log("📍 ERC721TOKEN from config:", CONTRACTS.ERC721TOKEN);
      console.log("📍 MintController from config:", CONTRACTS.MINT_CONTROLLER);

      const nftABI = this.getABI(ERC721TOKEN_ABI);
      const mintABI = this.getABI(MINT_CONTROLLER_ABI);

      this.contracts.nft = new ethers.Contract(
        CONTRACTS.ERC721TOKEN,
        nftABI,
        this.signer
      );

      this.contracts.mintController = new ethers.Contract(
        CONTRACTS.MINT_CONTROLLER,
        mintABI,
        this.signer
      );

      console.log("✅ contractService initialized");

      await this.loadMetadataCache();
      return true;
    } catch (e) {
      console.error("❌ Initialize failed:", e.message);
      return false;
    }
  }

  async loadMetadataCache() {
    try {
      const res = await fetch("/room/metadata.json");
      const data = await res.json();
      data.forEach((item) => {
        this.metadataCache[item.id] = item;
      });
      console.log("✅ Metadata loaded:", data.length, "items");
    } catch (e) {
      console.warn("⚠️ Metadata load failed:", e.message);
    }
  }

  async getMintFee() {
    try {
      if (!this.contracts?.mintController) {
        console.warn("⚠️ mintController not ready");
        return "0.0001";
      }
      // Just try getMintFee for now
      const c = this.contracts.mintController;
      const fee = await c.getMintFee();
      return ethers.formatEther(fee);
    } catch (e) {
      console.warn("⚠️ getMintFee error, using default", e.message);
      return "0.0001";
    }
  }

  async getMintFeeBigInt() {
    const feeString = await this.getMintFee();
    return ethers.parseEther(feeString);
  }

  async getTotalSupply() {
    try {
      if (!this.contracts?.nft) return 0;
      const supply = await this.contracts.nft.totalSupply();
      return Number(supply);
    } catch (e) {
      return 0;
    }
  }

  async getUserNFTs(account) {
    try {
      if (!account || !this.contracts?.nft) return [];
      const balance = await this.contracts.nft.balanceOf(account);
      const total = Number(balance);
      const nfts = [];
      for (let i = 0; i < total; i++) {
        try {
          const tokenId = await this.contracts.nft.tokenOfOwnerByIndex(account, i);
          const id = Number(tokenId);
          const meta = this.metadataCache[id] || {};
          nfts.push({
            tokenId: id,
            name: meta.name ?? `NFT #${id}`,
            filename: meta.filename ?? `${id}.png`,
            price: meta.price ?? "0.0001",
            owner: account,
          });
        } catch (e) {}
      }
      return nfts;
    } catch (e) {
      return [];
    }
  }

  async mintNFT(recipient, quantity = 1) {
    try {
      if (!recipient || !this.contracts?.mintController) {
        throw new Error("Recipient or mintController missing");
      }

      const c = this.contracts.mintController;
      const fee = await this.getMintFeeBigInt();
      const total = fee * BigInt(quantity);

      console.log("💎 Minting", quantity, "NFT(s)");
      console.log("💰 Fee per NFT:", ethers.formatEther(fee), "ETH");

      let tx;
      // Increased Gas Limit
      if (quantity === 1) {
        tx = await c.mint(recipient, {
          value: total,
          gasLimit: BigInt(500000),
        });
      } else {
        tx = await c.mintBatch(recipient, quantity, {
          value: total,
          gasLimit: BigInt(500000 * quantity),
        });
      }

      console.log("📝 Tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Mint successful!");
      return receipt;
    } catch (e) {
      console.error("❌ Mint failed:", e.message);
      throw e;
    }
  }

  
  // ✅ DEBUG TEST FUNCTION
  async testMintDirect() {
    try {
      const c = this.contracts.mintController;
      const signer = await this.provider.getSigner();
      const account = await signer.getAddress();

      console.log("🧪 Testing direct mint call...");
      console.log("📍 MintController:", c.target);
      console.log("👤 Account:", account);
      console.log("💰 Balance:", await this.provider.getBalance(account));

      const fee = await this.getMintFeeBigInt();
      console.log("Fee:", fee.toString());

      try {
        console.log("🔄 Estimating Gas...");
        const gas = await c.mint.estimateGas(account, { value: fee });
        console.log("✅ Gas Estimate:", gas.toString());
      } catch (e) {
        console.error("❌ Gas Estimate Failed:", e.reason || e.message);
        // Try callStatic to get revert reason
        try {
          await c.mint.staticCall(account, { value: fee });
        } catch (revertError) {
           console.error("🔍 Revert Reason:", revertError.reason || revertError.message);
        }
      }
    } catch (e) {
      console.error("❌ Test Failed:", e);
    }
  }
}

const contractService = new ContractService();

// ✅ CRITICAL: EXPOSE TO WINDOW FOR CONSOLE DEBUGGING
if (typeof window !== "undefined") {
  window.contractService = contractService;
  console.log("✅ contractService attached to window object");
}

export default contractService;
