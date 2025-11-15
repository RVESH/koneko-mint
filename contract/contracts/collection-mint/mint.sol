// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./safeMath.sol";
import "./roleMember.sol";


abstract contract Mint is EmergencyControl{

   using SafeMath for uint256;
   IERC721 nftContract;

   uint256 public constant TOKEN_LIMIT = 10000; // number of token to be minted

   uint256 public totalMinted;
   uint256 private randomNonce;

   mapping(uint256 => uint256) private availableTokenIndices;
   mapping ( uint256 => address) private tokenMinters;

  /**
   * @dev Emitted when a new NFT is minted.
   *
   * `account` is the address that received the minted NFT.
   * `tokenId` is the unique identifier of the newly minted token.
   */
   event NewMint(address indexed account,uint256 tokenId);


   constructor (address nftAddress) {
      nftContract = IERC721(nftAddress);
   }

  /**
   * @dev Returns the contract address of the current NFT instance.
   */
   function getNftContract() public view returns (address){
     return address(nftContract);
   }

  /**
   * @dev Updates the NFT contract address.
   * Can only be called by an account with the Dev role.
   *
   * Requirements:
   * - `nftAddress` cannot be the zero address.
   * - `nftAddress` must be different from the current NFT contract address.
   *
   * @param nftAddress The new NFT contract address.
   * @return bool Returns true if the update is successful.
 */
   function updateNftContract(address nftAddress) public isDev returns (bool){
     require(nftAddress != address(0),"Mint: account is the zero address");
     require(nftAddress != address(nftContract),"Mint: same as current nft contract");
     nftContract = IERC721(nftAddress);
     return true;
   }

  /**
   * @dev Returns the address that minted a given token ID.
   * @param tokenId The ID of the token.
   * @return The address of the minter.
   */
   function minterOf(uint tokenId) public view returns (address){
     return tokenMinters[tokenId];
   }

  /**
   * @dev Returns the addresses that minted a list of token IDs.
   * @param tokenIds An array of token IDs.
   * @return An array of addresses corresponding to each token's minter.
   */
   function mintersOf(uint256 [] memory tokenIds) public view returns (address [] memory){
      address[] memory minters = new address[](tokenIds.length);

      for (uint256 i = 0; i < tokenIds.length; i++) {
         minters[i] = tokenMinters[tokenIds[i]];
      }
      return minters;
   }


  /**
   * @dev Generates a pseudo-random index for minting an NFT.
   * This ensures that each minted token gets a unique index without repetition.
   *
   * Mechanism:
   * - Selects a random index from the range of unminted tokens.
   * - Uses `availableTokenIndices` to track which positions are already taken.
   * - Swaps the chosen position with the last available one to prevent reuse.
   *
   * @return uint256 The generated random index.
   */
   function randomIndex() private returns (uint256) {
      uint256 unmintedSize = TOKEN_LIMIT - totalMinted;

      // Generate pseudo-random number based on nonce, sender, blockhash, and timestamp
      uint256 index = uint256(
         keccak256(
               abi.encodePacked(
                  randomNonce,
                  _msgSender(),
                  blockhash(block.number),
                  block.timestamp
               )
         )
      ) % unmintedSize;

      uint256 value = 0;

      if (availableTokenIndices[index] != 0) {
         value = availableTokenIndices[index];
      } else {
         value = index;
      }

      // Move the last available value into the selected slot
      if (availableTokenIndices[unmintedSize - 1] == 0) {
         // Array position not initialized, so use position
         availableTokenIndices[index] = unmintedSize - 1;
      } else {
         // Array position holds a value so use that
         availableTokenIndices[index] = availableTokenIndices[unmintedSize - 1];
      }

      randomNonce++;
      return value;
   }

  /**
   * @dev Internal function to mint a new NFT to the given `recipient`.
   *
   * - Ensures the total minted count does not exceed `TOKEN_LIMIT`.
   * - Generates a pseudo-random unique token ID using `randomIndex()`.
   * - Records the recipient address as the minter of the token.
   * - Mints the NFT via the external NFT contract.
   * - Emits a {NewMint} event.
   *
   * @param recipient The address that will receive the newly minted NFT.
   * @return uint256 The ID of the minted NFT.
   */
   function _mint(address recipient) internal returns (uint256) {
      require(totalMinted < TOKEN_LIMIT, "Mint: All tokens have already been minted");

      uint256 tokenId = randomIndex();

      totalMinted += 1;
      tokenMinters[tokenId] = recipient;

      nftContract.safeMint(recipient, tokenId);
      emit NewMint(recipient, tokenId);

      return tokenId;
   }

}


 contract MintController is Context,Mint{
   using SafeMath for uint256;

   uint256 private mintFee;
   uint256 public mintStartTime;
   uint256 public maxBatchSize;


   constructor(address nftAddress, uint256 _mintFee, uint256 _mintStartTime, uint256 _maxBatchSize)
   Mint(nftAddress)
   {
      require(_mintFee > 0, "Collection: mint fee must be > 0");
      require(_maxBatchSize > 0, "Collection: batch size must be > 0");

      mintFee = _mintFee;
      mintStartTime = _mintStartTime;
      maxBatchSize = _maxBatchSize;
   }

    modifier canMint() {
      require(TOKEN_LIMIT != totalMinted,"Collection: minting completed");
      require(block.timestamp >= mintStartTime,"Collection : Minting not started yet");
      _;
    }

  /**
   * @notice Returns the current minting fee in wei.
   * @return Current minting fee.
   */
   function getMintFee() external view returns (uint256) {
      return mintFee;
   }

  /**
   * @notice Updates the minting fee.
   * @dev Can only be called by a developer.
   * @param newFee New minting fee in wei. Must be greater than 0 and different from the current value.
   */
   function setMintFee(uint256 newFee) external isDev returns (uint256) {
      require(newFee > 0, "Collection: Fee must be greater than zero");
      require(newFee != mintFee, "Collection: Same as current fee");
      mintFee = newFee;
      return mintFee;
   }

  /**
   * @notice Updates the mint start time.
   * @dev Can only be called by a developer.
   * @param newStartTime Unix timestamp when minting should start. Must be in the future.
   */
   function setMintStartTime(uint256 newStartTime) external isDev returns (uint256) {
      require(newStartTime > block.timestamp, "Collection: Start time must be in the future");
      mintStartTime = newStartTime;
      return mintStartTime;
   }

  /**
   * @notice Updates the maximum mint batch size.
   * @dev Can only be called by a developer.
   * @param _newMaxBatchSize New maximum number of tokens per batch.
   */
   function updateMaxBatchSize(uint256 _newMaxBatchSize) external isDev {
      require(_newMaxBatchSize > 0, "Collection: batch size must be > 0");
      require(_newMaxBatchSize != maxBatchSize, "Collection: same as current value");
      maxBatchSize = _newMaxBatchSize;
   }


  /**
   * @dev Mints a single token to the specified recipient in exchange for the required minting fee.
   *
   * Requirements:
   * - The contract must not be paused.
   * - Minting must be allowed (per `canMint`).
   * - The `recipient` must not have the blocked role.
   * - `recipient` cannot be the zero address.
   * - `msg.value` must be at least `mintFee`.
   *
   * Effects:
   * - Transfers the minted token to `recipient`.
   * - Refunds any excess ETH sent above `mintFee` back to the caller.
   *
   * @param recipient The address to receive the minted token.
   * @return success A boolean indicating whether the mint operation was successful.
   */
   function mint(address payable recipient)
      public
      payable
      canMint
      isNotPaused
      notBlocked(recipient)
      returns (bool success)
   {
      require(recipient != address(0), "Collection: Recipient cannot be the zero address");
      require(msg.value >= mintFee, "Collection: Insufficient fees provided");

      _mint(recipient);

      // Refund excess ETH if any
      if (msg.value > mintFee) {
         (bool sent, ) = payable(_msgSender()).call{value: msg.value.sub(mintFee)}("");
         require(sent, "Collection: Refund transfer failed");
      }

      return true;
   }

  /**
   * @dev Mints multiple tokens to the specified recipient in a single transaction,
   *      in exchange for the required batch minting fees.
   *
   * Requirements:
   * - The contract must not be paused.
   * - Minting must be allowed (per `canMint`).
   * - The `recipient` must not have the blocked role.
   * - `recipient` cannot be the zero address.
   * - `quantity` must not exceed `MAX_BATCH`.
   * - `msg.value` must be at least `mintFee * quantity`.
   *
   * Notes:
   * - If the requested `quantity` exceeds the remaining supply, it is adjusted to the available amount.
   *
   * Effects:
   * - Transfers the specified number of minted tokens (adjusted if necessary) to `recipient`.
   * - Refunds any excess ETH sent above the total required fee back to the caller.
   *
   * @param recipient The address to receive the minted tokens.
   * @param quantity The number of tokens to mint in this batch.
   * @return success A boolean indicating whether the batch mint operation was successful.
   */
   function mintBatch(address payable recipient, uint256 quantity)
      public
      payable
      canMint
      isNotPaused
      notBlocked(recipient)
      returns (bool success)
   {
      require(quantity > 0, "Collection: must mint at least 1");
      require(quantity <= maxBatchSize, "Collection: exceeds batch limit");
      require(recipient != address(0), "Collection: Recipient cannot be the zero address");

      if(TOKEN_LIMIT - totalMinted < quantity){
         quantity = TOKEN_LIMIT - totalMinted;
      }


      uint256 totalFee = mintFee.mul(quantity);
      require(msg.value >= totalFee, "Collection: Insufficient fees provided");

      for (uint256 i = 0; i < quantity; i++) {
         _mint(recipient);
      }

      // Refund excess ETH if any
      if (msg.value > totalFee) {
         (bool sent, ) = payable(_msgSender()).call{value: msg.value.sub(totalFee)}("");
         require(sent, "Collection: Refund transfer failed");
      }

      return true;
   }

  /**
   * @dev Mints multiple tokens to the specified recipient in a single transaction,
   *      without requiring payment (free mint), subject to applicable constraints.
   *
   * Requirements:
   * - The contract must not be paused.
   * - Minting must be allowed (per `canMint`).
   * - Caller must have the minter role (`isMinter`).
   * - The `recipient` must not have the blocked role.
   * - `recipient` cannot be the zero address.
   * - `quantity` must not exceed `MAX_BATCH`.
   *
   * Notes:
   * - If the requested `quantity` exceeds the remaining supply, it is adjusted to the available amount.
   *
   * Effects:
   * - Transfers the specified number of minted tokens (adjusted if necessary) to `recipient`.
   *
   * @param recipient The address to receive the minted tokens.
   * @param quantity The number of tokens to mint in this batch.
   * @return success A boolean indicating whether the batch mint operation was successful.
 */
   function freeMint(address payable recipient, uint256 quantity)
      public
      canMint
      isNotPaused
      isMinter
      notBlocked(recipient)
      returns (bool success)
   {
      require(quantity > 0, "Collection: must mint at least 1");
      require(quantity <= maxBatchSize, "Collection: exceeds batch limit");
      require(recipient != address(0), "Collection: Recipient cannot be the zero address");

      if(TOKEN_LIMIT - totalMinted < quantity){
         quantity = TOKEN_LIMIT - totalMinted;
      }

      for (uint256 i = 0; i < quantity; i++) {
         _mint(recipient);
      }

      return true;
   }

 }
