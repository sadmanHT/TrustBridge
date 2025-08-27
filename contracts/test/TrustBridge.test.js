const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustBridge", function () {
  let trustBridge;
  let owner;
  let issuer1;
  let issuer2;
  let user;
  let addrs;

  // Sample document hash for testing
  const sampleHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const sampleCID = "QmSampleCIDForTesting";

  beforeEach(async function () {
    // Get signers
    [owner, issuer1, issuer2, user, ...addrs] = await ethers.getSigners();

    // Deploy contract
    const TrustBridge = await ethers.getContractFactory("TrustBridge");
    trustBridge = await TrustBridge.deploy();
    await trustBridge.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await trustBridge.owner()).to.equal(owner.address);
    });

    it("Should start with no approved issuers", async function () {
      const approvedIssuers = await trustBridge.getApprovedIssuers();
      expect(approvedIssuers.length).to.equal(0);
    });
  });

  describe("Issuer Management", function () {
    it("Should allow owner to approve issuer", async function () {
      await trustBridge.approveIssuer(issuer1.address);
      expect(await trustBridge.isApprovedIssuer(issuer1.address)).to.be.true;
    });

    it("Should emit IssuerApproved event", async function () {
      await expect(trustBridge.approveIssuer(issuer1.address))
        .to.emit(trustBridge, "IssuerApproved")
        .withArgs(issuer1.address, owner.address);
    });

    it("Should not allow non-owner to approve issuer", async function () {
      await expect(
        trustBridge.connect(user).approveIssuer(issuer1.address)
      ).to.be.revertedWithCustomError(trustBridge, "OwnableUnauthorizedAccount");
    });

    it("Should not allow approving same issuer twice", async function () {
      await trustBridge.approveIssuer(issuer1.address);
      await expect(
        trustBridge.approveIssuer(issuer1.address)
      ).to.be.revertedWithCustomError(trustBridge, "IssuerAlreadyApproved");
    });

    it("Should allow owner to revoke issuer", async function () {
      await trustBridge.approveIssuer(issuer1.address);
      await trustBridge.revokeIssuer(issuer1.address);
      expect(await trustBridge.isApprovedIssuer(issuer1.address)).to.be.false;
    });

    it("Should emit IssuerRevoked event", async function () {
      await trustBridge.approveIssuer(issuer1.address);
      await expect(trustBridge.revokeIssuer(issuer1.address))
        .to.emit(trustBridge, "IssuerRevoked")
        .withArgs(issuer1.address, owner.address);
    });

    it("Should return correct approved issuers list", async function () {
      await trustBridge.approveIssuer(issuer1.address);
      await trustBridge.approveIssuer(issuer2.address);
      
      const approvedIssuers = await trustBridge.getApprovedIssuers();
      expect(approvedIssuers.length).to.equal(2);
      expect(approvedIssuers).to.include(issuer1.address);
      expect(approvedIssuers).to.include(issuer2.address);
    });
  });

  describe("Credential Management", function () {
    beforeEach(async function () {
      // Approve issuer1 for testing
      await trustBridge.approveIssuer(issuer1.address);
    });

    it("Should allow approved issuer to issue credential", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      
      const credential = await trustBridge.credentials(sampleHash);
      expect(credential.issuer).to.equal(issuer1.address);
      expect(credential.valid).to.be.true;
      expect(credential.cidOrEmpty).to.equal(sampleCID);
      expect(credential.timestamp).to.be.gt(0);
    });

    it("Should emit CredentialIssued event", async function () {
      await expect(
        trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID)
      )
        .to.emit(trustBridge, "CredentialIssued")
        .withArgs(sampleHash, issuer1.address, sampleCID);
    });

    it("Should not allow non-approved issuer to issue credential", async function () {
      await expect(
        trustBridge.connect(user).issueCredential(sampleHash, sampleCID)
      ).to.be.revertedWithCustomError(trustBridge, "NotApprovedIssuer");
    });

    it("Should not allow issuing same credential twice", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await expect(
        trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID)
      ).to.be.revertedWithCustomError(trustBridge, "CredentialAlreadyExists");
    });

    it("Should allow issuer to revoke their credential", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await trustBridge.connect(issuer1).revokeCredential(sampleHash);
      
      const credential = await trustBridge.credentials(sampleHash);
      expect(credential.valid).to.be.false;
    });

    it("Should allow owner to revoke any credential", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await trustBridge.connect(owner).revokeCredential(sampleHash);
      
      const credential = await trustBridge.credentials(sampleHash);
      expect(credential.valid).to.be.false;
    });

    it("Should emit CredentialRevoked event", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await expect(trustBridge.connect(issuer1).revokeCredential(sampleHash))
        .to.emit(trustBridge, "CredentialRevoked")
        .withArgs(sampleHash, issuer1.address);
    });

    it("Should not allow unauthorized revocation", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await expect(
        trustBridge.connect(user).revokeCredential(sampleHash)
      ).to.be.revertedWithCustomError(trustBridge, "UnauthorizedRevocation");
    });

    it("Should not allow revoking non-existent credential", async function () {
      await expect(
        trustBridge.connect(issuer1).revokeCredential(sampleHash)
      ).to.be.revertedWithCustomError(trustBridge, "CredentialNotFound");
    });

    it("Should not allow revoking already revoked credential", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await trustBridge.connect(issuer1).revokeCredential(sampleHash);
      await expect(
        trustBridge.connect(issuer1).revokeCredential(sampleHash)
      ).to.be.revertedWithCustomError(trustBridge, "CredentialAlreadyRevoked");
    });
  });

  describe("Credential Verification", function () {
    beforeEach(async function () {
      await trustBridge.approveIssuer(issuer1.address);
    });

    it("Should verify valid credential", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      
      const [issuer, valid, cid] = await trustBridge.verifyCredential(sampleHash);
      expect(issuer).to.equal(issuer1.address);
      expect(valid).to.be.true;
      expect(cid).to.equal(sampleCID);
    });

    it("Should return invalid for non-existent credential", async function () {
      const [issuer, valid, cid] = await trustBridge.verifyCredential(sampleHash);
      expect(issuer).to.equal(ethers.ZeroAddress);
      expect(valid).to.be.false;
      expect(cid).to.equal("");
    });

    it("Should return invalid for revoked credential", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await trustBridge.connect(issuer1).revokeCredential(sampleHash);
      
      const [issuer, valid, cid] = await trustBridge.verifyCredential(sampleHash);
      expect(issuer).to.equal(issuer1.address);
      expect(valid).to.be.false;
      expect(cid).to.equal(sampleCID);
    });

    it("Should return invalid for credential from revoked issuer", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      await trustBridge.revokeIssuer(issuer1.address);
      
      const [issuer, valid, cid] = await trustBridge.verifyCredential(sampleHash);
      expect(issuer).to.equal(issuer1.address);
      expect(valid).to.be.false;
      expect(cid).to.equal(sampleCID);
    });

    it("Should get credential details with timestamp", async function () {
      await trustBridge.connect(issuer1).issueCredential(sampleHash, sampleCID);
      
      const [issuer, valid, cid, timestamp] = await trustBridge.getCredentialDetails(sampleHash);
      expect(issuer).to.equal(issuer1.address);
      expect(valid).to.be.true;
      expect(cid).to.equal(sampleCID);
      expect(timestamp).to.be.gt(0);
    });
  });
});