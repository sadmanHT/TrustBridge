// Network configuration for Hardhat
export const networks = {
  sepolia: {
    url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    accounts: process.env.WALLET_PRIVATE_KEY ? [`0x${process.env.WALLET_PRIVATE_KEY}`] : [],
    gas: 2100000,
    gasPrice: 8000000000, // 8 gwei
    timeout: 60000 // 60 seconds
  }
};