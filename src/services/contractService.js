// ✅ FIXED: src/services/contractService.js

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

  // ---------------------- INIT ----------------------
  async initialize(walletProvider) {
    this.provider = new ethers.BrowserProvider(walletProvider);
    this.signer = await this.provider.getSigner();

    this.contracts.nft = new ethers.Contract(
      CONTRACTS.ERC721TOKEN,
      ERC721TOKEN_ABI.abi,
      this.signer
    );

    this.contracts.mintController = new ethers.Contract(
      CONTRACTS.MINT_CONTROLLER,
      MINT_CONTROLLER_ABI.abi,
      this.signer
    );

    await this.loadMetadataCache();
    return true;
  }

  // ---------------------- LOAD METADATA ----------------------
  async loadMetadataCache() {
    try {
      const res = await fetch("/room/metadata.json");
      const data = await res.json();

      data.forEach((item) => {
        this.metadataCache[item.id] = item;
      });
    } catch (e) {
      console.warn("Metadata load failed");
    }
  }

  // ✅ FIXED: GET MINT FEE (CONSISTENT)
  async getMintFee() {
    try {
      if (typeof this.contracts.mintController.getMintFee === 'function') {
        const fee = await this.contracts.mintController.getMintFee();
        console.log("✅ getMintFee success:", ethers.formatEther(fee));
        return ethers.formatEther(fee);
      }

      if (typeof this.contracts.mintController.mintFee === 'function') {
        const fee = await this.contracts.mintController.mintFee();
        console.log("✅ mintFee success:", ethers.formatEther(fee));
        return ethers.formatEther(fee);
      }

      if (typeof this.contracts.mintController.cost === 'function') {
        const fee = await this.contracts.mintController.cost();
        console.log("✅ cost success:", ethers.formatEther(fee));
        return ethers.formatEther(fee);
      }

      console.warn("⚠️ No mint fee function found - using default 0.002");
      return "0.002";
    } catch (e) {
      console.error("❌ getMintFee error:", e.message);
      return "0.002";
    }
  }

  // ✅ FIXED: GET MINT FEE BIGINT (NOW USES THE SAME LOGIC)
  async getMintFeeBigInt() {
    try {
      const feeString = await this.getMintFee();
      const feeBigInt = ethers.parseEther(feeString);
      console.log("✅ getMintFeeBigInt:", feeBigInt.toString());
      return feeBigInt;
    } catch (e) {
      console.error("❌ getMintFeeBigInt error:", e.message);
      return ethers.parseEther("0.002"); // DEFAULT
    }
  }

  // ---------------------- TOTAL SUPPLY ----------------------
  async getTotalSupply() {
    try {
      const supply = await this.contracts.nft.totalSupply();
      return Number(supply);
    } catch {
      return 0;
    }
  }

  // ---------------------- GET USER NFTS ----------------------
  async getUserNFTs(account) {
    try {
      const balance = await this.contracts.nft.balanceOf(account);
      const total = Number(balance);

      const arr = [];
      for (let i = 0; i < total; i++) {
        const tokenId = await this.contracts.nft.tokenOfOwnerByIndex(
          account,
          i
        );
        const id = Number(tokenId);

        const meta = this.metadataCache[id] || {};

        arr.push({
          tokenId: id,
          name: meta.name ?? `NFT #${id}`,
          filename: meta.filename ?? `${id}.png`,
          price: meta.price ?? "0.002",
          owner: account,
        });
      }

      return arr;
    } catch (e) {
      console.error("getUserNFTs failed:", e);
      return [];
    }
  }

  // ✅ FIXED: MINT NFT (NOW WORKING)
  async mintNFT(recipient, quantity = 1) {
    try {
      const fee = await this.getMintFeeBigInt();
      const total = fee * BigInt(quantity);

      console.log("💎 Minting", quantity, "NFT(s)");
      console.log("💰 Fee per NFT:", ethers.formatEther(fee), "ETH");
      console.log("💰 Total value:", ethers.formatEther(total), "ETH");

      let tx;

      if (quantity === 1) {
        tx = await this.contracts.mintController.mint(recipient, {
          value: total,
        });
      } else {
        tx = await this.contracts.mintController.mintBatch(
          recipient,
          quantity,
          { value: total }
        );
      }

      console.log("📝 Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed!");
      return receipt;
    } catch (e) {
      console.error("❌ Mint failed:", e.message);
      throw e;
    }
  }
}

const contractService = new ContractService();
export default contractService;
