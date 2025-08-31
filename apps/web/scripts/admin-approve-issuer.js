#!/usr/bin/env node

/**
 * Admin script to approve issuers for local testing
 * Usage: node scripts/admin-approve-issuer.js <address>
 * 
 * This script requires:
 * - NEXT_PUBLIC_CONTRACT_ADDRESS environment variable
 * - NEXT_PUBLIC_ALCHEMY_API_KEY environment variable
 * - ADMIN_PRIVATE_KEY environment variable (contract owner's private key)
 */

const { createWalletClient, createPublicClient, http, getAddress } = require('viem');
const { sepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config();

// Contract ABI - only the functions we need
const contractABI = [
  {
    "type": "function",
    "name": "approveIssuer",
    "inputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "approved",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approvedIssuers",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  }
];

async function main() {
  // Validate environment variables
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  
  if (!contractAddress) {
    console.error('❌ Missing NEXT_PUBLIC_CONTRACT_ADDRESS environment variable');
    process.exit(1);
  }
  
  if (!alchemyKey) {
    console.error('❌ Missing NEXT_PUBLIC_ALCHEMY_API_KEY environment variable');
    process.exit(1);
  }
  
  if (!adminPrivateKey) {
    console.error('❌ Missing ADMIN_PRIVATE_KEY environment variable');
    console.error('   Set this to the private key of the contract owner');
    process.exit(1);
  }
  
  // Get address to approve from command line
  const addressToApprove = process.argv[2];
  if (!addressToApprove) {
    console.error('❌ Usage: node scripts/admin-approve-issuer.js <address>');
    console.error('   Example: node scripts/admin-approve-issuer.js 0x1234567890123456789012345678901234567890');
    process.exit(1);
  }
  
  let validAddress;
  try {
    validAddress = getAddress(addressToApprove);
  } catch (error) {
    console.error(`❌ Invalid address format: ${addressToApprove}`);
    process.exit(1);
  }
  
  console.log('🔧 Admin Issuer Approval Script');
  console.log('================================');
  console.log(`Contract: ${contractAddress}`);
  console.log(`Address to approve: ${validAddress}`);
  console.log('');
  
  try {
    // Create clients
    const alchemyUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`;
    
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(alchemyUrl)
    });
    
    const account = privateKeyToAccount(adminPrivateKey);
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(alchemyUrl)
    });
    
    console.log(`📋 Admin account: ${account.address}`);
    
    // Check if admin is the contract owner
    console.log('🔍 Verifying admin permissions...');
    const contractOwner = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'owner'
    });
    
    if (contractOwner.toLowerCase() !== account.address.toLowerCase()) {
      console.error(`❌ Admin account ${account.address} is not the contract owner`);
      console.error(`   Contract owner: ${contractOwner}`);
      process.exit(1);
    }
    
    console.log('✅ Admin permissions verified');
    
    // Check if address is already approved
    console.log('🔍 Checking current approval status...');
    const isAlreadyApproved = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'approvedIssuers',
      args: [validAddress]
    });
    
    if (isAlreadyApproved) {
      console.log(`✅ Address ${validAddress} is already approved as an issuer`);
      process.exit(0);
    }
    
    console.log(`📝 Address ${validAddress} is not yet approved`);
    
    // Approve the issuer
    console.log('🚀 Submitting approval transaction...');
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'approveIssuer',
      args: [validAddress, true]
    });
    
    console.log(`📋 Transaction submitted: ${txHash}`);
    console.log('⏳ Waiting for confirmation...');
    
    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1
    });
    
    if (receipt.status === 'success') {
      console.log('✅ Transaction confirmed!');
      console.log(`🎉 Successfully approved ${validAddress} as an issuer`);
      console.log(`📋 Block: ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed}`);
    } else {
      console.error('❌ Transaction failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('IssuerAlreadyApproved')) {
      console.log('ℹ️  This address is already approved as an issuer');
    } else if (error.message.includes('OwnableUnauthorizedAccount')) {
      console.error('ℹ️  Only the contract owner can approve issuers');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };