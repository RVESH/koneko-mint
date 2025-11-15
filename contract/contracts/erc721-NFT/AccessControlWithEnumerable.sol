// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


import "./context.sol";
import "./EnumerableSet.sol";
import "./ERC165.sol";

interface IAccessControl {
    /**
     * @dev Returns `true` if `account` has been granted `role`.
     *
     * @param role The role identifier as a bytes32.
     * @param account The address to check for the role.
     * @return A boolean indicating whether the `account` has the `role`.
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. 
     * Only accounts with this admin role can grant or revoke `role`.
     *
     * @param role The role identifier as a bytes32.
     * @return The bytes32 identifier of the admin role for the given `role`.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     * If `account` did not have the role before, emits a {RoleGranted} event.
     *
     * Requirements:
     * - The caller must have the admin role for the `role`.
     *
     * @param role The role identifier as a bytes32.
     * @param account The address to be granted the role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     * If `account` had the role before, emits a {RoleRevoked} event.
     *
     * Requirements:
     * - The caller must have the admin role for the `role`.
     *
     * @param role The role identifier as a bytes32.
     * @param account The address to revoke the role from.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Allows the calling account to renounce a role it has.
     * Emits a {RoleRevoked} event if the role was held by the caller.
     *
     * Requirements:
     * - The caller must be the `account` itself.
     *
     * @param role The role identifier as a bytes32.
     * @param account The address that is renouncing the role (must be the caller).
     */
    function renounceRole(bytes32 role, address account) external;
}

interface IAccessControlEnumerable {
    /**
     * @dev Returns one of the accounts that have `role`, at a given `index`.
     * You can use along with {getRoleMemberCount} to enumerate all role members.
     *
     * Requirements:
     * - `index` must be less than the total number of role members.
     *
     * @param role The role identifier as a bytes32.
     * @param index The index in the role member list.
     * @return The address of the role member at the given index.
     */
    function getRoleMember(bytes32 role, uint256 index) external view returns (address);

    /**
     * @dev Returns the number of accounts that have `role`.
     *
     * @param role The role identifier as a bytes32.
     * @return The number of accounts with the specified role.
     */
    function getRoleMemberCount(bytes32 role) external view returns (uint256);
}

abstract contract AccessControl is  Context, IAccessControl, ERC165 {

    struct RoleData {
        mapping (address => bool) members;
        bytes32 adminRole;
    }

    mapping (bytes32 => RoleData) private _roles;

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
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId
            || super.supportsInterface(interfaceId);
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


abstract contract AccessControlEnumerable is IAccessControlEnumerable, AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;
    
    mapping (bytes32 => EnumerableSet.AddressSet) private _roleMembers;

    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 constant DEV_ROLE = keccak256("DEV_ROLE");
    bytes32 constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 constant BLOCK_ROLE = keccak256("BLOCK_ROLE");


    /**
     * @dev Restricts function access to accounts that hold the DEFAULT_ADMIN_ROLE.
     *
     * Requirements:
     * - The caller must have been granted the DEFAULT_ADMIN_ROLE.
     * - Reverts with "AccessControlEnumerable: !Owner" if the caller does not have this role.
     */
    modifier onlyOwner(){
      require(hasRole(DEFAULT_ADMIN_ROLE,_msgSender()), "AccessControlEnumerable: !Owner");
        _;
    }

    /**
     * @dev Restricts function access to accounts that hold the DEV_ROLE.
     *
     * Requirements:
     * - The caller must have been granted the DEV_ROLE.
     * - Reverts with "AccessControlEnumerable: !Dev" if the caller does not have this role.
     */
    modifier onlyDev(){
      require(hasRole(DEV_ROLE,_msgSender()), "AccessControlEnumerable: !Dev");
        _;
    }

    /**
     * @dev Restricts function access to accounts that hold the MINTER_ROLE.
     *
     * Requirements:
     * - The caller must have been granted the MINTER_ROLE.
     * - Reverts with "AccessControlEnumerable: !Minter" if the caller does not have this role.
     */
    modifier onlyMinter(){
      require(hasRole(MINTER_ROLE,_msgSender()), "AccessControlEnumerable: !Minter");
        _;
    }

   /**
    * @dev Prevents execution if the given account has been assigned the BLOCK_ROLE.
    *
    * Requirements:
    * - The `account` must NOT have the BLOCK_ROLE.
    * - Reverts with "AccessControlEnumerable: recipient has blocked role" if the account is blocked.
    */
    modifier isNotBlocked(address account) {
        require(!hasRole(BLOCK_ROLE, account), "AccessControlEnumerable: account has blocked role");
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControlEnumerable).interfaceId
            || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns one of the accounts that have `role`. `index` must be a
     * value between 0 and {getRoleMemberCount}, non-inclusive.
     *
     * Role bearers are not sorted in any particular way, and their ordering may
     * change at any point.
     *
     * WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure
     * you perform all queries on the same block. See the following
     * https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post]
     * for more information.
     */
    function getRoleMember(bytes32 role, uint256 index) public view override returns (address) {
        return _roleMembers[role].at(index);
    }

    /**
     * @dev Returns the number of accounts that have `role`. Can be used
     * together with {getRoleMember} to enumerate all bearers of a role.
     */
    function getRoleMemberCount(bytes32 role) public view override returns (uint256) {
        return _roleMembers[role].length();
    }

    /**
     * @dev Overload {grantRole} to track enumerable memberships
     */
    function grantRole(bytes32 role, address account) public virtual override {
        super.grantRole(role, account);
        _roleMembers[role].add(account);
    }

    /**
     * @dev Overload {revokeRole} to track enumerable memberships
     */
    function revokeRole(bytes32 role, address account) public virtual override {
        super.revokeRole(role, account);
        _roleMembers[role].remove(account);
    }

    /**
     * @dev Overload {renounceRole} to track enumerable memberships
     */
    function renounceRole(bytes32 role, address account) public virtual override {
        super.renounceRole(role, account);
        _roleMembers[role].remove(account);
    }

    /**
     * @dev Overload {_setupRole} to track enumerable memberships
     */
    function _setupRole(bytes32 role, address account) internal virtual override {
        super._setupRole(role, account);
        _roleMembers[role].add(account);
    }

}
