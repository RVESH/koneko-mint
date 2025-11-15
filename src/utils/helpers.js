import { formatUnits, formatEther } from "ethers"; // v6 imports
import config from "./config";

// Format address for display
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format balance (fixed for ethers v6)
export const formatBalance = (balance, decimals = 18) => {
  if (!balance) return "0";
  return parseFloat(formatUnits(balance, decimals)).toFixed(4); // ethers v6 syntax
};

// Get network name
export const getNetworkName = (chainId) => {
  return config.networkNames[chainId] || `Chain ${chainId}`;
};

// Check if chain is supported
export const isSupportedChain = (chainId) => {
  return config.supportedChainIds.includes(chainId);
};

// Get block explorer URL
export const getBlockExplorerUrl = (chainId, hash, type = "tx") => {
  const baseUrl = config.blockExplorers[chainId];
  if (!baseUrl) return "";
  return `${baseUrl}/${type}/${hash}`;
};

// Format error message
export const formatError = (error) => {
  if (error?.code === 4001) {
    return "Transaction was rejected by user";
  }
  if (error?.message?.includes("insufficient funds")) {
    return "Insufficient funds for transaction";
  }
  return error?.message || "An unknown error occurred";
};

// Wait for transaction confirmation
export const waitForTransaction = async (provider, txHash, confirmations = 1) => {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error("Transaction confirmation error:", error);
    throw error;
  }
};
