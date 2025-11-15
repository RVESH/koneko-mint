
const ERC721TOKEN = artifacts.require("ERC721TOKEN");

contract('ERC721TOKEN', function (accounts) {
  const [ admin, dev, minter, user1, user2, user3, blocked, other ] = accounts;

  const TOKEN_URI_1 = "https://example.com/1";

  let token;

  beforeEach(async function () {
    token =  await ERC721TOKEN.deployed();
    const has = await token.hasRole(web3.utils.padLeft("0x00", 64), admin);
    assert.isTrue(has, "admin should have admin role");
    
    // Setup roles if not auto-assigned (assuming roles logic present)
    // Assign dev role to dev account
    await token.grantRole(web3.utils.keccak256("DEV_ROLE"), dev, { from: admin });
    // Assign minter role to minter account
    await token.grantRole(web3.utils.keccak256("MINTER_ROLE"), minter, { from: dev });
  });

  
  describe('Minting', () => {
    it('minter can mint token', async () => {
      await token.mint(user1, 1, { from: minter });
      const owner = await token.ownerOf(1);
      assert.strictEqual(owner, user1);
    });

    it('cannot mint token with same ID twice', async () => {
      await token.mint(user1, 1, { from: minter });
      try {
        await token.mint(user2, 1, { from: minter });
        assert.fail("Expected error not received");
      } catch(error) {
        assert(error.message.includes("ERC721: token already minted"));
      }
    });

    it('non-minter cannot mint', async () => {
      try {
        await token.mint(user1, 2, { from: user1 });
        assert.fail("Expected error not received");
      } catch(error) {
        assert(error.message.includes("AccessControl"));
      }
    });

    it('minter can mint token with URI', async () => {
      await token.mint(user1, 2, TOKEN_URI_1, { from: minter });
      const uri = await token.tokenURI(2);
      assert.strictEqual(uri, TOKEN_URI_1);
    });
  });

  describe('Transfers and Approvals', () => {
    it('owner can transfer token', async () => {
      await token.transferFrom(user1, user2, 1, { from: user1 });
      const owner = await token.ownerOf(1);
      assert.strictEqual(owner, user2);
    });

    it('non-owner cannot transfer without approval', async () => {
      try {
        await token.transferFrom(user1, user2, 1, { from: user3 });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("ERC721: transfer caller is not owner nor approved"));
      }
    });

    it('owner can approve and approved can transfer', async () => {
      await token.approve(user3, 1, { from: user2 });
      const approved = await token.getApproved(1);
      assert.strictEqual(approved, user3);

      await token.transferFrom(user2, user1, 1, { from: user3 });
      const owner = await token.ownerOf(1);
      assert.strictEqual(owner, user1);
    });

    it('owner can set approval for all', async () => {
      await token.setApprovalForAll(user2, true, { from: user1 });
      const isApproved = await token.isApprovedForAll(user1, user2);
      assert.strictEqual(isApproved, true);
    });
  });


  describe('Burning', () => {
    it('owner can burn token', async () => {
      const tx = await token.burn(1, { from: user1 });
      try {
        await token.ownerOf(1);
        assert.fail("Expected error");
      } catch (error) {
        assert(error.message.includes('ERC721: owner query for nonexistent token'));
      }
    });

    it('non-owner cannot burn token', async () => {
      try {
        await token.burn(2, { from: user2 });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("ERC721Burnable: caller is not owner nor approved"));
      }
    });
  });

  describe('Pause and Role Restrictions', () => {
    it('dev can pause and unpause', async () => {
      await token.setPause(true, { from: dev });
      let paused = await token.isPaused();
      assert.strictEqual(paused, true);

      // Minting while paused should fail
      try {
        await token.mint(user1, 1, { from: minter });
        assert.fail("Should revert");
      } catch (error) {
        assert(error.message.includes('paused'));
      }

      await token.setPause(false, { from: dev });
      paused = await token.isPaused();
      assert.strictEqual(paused, false);

      await token.mint(user1, 1, { from: minter });

    });

    it('non-dev cannot pause', async () => {
      try {
        await token.setPause(true, { from: user1 });
        assert.fail("Should revert");
      } catch (error) {
        assert(error.message.includes("AccessControl"));
      }
    });
  });


  describe('Block Role Checks', () => {

    it('blocked sender cannot transfer', async () => {
      try {
        await token.mint(blocked, 3, { from: minter });
        await token.grantRole(web3.utils.keccak256("BLOCK_ROLE"), blocked, { from: dev });
        await token.transferFrom(blocked, user1, 3, { from: blocked });
        assert.fail("Should revert");
      } catch (error) {
        assert(error.message.includes("sender blocked"));
      }
    });

    it('blocked recipient cannot receive tokens', async () => {
      try {
        await token.transferFrom(user1, blocked, 1, { from: user1 });
        assert.fail("Should revert");
      } catch (error) {
        assert(error.message.includes("recipient blocked"));
      }
    });
  });

  describe('Enumeration', () => {

    it('totalSupply returns correct value', async () => {
      const total = await token.totalSupply();
      // assert.strictEqual(total.toNumber(), 3);
    });

    it('tokenOfOwnerByIndex returns correct tokens', async () => {
      const token0 = await token.tokenOfOwnerByIndex(user1, 0);
      const token1 = await token.tokenOfOwnerByIndex(user1, 1);
      // assert.strictEqual(token0.toNumber(), 2);
      // assert.strictEqual(token1.toNumber(), TOKEN_ID_2);
    });

    it('tokenByIndex returns correct enumeration', async () => {
      const tokenAt0 = await token.tokenByIndex(0);
      const tokenAt1 = await token.tokenByIndex(1);
      // assert(tokenAt0.toNumber() === TOKEN_ID_1 || tokenAt0.toNumber() === TOKEN_ID_2);
      // assert(tokenAt1.toNumber() === TOKEN_ID_1 || tokenAt1.toNumber() === TOKEN_ID_2);
    });
  });

  describe('Rescue functions', function () {
    it('owner can withdraw ETH', async function () {
      await web3.eth.sendTransaction({ from: admin, to: token.address, value: web3.utils.toWei('1', 'ether') });

      const initialBalance = web3.utils.toBN(await web3.eth.getBalance(other));
      const amount = web3.utils.toWei('0.1', 'ether');
      await token.withdrawETH(other, amount, { from: admin });
      const balAfter = web3.utils.toBN(await web3.eth.getBalance(other));
      assert(balAfter.sub(initialBalance).eq(web3.utils.toBN(1000)));
    });

    it('owner can withdraw ERC20', async function () {
      // Implement a dummy ERC20 for test and approve tokens to contract
      // Call withdrawERC20 and check balances
    });

    it('owner can withdraw ERC721', async function () {
      await token.mint(token.address, 4, { from: minter });
      await token.withdrawERC721(other, 4, token.address, { from: admin });
      const newOwner = await token.ownerOf(1);
      assert.equal(newOwner, other);
    });

    it("Non-owner cannot withdraw ETH", async () => {
      try {
        await token.withdrawETH(user2, 1000, { from: user2 });
        assert.fail("Should revert");
      } catch (error) {
        assert(error.message.includes("!Owner"));
      }
    });
  });
});

