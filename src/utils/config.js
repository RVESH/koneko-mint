const config = {
  // Contract details
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890",

  // Network configuration
  supportedChainIds: [1, 5, 10, 420, 1337, 5777], // Ethereum Mainnet, Goerli, Optimism, Optimism Goerli
  defaultChainId: 1337, // Optimism👈 change from 10 → 555

  // RPC URLs
  rpcUrls: {
    1: "https://eth-mainnet.alchemyapi.io/v2/your-api-key",
    5: "https://eth-goerli.alchemyapi.io/v2/your-api-key",
    10: "https://mainnet.optimism.io",
    420: "https://goerli.optimism.io",
    5777: "http://127.0.0.1:7545", // 👈 your local Ganache RPC
    1337: "http://127.0.0.1:8545",

  },
  

  // Block explorers
  blockExplorers: {
    1: "https://etherscan.io",
    5: "https://goerli.etherscan.io",
    10: "https://optimistic.etherscan.io",
    420: "https://goerli-optimism.etherscan.io",
    5777: "", // Ganache has no explorer

  },

  // Network names
  networkNames: {
    1: "Ethereum",
    5: "Goerli",
    10: "Optimism",
    420: "Optimism Goerli",
   1337: "Ganache Local",

    5777: "Ganache Local",//👈 will display in your app
  },

  // App settings
  appName: "Koneko Mint App",
  appDescription: "Premium NFT Minting Platform",
};

// Get RPC URL for current chain
config.rpcUrl = config.rpcUrls[config.defaultChainId];

export default config;
