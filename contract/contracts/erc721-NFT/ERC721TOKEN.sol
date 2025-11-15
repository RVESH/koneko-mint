// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./context.sol";
import "./AccessControlWithEnumerable.sol";
import "./ERC721.sol";
import "./FailsafeControl.sol";

contract ERC721TOKEN is Context, AccessControlEnumerable, ERC721Enumerable, ERC721Pausable, ERC721Burnable, FailsafeControl {

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(DEV_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());

        _setRoleAdmin(MINTER_ROLE,DEV_ROLE);
        _setRoleAdmin(BLOCK_ROLE,DEV_ROLE);

    }

    function mint(address to,uint256 tokenId) public onlyMinter returns (uint256) {
        _mint(to, tokenId);
        return tokenId;
    }

    function mint(address to,uint256 tokenId,string memory tokenURI) public onlyMinter returns (uint256) {
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function safeMint(address to,uint256 tokenId) public onlyMinter returns (uint256) {
        _safeMint(to, tokenId);
        return tokenId;
    }
    
    function safeMint(address to,uint256 tokenId,string memory tokenURI) public onlyMinter returns (uint256) {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    /**
     * @notice Sets the contract's paused state.
     * @param _paused The new paused state to set.
     */
    function setPause(bool _paused) public virtual onlyDev{
        _pause(_paused);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {

        // Blocklist enforcement
        if (from != address(0)) {
            require(!hasRole(BLOCK_ROLE, from), "ERC721TOKEN: sender blocked");
        }
        if (to != address(0)) {
            require(!hasRole(BLOCK_ROLE, to), "ERC721TOKEN: recipient blocked");
        }

        // Proceed with inherited logic if checks pass
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    function withdrawETH(address payable to, uint256 value) external onlyOwner {
        _rescueETH(to, value);
    }

    function withdrawERC20(address to, uint256 value, address token) external onlyOwner {
        _rescueERC20(to, value, token);
    }

    function withdrawERC721(address to, uint256 tokenId, address token) external onlyOwner {
        _rescueERC721(to, tokenId, token);
    }
}
