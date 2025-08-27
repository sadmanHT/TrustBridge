const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TrustBridge contract...");

  // Get the contract factory
  const TrustBridge = await ethers.getContractFactory("TrustBridge");

  // Deploy the contract
  const trustBridge = await TrustBridge.deploy();
  await trustBridge.waitForDeployment();

  const contractAddress = await trustBridge.getAddress();
  console.log("TrustBridge deployed to:", contractAddress);

  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Verify deployment
  console.log("\nVerifying deployment...");
  const owner = await trustBridge.owner();
  console.log("Contract owner:", owner);
  console.log("Owner matches deployer:", owner === deployer.address);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment completed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  
  console.log("\nDeployment Info:", JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

// Handle errors
main()
  .then((address) => {
    console.log("\n✅ Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });