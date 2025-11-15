// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "./context.sol";
import "./interface.sol";

abstract contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account,bool status);

    bool internal paused;

   /**
    * @dev Ensures that the contract is not in a paused state.
    *
    * Requirements:
    * - The contract must not be paused.
    * - Reverts with "Collection: contract is paused" if the contract is currently paused.
    */
    modifier isNotPaused() {
        require(!paused, "Pausable: contract is paused");
        _;
    }

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor () {
        paused = false;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */

    function isPaused() public view virtual returns (bool) {
        return paused;
    }

    /**
     * @dev Triggers state.
     * @param _paused is state of contract to be set
     */
    function _pause(bool _paused) internal virtual{
        paused = _paused;
        emit Paused(_msgSender(),_paused);
    }

}

abstract contract AccessControl is  Context,IAccessControl {

    struct RoleData {
        mapping (address => bool) members;
        bytes32 adminRole;
    }

    mapping (bytes32 => RoleData) private _roles;


    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 constant DEV_ROLE = keccak256("DEV_ROLE");
    bytes32 constant BLOCK_ROLE = keccak256("BLOCK_ROLE");
    bytes32 constant MINTER_ROLE = keccak256("MINTER_ROLE");


    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted signaling this.
     *
     * _Available since v3.1._
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);



    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call, an admin role
     * bearer except when using {_setupRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);


    /**
     * @dev Restricts function access to accounts that hold the DEFAULT_ADMIN_ROLE.
     *
     * Requirements:
     * - The caller must have been granted the DEFAULT_ADMIN_ROLE.
     * - Reverts with "AccessControl: !Owner" if the caller does not have this role.
     */
    modifier isOwner(){
      require(hasRole(DEFAULT_ADMIN_ROLE,_msgSender()), "AccessControl: !Owner");
        _;
    }

    /**
     * @dev Restricts function access to accounts that hold the DEV_ROLE.
     *
     * Requirements:
     * - The caller must have been granted the DEV_ROLE.
     * - Reverts with "AccessControl: !Dev" if the caller does not have this role.
     */
    modifier isDev(){
      require(hasRole(DEV_ROLE,_msgSender()), "AccessControl: !Dev");
        _;
    }

   /**
    * @dev Prevents execution if the given account has been assigned the BLOCK_ROLE.
    *
    * Requirements:
    * - The `account` must NOT have the BLOCK_ROLE.
    * - Reverts with "Collection: recipient has blocked role" if the account is blocked.
    */
    modifier notBlocked(address account) {
        require(!hasRole(BLOCK_ROLE, account), "AccessControl: account has blocked role");
        _;
    }

    /**
     * @dev Restricts function access to accounts that hold the MINTER_ROLE.
     *
     * Requirements:
     * - The caller must have been granted the MINTER_ROLE.
     * - Reverts with "AccessControl: !Minter" if the caller does not have this role.
     */
    modifier isMinter(){
      require(hasRole(MINTER_ROLE,_msgSender()), "AccessControl: !Minter");
        _;
    }

    constructor(){
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender()); 
        _setupRole(DEV_ROLE, _msgSender());

        _setRoleAdmin(BLOCK_ROLE,DEV_ROLE); // Dev controlls block user
        _setRoleAdmin(MINTER_ROLE,DEV_ROLE); // Dev controlls free minter user
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return _roles[role].members[account];
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
        return _roles[role].adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) public virtual override {
        require(hasRole(getRoleAdmin(role), _msgSender()), "AccessControl: sender must be an admin to grant");

        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) public virtual override {
        require(hasRole(getRoleAdmin(role), _msgSender()), "AccessControl: sender must be an admin to revoke");

        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `account`.
     * - 'role' must not be 'BLOCKED_ROLE'
     */
    function renounceRole(bytes32 role, address account) public virtual override {
        require(account == _msgSender(), "AccessControl: can only renounce roles for self");
        require(role != keccak256("BLOCKED_ROLE"), "AccessControl: role can not be renounced");

        _revokeRole(role, account);
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event. Note that unlike {grantRole}, this function doesn't perform any
     * checks on the calling account.
     *
     * [WARNING]
     * ====
     * This function should only be called from the constructor when setting
     * up the initial roles for the system.
     *
     * Using this function in any other way is effectively circumventing the admin
     * system imposed by {AccessControl}.
     * ====
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        emit RoleAdminChanged(role, getRoleAdmin(role), adminRole);
        _roles[role].adminRole = adminRole;
    }

    function _grantRole(bytes32 role, address account) private {
        if (!hasRole(role, account)) {
            _roles[role].members[account] = true;
            emit RoleGranted(role, account, _msgSender());
        }
    }

    function _revokeRole(bytes32 role, address account) private {
        if (hasRole(role, account)) {
            _roles[role].members[account] = false;
            emit RoleRevoked(role, account, _msgSender());
        }
    }
}


abstract contract EmergencyControl  is AccessControl,Pausable{

    /**
     * @notice Sets the contract's paused state.
     * @dev If paused, all functions with `whenNotPaused` will be disabled.
     * @param _paused The new paused state to set.
     */
    function setPause(bool _paused) public virtual isDev{
        _pause(_paused);
    }

    /**
     * @notice Withdraws ETH from the contract to a specified address.
     * @dev Only callable by the contract owner.
     * @param to The address to transfer ETH to.
     * @param value The amount of ETH (in wei) to be transferred.
     */
    function claimETH(address payable to, uint256 value) public isOwner {
        require(to != address(0), "EmergencyControl: zero address");
        require(address(this).balance >= value, "EmergencyControl: Insufficient ETH balance");
        (bool success, ) = to.call{value: value}("");
        require(success, "EmergencyControl: ETH transfer failed");
    }

    /**
     * @notice Withdraws ERC20 tokens from the contract to a specified address.
     * @dev Only callable by the contract owner.
     * @param to The address to transfer tokens to.
     * @param value The amount of tokens to be transferred.
     * @param token The ERC20 token contract address.
     */
    function claimERC20(address to, uint256 value, address token) public isOwner {
        require(to != address(0), "EmergencyControl: zero address");
        require(IERC20(token).transfer(to, value), "EmergencyControl: ERC20 transfer failed");
    }

    /**
     * @notice Withdraws an ERC721 NFT from the contract to a specified address.
     * @dev Only callable by the contract owner.
     * @param to The address to transfer the NFT to.
     * @param tokenId The ID of the NFT to be transferred.
     * @param token The ERC721 token contract address.
     */
    function claimERC721(address to, uint256 tokenId, address token) public isOwner {
        require(to != address(0), "EmergencyControl: zero address");
        IERC721(token).transferFrom(address(this), to, tokenId);
    }

    // Accept ETH directly
    receive() external payable {}

    fallback() external payable {}


}