const hre = require("hardhat");

async function main() {
  const registryAddress = process.env.REGISTRY_ADDRESS;
  const issuerAddress = process.env.ISSUER_ADDRESS;

  if (!registryAddress || !issuerAddress) {
    throw new Error("Please set REGISTRY_ADDRESS and ISSUER_ADDRESS in your environment");
  }

  // Load the deployed Registry contract
  const Registry = await hre.ethers.getContractAt("CredentialRegistry", registryAddress);

  console.log(`Approving issuer ${issuerAddress} on registry ${registryAddress}...`);

  const tx = await Registry.approveIssuer(issuerAddress, true);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log(`✅ Issuer approved successfully: ${issuerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});