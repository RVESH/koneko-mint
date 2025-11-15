// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./interface.sol";

abstract contract FailsafeControl {

    /**
     * @notice Withdraws ETH from the contract to a specified address.
     * @param to The address to transfer ETH to.
     * @param value The amount of ETH (in wei) to be transferred.
     */
    function _rescueETH(address payable to, uint256 value) internal {
        require(to != address(0), "FailsafeControl: zero address");
        require(address(this).balance >= value, "FailsafeControl: Insufficient ETH balance");
        (bool success, ) = to.call{value: value}("");
        require(success, "FailsafeControl: ETH transfer failed");
    }

    /**
     * @notice Withdraws ERC20 tokens from the contract to a specified address.
     * @param to The address to transfer tokens to.
     * @param value The amount of tokens to be transferred.
     * @param token The ERC20 token contract address.
     */
    function _rescueERC20(address to, uint256 value, address token) internal {
        require(to != address(0), "FailsafeControl: zero address");
        require(IERC20(token).transfer(to, value), "FailsafeControl: ERC20 transfer failed");
    }

    /**
     * @notice Withdraws an ERC721 NFT from the contract to a specified address.
     * @param to The address to transfer the NFT to.
     * @param tokenId The ID of the NFT to be transferred.
     * @param token The ERC721 token contract address.
     */
    function _rescueERC721(address to, uint256 tokenId, address token) internal {
        require(to != address(0), "FailsafeControl: zero address");
        IERC721(token).transferFrom(address(this), to, tokenId);
    }

    // Accept ETH directly
    receive() external payable {}

    fallback() external payable {}


}