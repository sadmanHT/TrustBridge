const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialRegistry", function () {
  let credentialRegistry;
  let owner;
  let issuerA;
  let issuerB;
  let nonIssuer;
  
  const testDocHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));
  const testCid = "QmTestCID123456789";
  
  beforeEach(async function () {
    // Get signers
    [owner, issuerA, issuerB, nonIssuer] = await ethers.getSigners();
    
    // Deploy contract
    const CredentialRegistryFactory = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistryFactory.deploy();
    await credentialRegistry.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await credentialRegistry.owner()).to.equal(owner.address);
    });
    
    it("Should have no approved issuers initially", async function () {
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.false;
      expect(await credentialRegistry.approvedIssuers(issuerB.address)).to.be.false;
    });
  });
  
  describe("Issuer Management", function () {
    it("Should allow owner to approve issuer", async function () {
      await credentialRegistry.approveIssuer(issuerA.address, true);
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.true;
    });
    
    it("Should emit IssuerApproved event when approving issuer", async function () {
      await expect(credentialRegistry.approveIssuer(issuerA.address, true))
        .to.emit(credentialRegistry, "IssuerApproved")
        .withArgs(issuerA.address, true);
    });
    
    it("Should allow owner to disapprove issuer", async function () {
      // First approve
      await credentialRegistry.approveIssuer(issuerA.address, true);
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.true;
      
      // Then disapprove
      await credentialRegistry.approveIssuer(issuerA.address, false);
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.false;
    });
    
    it("Should not allow non-owner to approve issuer", async function () {
      await expect(
        credentialRegistry.connect(issuerA).approveIssuer(issuerB.address, true)
      ).to.be.revertedWithCustomError(credentialRegistry, "OwnableUnauthorizedAccount");
    });
  });
  
  describe("Credential Issuance", function () {
    beforeEach(async function () {
      // Approve issuerA
      await credentialRegistry.approveIssuer(issuerA.address, true);
    });
    
    it("Should allow approved issuer to issue credential", async function () {
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid);
      
      const credential = await credentialRegistry.credentials(testDocHash);
      expect(credential.issuer).to.equal(issuerA.address);
      expect(credential.valid).to.be.true;
      expect(credential.cid).to.equal(testCid);
    });
    
    it("Should emit CredentialIssued event", async function () {
      await expect(
        credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid)
      )
        .to.emit(credentialRegistry, "CredentialIssued")
        .withArgs(testDocHash, issuerA.address, testCid);
    });
    
    it("Should not allow non-approved issuer to issue credential", async function () {
      await expect(
        credentialRegistry.connect(nonIssuer).issueCredential(testDocHash, testCid)
      ).to.be.revertedWith("NotApprovedIssuer");
    });
    
    it("Should allow same issuer to re-issue credential", async function () {
      // First issuance
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid);
      
      // Re-issuance by same issuer should work
      const newCid = "QmNewCID987654321";
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, newCid);
      
      const credential = await credentialRegistry.credentials(testDocHash);
      expect(credential.cid).to.equal(newCid);
    });
    
    it("Should not allow different issuer to override existing credential", async function () {
      // Approve issuerB
      await credentialRegistry.approveIssuer(issuerB.address, true);
      
      // IssuerA issues first
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid);
      
      // IssuerB tries to override - should fail
      await expect(
        credentialRegistry.connect(issuerB).issueCredential(testDocHash, "QmDifferentCID")
      ).to.be.revertedWithCustomError(credentialRegistry, "UnauthorizedReissuance");
    });
  });
  
  describe("Credential Verification", function () {
    beforeEach(async function () {
      // Approve issuerA and issue a credential
      await credentialRegistry.approveIssuer(issuerA.address, true);
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid);
    });
    
    it("Should verify valid credential correctly", async function () {
      const [issuer, valid, cid] = await credentialRegistry.verifyCredential(testDocHash);
      
      expect(issuer).to.equal(issuerA.address);
      expect(valid).to.be.true;
      expect(cid).to.equal(testCid);
    });
    
    it("Should return invalid for non-existent credential", async function () {
      const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      const [issuer, valid, cid] = await credentialRegistry.verifyCredential(nonExistentHash);
      
      expect(issuer).to.equal(ethers.ZeroAddress);
      expect(valid).to.be.false;
      expect(cid).to.equal("");
    });
    
    it("Should return invalid when issuer is no longer approved", async function () {
      // Disapprove the issuer
      await credentialRegistry.approveIssuer(issuerA.address, false);
      
      const [issuer, valid, cid] = await credentialRegistry.verifyCredential(testDocHash);
      
      expect(issuer).to.equal(issuerA.address);
      expect(valid).to.be.false; // Should be false because issuer is no longer approved
      expect(cid).to.equal(testCid);
    });
  });
  
  describe("Credential Revocation", function () {
    beforeEach(async function () {
      // Approve issuerA and issue a credential
      await credentialRegistry.approveIssuer(issuerA.address, true);
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid);
    });
    
    it("Should allow issuer to revoke their credential", async function () {
      await credentialRegistry.connect(issuerA).revokeCredential(testDocHash);
      
      const credential = await credentialRegistry.credentials(testDocHash);
      expect(credential.valid).to.be.false;
    });
    
    it("Should emit CredentialRevoked event", async function () {
      await expect(
        credentialRegistry.connect(issuerA).revokeCredential(testDocHash)
      )
        .to.emit(credentialRegistry, "CredentialRevoked")
        .withArgs(testDocHash, issuerA.address);
    });
    
    it("Should show valid=false after revocation in verification", async function () {
      // Revoke the credential
      await credentialRegistry.connect(issuerA).revokeCredential(testDocHash);
      
      // Verify should show valid=false
      const [issuer, valid, cid] = await credentialRegistry.verifyCredential(testDocHash);
      
      expect(issuer).to.equal(issuerA.address);
      expect(valid).to.be.false;
      expect(cid).to.equal(testCid);
    });
    
    it("Should not allow non-issuer to revoke credential", async function () {
      await expect(
        credentialRegistry.connect(nonIssuer).revokeCredential(testDocHash)
      ).to.be.revertedWithCustomError(credentialRegistry, "UnauthorizedRevocation");
    });
    
    it("Should not allow revoking non-existent credential", async function () {
      const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      
      await expect(
        credentialRegistry.connect(issuerA).revokeCredential(nonExistentHash)
      ).to.be.revertedWithCustomError(credentialRegistry, "CredentialNotFound");
    });
  });
  
  describe("Owner Toggle Approvals", function () {
    it("Should allow owner to toggle issuer approvals multiple times", async function () {
      // Initially not approved
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.false;
      
      // Approve
      await credentialRegistry.approveIssuer(issuerA.address, true);
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.true;
      
      // Disapprove
      await credentialRegistry.approveIssuer(issuerA.address, false);
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.false;
      
      // Approve again
      await credentialRegistry.approveIssuer(issuerA.address, true);
      expect(await credentialRegistry.approvedIssuers(issuerA.address)).to.be.true;
    });
    
    it("Should affect credential issuance when toggling approvals", async function () {
      // Initially approve issuerA
      await credentialRegistry.approveIssuer(issuerA.address, true);
      
      // Should be able to issue
      await credentialRegistry.connect(issuerA).issueCredential(testDocHash, testCid);
      
      // Disapprove issuerA
      await credentialRegistry.approveIssuer(issuerA.address, false);
      
      // Should not be able to issue new credentials
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("new document"));
      await expect(
        credentialRegistry.connect(issuerA).issueCredential(newHash, "QmNewCID")
      ).to.be.revertedWith("NotApprovedIssuer");
      
      // Re-approve issuerA
      await credentialRegistry.approveIssuer(issuerA.address, true);
      
      // Should be able to issue again
      await credentialRegistry.connect(issuerA).issueCredential(newHash, "QmNewCID");
      
      const credential = await credentialRegistry.credentials(newHash);
      expect(credential.issuer).to.equal(issuerA.address);
      expect(credential.valid).to.be.true;
    });
  });
});