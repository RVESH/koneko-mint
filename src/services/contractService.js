// src/services/contractService.js
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

  // ---------------------- GET MINT FEE ----------------------
  async getMintFee() {
    try {
      const fee = await this.contracts.mintController.getMintFee();
      return ethers.formatEther(fee);
    } catch {
      return "0";
    }
  }

  async getMintFeeBigInt() {
    try {
      return await this.contracts.mintController.getMintFee();
    } catch {
      return BigInt(0);
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

  // ---------------------- MINT NFT ----------------------
  async mintNFT(recipient, quantity = 1) {
    const fee = await this.getMintFeeBigInt();
    const total = fee * BigInt(quantity);

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

    return await tx.wait();
  }
}

const contractService = new ContractService();
export default contractService;
