const ERC721TOKEN  = artifacts.require("ERC721TOKEN");
const MintController = artifacts.require("MintController");

// truffle test ./test/collection-mint.js

contract("MintController Full Suite", (accounts) => {
  const [owner, dev, minter, user1, user2, blocked, recipient] = accounts;
  let instance;
  let erc721;
  let mintFee;


  before(async () => {
    // Connect to already deployed ERC721
    erc721 = await ERC721TOKEN.deployed();

    instance = await MintController.deployed();
    mintFee = await instance.getMintFee();
    
    await erc721.grantRole(web3.utils.keccak256("MINTER_ROLE"), instance.address, { from: owner });

    // Give roles
    await instance.grantRole(web3.utils.keccak256("DEV_ROLE"), dev, { from: owner });
    await instance.grantRole(web3.utils.keccak256("MINTER_ROLE"), minter, { from: owner });
    await instance.grantRole(web3.utils.keccak256("BLOCK_ROLE"), blocked, { from: dev });

  });


  // -----------------------
  // Deployment Tests
  // -----------------------
  it("should have correct initial NFT contract address", async () => {
    const nftAddr = await instance.getNftContract();    
    assert.equal(nftAddr, erc721.address, "NFT address should match initial value");
  });

  it("should have positive mint fee", async () => {
    const fee = await instance.getMintFee();
    assert(fee > 0, "Mint fee should be > 0");
  });

  // -------------------------
  // Role & AccessControl Tests
  // -------------------------
  it("Owner should have DEFAULT_ADMIN_ROLE", async () => {
    const has = await instance.hasRole(web3.utils.padLeft("0x00", 64), owner);
    assert.isTrue(has, "Owner should have admin role");
  });

  it("Dev can grant and revoke roles", async () => {
    await instance.grantRole(web3.utils.keccak256("MINTER_ROLE"), user1, { from: dev });
    assert.isTrue(await instance.hasRole(web3.utils.keccak256("MINTER_ROLE"), user1));
    await instance.revokeRole(web3.utils.keccak256("MINTER_ROLE"), user1, { from: dev });
    assert.isFalse(await instance.hasRole(web3.utils.keccak256("MINTER_ROLE"), user1));
  });

  it("Non-admin cannot grant roles", async () => {
    try {
      await instance.grantRole(web3.utils.keccak256("MINTER_ROLE"), user1, { from: user1 });
      assert.fail("Expected revert");
    } catch (err) {
      assert.include(err.message, "sender must be an admin");
    }
  });

  // -----------------------
  // Dev role functions
  // -----------------------
  it("should allow only Dev to update NFT contract address", async () => {
    // const newNFTAddress = user1;
    // await instance.updateNftContract(newNFTAddress, { from: owner }); // assuming owner is Dev
    // const updatedAddr = await instance.getNftContract();
    // assert.equal(updatedAddr, newNFTAddress, "NFT contract should be updated");
  });

  it("should revert if NFT contract update is zero address", async () => {
    try {
      await instance.updateNftContract("0x0000000000000000000000000000000000000000", { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      assert.include(err.message, "zero address");
    }
  });

  // -------------------------
  // Pause / Unpause
  // -------------------------
  it("Dev can pause and unpause", async () => {
    await instance.setPause(true, { from: dev });
    assert.isTrue(await instance.isPaused());
    await instance.setPause(false, { from: dev });
    assert.isFalse(await instance.isPaused());
  });

  it("Pause should block minting", async () => {
    await instance.setPause(true, { from: dev });
    try {
      await instance.mint(user1, { from: user1, value: mintFee });
      assert.fail("Expected paused revert");
    } catch (err) {
      assert.include(err.message, "paused");
    }
    await instance.setPause(false, { from: dev });
  });

  // -------------------------
  // Blocked Role
  // -------------------------
  it("Blocked user cannot receive mints", async () => {
    try {
      await instance.mint(blocked, { from: owner, value: mintFee });
      assert.fail("Expected blocked role revert");
    } catch (err) {
      assert.include(err.message, "blocked");
    }
  });

  // -----------------------
  // Mint Fee update tests
  // -----------------------
  it("should allow Dev to set new mint fee", async () => {
    const newFee = mintFee.addn(100);
    await instance.setMintFee(newFee, { from: owner });
    const updatedFee = await instance.getMintFee();
    assert.equal(updatedFee.toString(), newFee.toString(), "Mint fee updated");
    await instance.setMintFee(mintFee, { from: owner });
  });


  // -------------------------
  // Mint Functions
  // -------------------------
  it("Should mint with exact fee", async () => {
    const tx = await instance.mint(user1, { from: user1, value: mintFee });
    assert.isTrue(tx.receipt.status);
  });

  it("Should refund excess ETH on mint", async () => {
    const overPay = web3.utils.toBN(mintFee)*2;    
    const balBefore = web3.utils.toBN(await web3.eth.getBalance(user1));
    await instance.mint(user1, { from: user1, value: overPay });
    const balAfter = web3.utils.toBN(await web3.eth.getBalance(user1));
  });

  it("mint should fail with insufficient fee", async () => {
    try {
      await instance.mint(user1, { from: user1, value: mintFee.subn(1) });
      assert.fail();
    } catch (err) {
      assert.include(err.message, "Insufficient fees");
    }
  });

  it("should not allow zero address mint", async () => {
    try {
      await instance.freeMint("0x0000000000000000000000000000000000000000", 1, { from: owner });
      assert.fail("Expected revert not received");
    } catch (err) {
      assert.include(err.message, "Recipient cannot be the zero address");
    }
  });

  // -------------------------
  // Batch Mint
  // -------------------------
  it("mintBatch mints correct qty", async () => {
    const qty = 2;
    const totalFee = web3.utils.toBN(mintFee).muln(qty);
    const tx = await instance.mintBatch(user2, qty, { from: user2, value: totalFee });
    assert.isTrue(tx.receipt.status);
  });

  it("mintBatch reverts if exceeds maxBatchSize", async () => {
    const maxBatch = await instance.maxBatchSize();
    try {
      await instance.mintBatch(user2, maxBatch.toNumber() + 1, { from: user2, value: mintFee.muln(maxBatch.toNumber() + 1) });
      assert.fail();
    } catch (err) {
      assert.include(err.message, "exceeds batch limit");
    }
  });

  // -------------------------
  // Free Mint
  // -------------------------
  it("freeMint works for minter role", async () => {
    await instance.freeMint(user1, 1, { from: minter });
  });

  it("freeMint reverts for non-minter", async () => {
    try {
      await instance.freeMint(user2, 1, { from: user2 });
      assert.fail();
    } catch (err) {
      assert.include(err.message, "!Minter");
    }
  });

  it("should freeMint tokens in batch", async () => {
    const result = await instance.freeMint(user1, 3, { from: minter });
    assert.isTrue(result.receipt.status, "Minting should succeed");
  });

  // -------------------------
  // Emergency Withdrawals
  // -------------------------
  it("Owner can claim ETH", async () => {
    const balBefore = web3.utils.toBN(await web3.eth.getBalance(recipient));
    await instance.claimETH(recipient, 1000, { from: owner });
    const balAfter = web3.utils.toBN(await web3.eth.getBalance(recipient));
    assert(balAfter.sub(balBefore).eq(web3.utils.toBN(1000)));
  });

  it("Owner can claim ERC20", async () => {
    // await erc20.transfer(instance.address, 500, { from: owner });
    // await instance.claimERC20(recipient, 500, erc20.address, { from: owner });
    // const bal = await erc20.balanceOf(recipient);
    // assert.equal(bal.toString(), "500");
  });

  it("Owner can claim ERC721", async () => {
    await erc721.mint(instance.address, 1, { from: owner });
    await instance.claimERC721(recipient, 1, erc721.address, { from: owner });
    const newOwner = await erc721.ownerOf(1);
    assert.equal(newOwner, recipient);
  });

  it("Non-owner cannot claim assets", async () => {
    try {
      await instance.claimETH(user2, 1000, { from: user2 });
      assert.fail();
    } catch (err) {
      assert.include(err.message, "!Owner");
    }
  });
});

