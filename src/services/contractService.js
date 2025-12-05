// ✅ CORRECT contractService.js - PRODUCTION READY
// Exact match with your MintController + ERC721TOKEN contracts

import { ethers } from "ethers";
import { CONTRACTS } from "../contracts/config";

import ERC721TOKEN_ABI from "../contracts/ERC721TOKEN.json";
import MINT_CONTROLLER_ABI from "../contracts/MintController.json";

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.account = null;
  }

  getABI(artifact) {
    if (artifact.abi) return artifact.abi;
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
      this.account = await this.signer.getAddress();

      console.log("👤 Connected account:", this.account);
      console.log("📍 ERC721TOKEN:", CONTRACTS.ERC721TOKEN);
      console.log("📍 MintController:", CONTRACTS.MINT_CONTROLLER);

      const nftABI = this.getABI(ERC721TOKEN_ABI);
      const mintABI = this.getABI(MINT_CONTROLLER_ABI);

      // NFT Contract instance (read-only for now)
      this.contracts.nft = new ethers.Contract(
        CONTRACTS.ERC721TOKEN,
        nftABI,
        this.signer
      );

      // MintController Contract instance (for minting)
      this.contracts.mintController = new ethers.Contract(
        CONTRACTS.MINT_CONTROLLER,
        mintABI,
        this.signer
      );

      console.log("✅ contractService initialized successfully");
      return true;
    } catch (e) {
      console.error("❌ Initialize failed:", e.message);
      return false;
    }
  }

  // ✅ GET ACCOUNT
  async getAccount() {
    return this.account;
  }

  // ✅ GET MINT FEE
  async getMintFee() {
    try {
      if (!this.contracts?.mintController) {
        console.warn("⚠️ mintController not ready");
        return ethers.parseEther("0.0001");
      }
      const fee = await this.contracts.mintController.getMintFee();
      return fee;
    } catch (e) {
      console.error("❌ getMintFee error:", e.message);
      return ethers.parseEther("0.0001");
    }
  }

  // ✅ GET TOTAL SUPPLY
  async getTotalSupply() {
    try {
      if (!this.contracts?.nft) return 0;
      const supply = await this.contracts.nft.totalSupply();
      return Number(supply);
    } catch (e) {
      console.error("❌ getTotalSupply error:", e.message);
      return 0;
    }
  }

  // ✅ GET USER NFTs
  async getUserNFTs(account) {
    try {
      if (!account || !this.contracts?.nft) return [];

      const balance = await this.contracts.nft.balanceOf(account);
      const total = Number(balance);
      const nfts = [];

      for (let i = 0; i < total; i++) {
        try {
          const tokenId = await this.contracts.nft.tokenOfOwnerByIndex(
            account,
            i
          );
          nfts.push({
            tokenId: Number(tokenId),
            id: Number(tokenId),
          });
        } catch (e) {
          // Skip if error
        }
      }

      console.log(`✅ User has ${nfts.length} NFTs`);
      return nfts;
    } catch (e) {
      console.error("❌ getUserNFTs error:", e.message);
      return [];
    }
  }

  // ✅ MINT 1 NFT - Simple mint function
  async mint1() {
    try {
      const mc = this.contracts.mintController;
      if (!mc) throw new Error("MintController not initialized");

      const account = await this.signer.getAddress();
      const fee = await this.getMintFee();

      console.log("🚀 Minting 1 NFT...");
      console.log("👤 Account:", account);
      console.log("💰 Fee:", ethers.formatEther(fee), "ETH");

      // Call mint(account) with fee
      const tx = await mc.mint(account, {
        value: fee,
        gasLimit: BigInt(500000),
      });

      console.log("📝 Tx sent:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ MINT 1 NFT SUCCESS!");
      return receipt;
    } catch (e) {
      console.error("❌ Mint 1 failed:", e.message);
      throw e;
    }
  }

  // ✅ MINT BATCH - Multiple NFTs (3, 5, 10)
  async mintBatch(quantity) {
    try {
      const mc = this.contracts.mintController;
      if (!mc) throw new Error("MintController not initialized");

      const account = await this.signer.getAddress();
      const fee = await this.getMintFee();
      const totalFee = fee * BigInt(quantity);

      console.log(`🚀 Minting ${quantity} NFTs...`);
      console.log("👤 Account:", account);
      console.log("💰 Fee per NFT:", ethers.formatEther(fee), "ETH");
      console.log("💵 Total fee:", ethers.formatEther(totalFee), "ETH");

      // Call mintBatch(account, quantity) with total fee
      const tx = await mc.mintBatch(account, quantity, {
        value: totalFee,
        gasLimit: BigInt(500000 * quantity),
      });

      console.log("📝 Tx sent:", tx.hash);
      const receipt = await tx.wait();

      console.log(`✅ MINT ${quantity} NFTs SUCCESS!`);
      return receipt;
    } catch (e) {
      console.error(`❌ Mint batch ${quantity} failed:`, e.message);
      throw e;
    }
  }

  // ✅ MINT 3 NFTs
  async mint3() {
    return this.mintBatch(3);
  }

  // ✅ MINT 5 NFTs
  async mint5() {
    return this.mintBatch(5);
  }

  // ✅ MINT 10 NFTs
  async mint10() {
    return this.mintBatch(10);
  }

  // ✅ CHECK ACCOUNT BALANCE
  async getAccountBalance() {
    try {
      if (!this.provider || !this.account) return "0";
      const balance = await this.provider.getBalance(this.account);
      return ethers.formatEther(balance);
    } catch (e) {
      console.error("❌ getAccountBalance error:", e.message);
      return "0";
    }
  }

  // ✅ CHECK IF PAUSED
  async isPaused() {
    try {
      const mc = this.contracts.mintController;
      if (!mc) return false;
      return await mc.isPaused();
    } catch (e) {
      console.error("⚠️ isPaused check error:", e.message);
      return false;
    }
  }
}

const contractService = new ContractService();

// ✅ EXPOSE TO WINDOW FOR CONSOLE ACCESS
if (typeof window !== "undefined") {
  window.contractService = contractService;
  console.log("✅ contractService available at window.contractService");
}

export default contractService;
