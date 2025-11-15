// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

/**
 * @title TRC20 interface (compatible with ERC20 interface)
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */
  interface IERC20 {
      function totalSupply() external view returns (uint256);

      function balanceOf(address who) external view returns (uint256);

      function allowance(address owner, address spender)
      external view returns (uint256);

      function transfer(address to, uint256 value) external returns (bool);

      function approve(address spender, uint256 value)
      external returns (bool);

      function transferFrom(address from, address to, uint256 value)
      external returns (bool);

  }
  interface IERC721 {
    //Transfer ownership of NFT
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;

    //
    function getSerialMintedCount() external view returns (uint256);

    function updateSerialCount(uint256 value) external;

    function mint(address to, uint256 tokenId) external returns (uint256);

    function safeMint(address _to,uint256 tokenId) external returns (uint256);


    //Transfer ownership of NFT
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

  }

  interface IAccessControl {
      function hasRole(bytes32 role, address account) external view returns (bool);
      function getRoleAdmin(bytes32 role) external view returns (bytes32);
      function grantRole(bytes32 role, address account) external;
      function revokeRole(bytes32 role, address account) external;
      function renounceRole(bytes32 role, address account) external;
  }

