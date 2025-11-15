// src/hooks/useContract.jsYe ethers.js use karega aur tumhare ABI + contract address se contract instance banayega.
import { useMemo } from "react";
import { Contract, JsonRpcProvider } from "ethers"; // v6 imports
import contractABI from "../utils/contractABI.json";
import config from "../utils/config";

export const useContract = (provider) => {
  return useMemo(() => {
    if (!provider || !config.contractAddress) return null;

    try {
      return new Contract(config.contractAddress, contractABI, provider);
    } catch (error) {
      console.error("Contract initialization error:", error);
      return null;
    }
  }, [provider]);
};

export const useReadOnlyContract = () => {
  return useMemo(() => {
    if (!config.rpcUrl || !config.contractAddress) return null;

    try {
      const provider = new JsonRpcProvider(config.rpcUrl);
      return new Contract(config.contractAddress, contractABI, provider);
    } catch (error) {
      console.error("Read-only contract initialization error:", error);
      return null;
    }
  }, []);
};
