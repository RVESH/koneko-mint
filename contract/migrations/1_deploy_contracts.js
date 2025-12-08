


const ERC721TOKEN = artifacts.require("ERC721TOKEN");
const MintController = artifacts.require("MintController");

module.exports = async function (deployer, network, accounts) {
  // // 1️⃣ Deploy ERC721TOKEN
  await deployer.deploy(ERC721TOKEN, "MyNFTCollection", "MNFT");
  const nftInstance = await ERC721TOKEN.deployed();
  const nftAddress = nftInstance.address;
  console.log("ERC721TOKEN deployed at:", nftAddress);

  // // 2️⃣ Prepare MintController params
  const mintFee = web3.utils.toBN(web3.utils.toWei("0.0001", "ether"));
  const mintStartTime = Math.floor(Date.now() / 1000);
  const maxBatchSize = 10;

  console.log("MintController parameters:");
  console.log("Mint Fee:", mintFee.toString());
  console.log("Mint Start Time:", mintStartTime);
  console.log("Max Batch Size:", maxBatchSize);

  // // 3️⃣ Deploy MintController
  await deployer.deploy(MintController, nftAddress, mintFee, mintStartTime, maxBatchSize);
  const mintControllerInstance = await MintController.deployed();
  console.log("MintController deployed at:", mintControllerInstance.address);


//   // 4️⃣ Grant MINTER_ROLE to MintController (compute role instead of hardcoding)
//   // Try to read MINTER_ROLE from contract if available, otherwise compute via keccak256  const nft = await ERC721TOKEN.deployed();
//   let MINTER_ROLE;
  
  
// try {
//     // If the ERC721 contract exposes MINTER_ROLE as public, this should work:
//     if (typeof nftInstance.MINTER_ROLE === "function") {
//       MINTER_ROLE = await nftInstance.MINTER_ROLE();
//     } else if (typeof nftInstance.MINTER_ROLE !== "undefined") {
//       // sometimes Truffle exposes constants as properties (rare). Use it if present.
//       MINTER_ROLE = nftInstance.MINTER_ROLE;
//     } else {
//       // fallback: compute deterministically
//       MINTER_ROLE = web3.utils.keccak256("MINTER_ROLE");
//     }
//   } catch (err) {
//     MINTER_ROLE = web3.utils.keccak256("MINTER_ROLE");
//   }

//   console.log("Using MINTER_ROLE:", MINTER_ROLE);

//   try {
//     // accounts[0] should be deployer/admin on the NFT contract
//     await nftInstance.grantRole(MINTER_ROLE, mintControllerInstance.address, { from: accounts[0] });
//     console.log("✅ MintController granted MINTER_ROLE");
//   } catch (error) {
//     console.log("⚠️ Grant role error:", error.message || error);
//     // optionally rethrow if you want migration to fail:
//     // throw error;
  // }

  // console.log(`\n🚀 Starting deployment on: ${network}`);
  // console.log(`👑 Owner account: ${owner}`);
  //
  // // 1️⃣ Deploy NFT with name & symbol in constructor
  // await deployer.deploy(NFT, "MyNFT", "MNFT", { from: owner });
  // const nft = await NFT.deployed();
  // console.log(`✅ NFT deployed at: ${nft.address}`);
  //
  // // 2️⃣ Deploy MintController and pass NFT address in constructor
  // await deployer.deploy(MintController, { from: owner });
  // const MintController = await MintController.deployed();
  // console.log(`✅ MintController deployed at: ${MintController.address}`);

  // 3️⃣ (Optional) Set MintController address in NFT (if your contract supports it)
  // await nft.setMarketplaceAddress(MintController.address, { from: owner });

  // 4️⃣ (Optional) Transfer ownership of NFT to deployer/DAO
  // await nft.transferOwnership(owner, { from: owner });

  // console.log("\n🎯 Deployment complete!");
  // console.log(`📜 NFT Address: ${nft.address}`);
  // console.log(`🏪 MintController Address: ${MintController.address}\n`);


};
