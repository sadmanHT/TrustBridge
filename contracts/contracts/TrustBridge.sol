// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustBridge
 * @dev A contract for anchoring document hashes on Ethereum with issuer verification
 * @notice This contract allows approved issuers to anchor document hashes and enables verification
 */
contract TrustBridge is Ownable, ReentrancyGuard {
    // Struct to store credential information
    struct Credential {
        address issuer;        // Address of the issuer
        bool valid;           // Whether the credential is valid (not revoked)
        string cidOrEmpty;    // IPFS CID or empty string
        uint256 timestamp;    // When the credential was issued
    }

    // Mapping from document hash to credential info
    mapping(bytes32 => Credential) public credentials;
    
    // Mapping to track approved issuers
    mapping(address => bool) public approvedIssuers;
    
    // Array to keep track of all approved issuers for enumeration
    address[] public issuerList;
    
    // Events
    event IssuerApproved(address indexed issuer, address indexed approver);
    event IssuerRevoked(address indexed issuer, address indexed revoker);
    event CredentialIssued(bytes32 indexed docHash, address indexed issuer, string cidOrEmpty);
    event CredentialRevoked(bytes32 indexed docHash, address indexed issuer);

    // Custom errors
    error NotApprovedIssuer();
    error CredentialAlreadyExists();
    error CredentialNotFound();
    error CredentialAlreadyRevoked();
    error IssuerAlreadyApproved();
    error IssuerNotApproved();
    error UnauthorizedRevocation();

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Modifier to check if the caller is an approved issuer
     */
    modifier onlyApprovedIssuer() {
        if (!approvedIssuers[msg.sender]) {
            revert NotApprovedIssuer();
        }
        _;
    }

    /**
     * @dev Approve an issuer to issue credentials
     * @param issuer Address of the issuer to approve
     */
    function approveIssuer(address issuer) external onlyOwner {
        if (approvedIssuers[issuer]) {
            revert IssuerAlreadyApproved();
        }
        
        approvedIssuers[issuer] = true;
        issuerList.push(issuer);
        
        emit IssuerApproved(issuer, msg.sender);
    }

    /**
     * @dev Revoke an issuer's approval
     * @param issuer Address of the issuer to revoke
     */
    function revokeIssuer(address issuer) external onlyOwner {
        if (!approvedIssuers[issuer]) {
            revert IssuerNotApproved();
        }
        
        approvedIssuers[issuer] = false;
        
        // Remove from issuer list
        for (uint256 i = 0; i < issuerList.length; i++) {
            if (issuerList[i] == issuer) {
                issuerList[i] = issuerList[issuerList.length - 1];
                issuerList.pop();
                break;
            }
        }
        
        emit IssuerRevoked(issuer, msg.sender);
    }

    /**
     * @dev Issue a credential by anchoring its hash
     * @param docHash SHA-256 hash of the document
     * @param cidOrEmpty IPFS CID or empty string
     */
    function issueCredential(bytes32 docHash, string calldata cidOrEmpty) 
        external 
        onlyApprovedIssuer 
        nonReentrant 
    {
        if (credentials[docHash].issuer != address(0)) {
            revert CredentialAlreadyExists();
        }
        
        credentials[docHash] = Credential({
            issuer: msg.sender,
            valid: true,
            cidOrEmpty: cidOrEmpty,
            timestamp: block.timestamp
        });
        
        emit CredentialIssued(docHash, msg.sender, cidOrEmpty);
    }

    /**
     * @dev Revoke a credential
     * @param docHash SHA-256 hash of the document to revoke
     */
    function revokeCredential(bytes32 docHash) external nonReentrant {
        Credential storage credential = credentials[docHash];
        
        if (credential.issuer == address(0)) {
            revert CredentialNotFound();
        }
        
        if (!credential.valid) {
            revert CredentialAlreadyRevoked();
        }
        
        // Only the issuer or contract owner can revoke
        if (msg.sender != credential.issuer && msg.sender != owner()) {
            revert UnauthorizedRevocation();
        }
        
        credential.valid = false;
        
        emit CredentialRevoked(docHash, credential.issuer);
    }

    /**
     * @dev Verify a credential
     * @param docHash SHA-256 hash of the document to verify
     * @return issuer Address of the issuer
     * @return valid Whether the credential is valid (not revoked)
     * @return cidOrEmpty IPFS CID or empty string
     */
    function verifyCredential(bytes32 docHash) 
        external 
        view 
        returns (address issuer, bool valid, string memory cidOrEmpty) 
    {
        Credential memory credential = credentials[docHash];
        
        return (
            credential.issuer,
            credential.valid && approvedIssuers[credential.issuer],
            credential.cidOrEmpty
        );
    }

    /**
     * @dev Get credential details including timestamp
     * @param docHash SHA-256 hash of the document
     * @return issuer Address of the issuer
     * @return valid Whether the credential is valid
     * @return cidOrEmpty IPFS CID or empty string
     * @return timestamp When the credential was issued
     */
    function getCredentialDetails(bytes32 docHash) 
        external 
        view 
        returns (address issuer, bool valid, string memory cidOrEmpty, uint256 timestamp) 
    {
        Credential memory credential = credentials[docHash];
        
        return (
            credential.issuer,
            credential.valid && approvedIssuers[credential.issuer],
            credential.cidOrEmpty,
            credential.timestamp
        );
    }

    /**
     * @dev Get all approved issuers
     * @return Array of approved issuer addresses
     */
    function getApprovedIssuers() external view returns (address[] memory) {
        address[] memory activeIssuers = new address[](issuerList.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < issuerList.length; i++) {
            if (approvedIssuers[issuerList[i]]) {
                activeIssuers[count] = issuerList[i];
                count++;
            }
        }
        
        // Resize array to actual count
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIssuers[i];
        }
        
        return result;
    }

    /**
     * @dev Check if an address is an approved issuer
     * @param issuer Address to check
     * @return Whether the address is an approved issuer
     */
    function isApprovedIssuer(address issuer) external view returns (bool) {
        return approvedIssuers[issuer];
    }
}