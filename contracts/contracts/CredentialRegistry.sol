// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CredentialRegistry
 * @dev A contract for managing credential issuance and verification with approved issuers
 * @notice This contract allows the owner to approve issuers who can then issue and revoke credentials
 */
contract CredentialRegistry is Ownable {
    // Mapping to track approved issuers
    mapping(address => bool) public approvedIssuers;
    
    // Struct to store credential information
    struct Credential {
        address issuer;    // Address of the issuer
        bool valid;       // Whether the credential is valid (not revoked)
        string cid;       // IPFS CID or content identifier
    }
    
    // Mapping from document hash to credential info
    mapping(bytes32 => Credential) public credentials;
    
    // Events
    event CredentialIssued(bytes32 indexed hash, address indexed issuer, string cid);
    event CredentialRevoked(bytes32 indexed hash, address indexed issuer);
    event IssuerApproved(address indexed issuer, bool approved);
    
    // Custom errors
    error NotApprovedIssuer();
    error CredentialNotFound();
    error UnauthorizedRevocation();
    error UnauthorizedReissuance();
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Approve or disapprove an issuer
     * @param issuer Address of the issuer
     * @param approved Whether to approve or disapprove the issuer
     */
    function approveIssuer(address issuer, bool approved) external onlyOwner {
        approvedIssuers[issuer] = approved;
        emit IssuerApproved(issuer, approved);
    }
    
    /**
     * @dev Issue a credential by anchoring its hash
     * @param docHash SHA-256 hash of the document
     * @param cid IPFS CID or content identifier
     */
    function issueCredential(bytes32 docHash, string calldata cid) external {
        // Require caller to be an approved issuer
        require(approvedIssuers[msg.sender], "NotApprovedIssuer");
        
        // Check if credential already exists and defend against unauthorized re-issuance
        Credential storage existingCredential = credentials[docHash];
        if (existingCredential.issuer != address(0) && existingCredential.issuer != msg.sender) {
            revert UnauthorizedReissuance();
        }
        
        // Set or update credential
        credentials[docHash] = Credential({
            issuer: msg.sender,
            valid: true,
            cid: cid
        });
        
        emit CredentialIssued(docHash, msg.sender, cid);
    }
    
    /**
     * @dev Revoke a credential
     * @param docHash SHA-256 hash of the document to revoke
     */
    function revokeCredential(bytes32 docHash) external {
        Credential storage credential = credentials[docHash];
        
        // Check if credential exists
        if (credential.issuer == address(0)) {
            revert CredentialNotFound();
        }
        
        // Only the issuer can revoke their credential
        if (credential.issuer != msg.sender) {
            revert UnauthorizedRevocation();
        }
        
        // Mark as invalid
        credential.valid = false;
        
        emit CredentialRevoked(docHash, msg.sender);
    }
    
    /**
     * @dev Verify a credential
     * @param docHash SHA-256 hash of the document to verify
     * @return issuer Address of the issuer
     * @return valid Whether the credential is valid (not revoked and issuer still approved)
     * @return cid IPFS CID or content identifier
     */
    function verifyCredential(bytes32 docHash) 
        external 
        view 
        returns (address issuer, bool valid, string memory cid) 
    {
        Credential memory credential = credentials[docHash];
        
        return (
            credential.issuer,
            credential.valid && approvedIssuers[credential.issuer],
            credential.cid
        );
    }
}