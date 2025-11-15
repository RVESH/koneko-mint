// // src/hooks/useWallet.js
// //import { useWalletContext } from '../context/WalletContext';

// //export const useWallet = () => {
//  // const context = useWalletContext();

//   return {
//     ...context,
    
//     // Format address utility
//     formatAddress: (address) => {
//       if (!address) return '';
//       return `${address.slice(0, 6)}...${address.slice(-4)}`;
//     },

//     // Check if on Optimism network
//     isOnOptimism: () => {
//       return context.chainId === '0xA';
//     },

//     // Get network name
//     getNetworkName: () => {
//       const networks = {
//         '0x1': 'Ethereum Mainnet',
//         '0xA': 'Optimism',
//         '0xaa36a7': 'Sepolia',
//         '0x89': 'Polygon',
//         '0x38': 'BSC',
//         '0x2105': 'Base'
//       };
//       return networks[context.chainId] || 'Unknown Network';
//     },

//     // Check if wallet is ready for transactions
//     isWalletReady: () => {
//       return context.isConnected && 
//              !context.isMetaMaskLocked && 
//              context.account !== null;
//     },

//     // Get short network name
//     getShortNetworkName: () => {
//       const shortNames = {
//         '0x1': 'ETH',
//         '0xA': 'OP',
//         '0xaa36a7': 'SEP',
//         '0x89': 'MATIC',
//         '0x38': 'BNB',
//         '0x2105': 'BASE'
//       };
//       return shortNames[context.chainId] || 'UNKNOWN';
//     }
//   };
// };
// src/hooks/useWallet.js
// useWallet.js
import { useMemo } from "react";
import { useWalletContext } from "../context/WalletContext";

export const useWallet = () => {
  const ctx = useWalletContext();

  return useMemo(() => ({
    ...ctx,
    formatAddress: (address) => {
      if (!address) return "";
      return `${address.slice(0,6)}...${address.slice(-4)}`;
    },
    isOnOptimism: () => ctx.chainId === "0xA",
    getNetworkName: () => ctx.getNetworkName()
  }), [ctx]);
};


