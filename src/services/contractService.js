// src/services/contractService.js
import { ethers } from 'ethers';
import { CONTRACTS } from '../contracts/config';

// Import ABI files
import ERC721TOKEN_ABI from '../contracts/ERC721TOKEN.json';
import MINT_CONTROLLER_ABI from '../contracts/MintController.json';

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.metadataCache = null;
  }

  // Initialize with wallet provider
  async initialize(walletProvider) {
    try {
      this.provider = new ethers.BrowserProvider(walletProvider);
      this.signer = await this.provider.getSigner();

      // Initialize contracts
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

      // Load metadata cache
      await this.loadMetadataCache();

      return true;
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }

  // Load metadata cache
  async loadMetadataCache() {
    try {
      const response = await fetch('/room/metadata.json');
      const metadata = await response.json();
      
      this.metadataCache = {};
      metadata.forEach(item => {
        this.metadataCache[item.id] = item;
      });
      
      console.log(`📋 Cached ${metadata.length} metadata entries`);
    } catch (e) {
      console.warn('⚠️ Could not load metadata:', e);
      this.metadataCache = {};
    }
  }

  // Switch to Ganache network
  async switchToGanache() {
    try {
      const chainIdHex = '0x539';
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x539',
            chainName: 'Ganache Local',
            rpcUrls: ['http://127.0.0.1:7545'],
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          }],
        });
      }
    }
  }


  
  // Get mint fee as string
  async getMintFee() {
    try {
      if (!this.contracts.mintController) throw new Error('Contracts not initialized');
      const fee = await this.contracts.mintController.getMintFee();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Get mint fee failed:', error);
      return "0";
    }
  }

  // Get mint fee as bigint
  async getMintFeeBigInt() {
    try {
      if (!this.contracts.mintController) throw new Error('Contracts not initialized');
      return await this.contracts.mintController.getMintFee();
    } catch (error) {
      console.error('Get mint fee bigint failed:', error);
      return BigInt(0);
    }
  }

  // Get total supply
  async getTotalSupply() {
    try {
      if (!this.contracts.nft) throw new Error('Contracts not initialized');
      const supply = await this.contracts.nft.totalSupply();
      return supply.toString();
    } catch (error) {
      console.error('Get total supply failed:', error);
      return "0";
    }
  }

  // ✅ FIXED: Get user NFTs from blockchain
  async getUserNFTs(userAddress) {
    try {
      if (!this.contracts.nft) throw new Error('Contracts not initialized');

      const balance = await this.contracts.nft.balanceOf(userAddress);
      console.log(`🔍 Fetching ${balance.toString()} NFTs for ${userAddress}`);

      const nfts = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.contracts.nft.tokenOfOwnerByIndex(userAddress, i);
          const tokenIdNum = parseInt(tokenId.toString());

          let tokenUri = "";
          try {
            tokenUri = await this.contracts.nft.tokenURI(tokenId);
          } catch (e) {
            tokenUri = "";
          }

          // Get metadata if available
          const meta = this.metadataCache?.[tokenIdNum] || {};

          nfts.push({
            tokenId: tokenIdNum,
            tokenUri,
            owner: userAddress,
            name: meta.name || `NFT #${tokenIdNum}`,
            filename: meta.filename || `${tokenIdNum}.jpg`,
            price: meta.price || "0.002",
            description: meta.description || "",
            id: tokenIdNum
          });

          console.log(`✅ NFT #${tokenIdNum} loaded`);
        } catch (error) {
          console.error(`❌ Error loading NFT ${i}:`, error);
        }
      }

      console.log(`📦 Total NFTs fetched: ${nfts.length}`);
      return nfts;
    } catch (error) {
      console.error('❌ Get user NFTs failed:', error);
      return [];
    }
  }

  // Mint NFT
  async mintNFT(recipient, quantity = 1) {
    try {
      if (!this.contracts.mintController) {
        throw new Error('Contracts not initialized');
      }

      const mintFeeBigInt = await this.contracts.mintController.getMintFee();;
      const totalFee = mintFeeBigInt * BigInt(quantity);

      let tx;
     if (Number(quantity) === 1) {
        tx = await this.contracts.mintController.mint(recipient, {
          value: totalFee,
          gasLimit: 300000
        });
      } else {
        tx = await this.contracts.mintController.mintBatch(recipient,  Number(quantity), {
          value: totalFee,
          gasLimit: 500000
        });
      }

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      return receipt;
    } 
    
    catch (error) {
      console.error('Mint failed:', error);
      throw error;
    }
  }

  // Check if user can mint
  async canUserMint(userAddress) {
    try {
      if (!this.contracts.mintController) return false;

      const blockRole = ethers.keccak256(ethers.toUtf8Bytes("BLOCK_ROLE"));
      const isBlocked = await this.contracts.mintController.hasRole(blockRole, userAddress);

      return !isBlocked;
    } catch (error) {
      console.error('Check user mint permission failed:', error);
      return true;
    }
  }

  // Get contract info
// Get contract info (fully fixed)
async getContractInfo() {
  try {
    // 1) TRY reading mintFee from MintController
    let mintFee = "0";
    try {
      const feeBN = await this.contracts.mintController.getMintFee();
      mintFee = ethers.formatEther(feeBN);
    } catch (e) {
      console.warn("MintController.getMintFee() failed → trying fallback");
    }

    // 2) FALLBACK: read mint fee from NFT contract (if exists)
    try {
      const contract = this.contracts.nft;
      const fee =
        (contract.mintFee && await contract.mintFee()) ||
        (contract.cost && await contract.cost()) ||
        (contract.price && await contract.price()) ||
        (contract.mintPrice && await contract.mintPrice());

      if (fee) mintFee = ethers.formatEther(fee);
    } catch (e) {}

    // 3) Total supply
    const supplyBN = await this.contracts.nft.totalSupply();
    const totalSupply = Number(supplyBN);

    return {
      mintFee,
      totalSupply,
      nftAddress: CONTRACTS.ERC721TOKEN,
      mintControllerAddress: CONTRACTS.MINT_CONTROLLER
    };
  } catch (error) {
    console.error("Get contract info failed:", error);
    return {
      mintFee: "0",
      totalSupply: 0,
      nftAddress: CONTRACTS.ERC721TOKEN,
      mintControllerAddress: CONTRACTS.MINT_CONTROLLER
    };
  }
}

}

export default new ContractService();
