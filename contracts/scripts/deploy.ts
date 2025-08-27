import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Deploying CredentialRegistry...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy CredentialRegistry
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();

  const contractAddress = await credentialRegistry.getAddress();
  console.log("CredentialRegistry deployed to:", contractAddress);

  // Get the ABI
  const artifact = await ethers.getContractFactory("CredentialRegistry");
  const abi = artifact.interface.formatJson();

  // Generate contract config for frontend
  const contractConfig = {
    address: contractAddress,
    abi: JSON.parse(abi)
  };

  // Write to frontend config file
  const frontendConfigPath = join(__dirname, "../../apps/web/src/contractConfig.json");
  writeFileSync(frontendConfigPath, JSON.stringify(contractConfig, null, 2));
  console.log("Contract config written to:", frontendConfigPath);

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});