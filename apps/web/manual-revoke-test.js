// Manual revocation test with the actual credential hash
const { PrismaClient } = require('@prisma/client');
const { createWalletClient, http, createPublicClient } = require('viem');
const { sepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

const prisma = new PrismaClient();

// Contract ABI for revokeCredential function
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "docHash",
        "type": "bytes32"
      }
    ],
    "name": "revokeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "docHash",
        "type": "bytes32"
      }
    ],
    "name": "getCredential",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRevoked",
            "type": "bool"
          }
        ],
        "internalType": "struct CredentialRegistry.Credential",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x15aAC17c57390Fb0b0B3424d7FC548082e8A6F5b';
const CREDENTIAL_HASH = '0xd57283fe51b58a9dbfce608a81cc781de43e43dd0ad90132f069c6820923cf82';
const ISSUER_PRIVATE_KEY = '0x3b84a2368d6c906ff07faa257e5b25dd6460896f17d771a583be3761da7e6638';

async function testRevocation() {
  try {
    console.log('=== Manual Revocation Test ===');
    console.log('Credential Hash:', CREDENTIAL_HASH);
    console.log('Contract Address:', CONTRACT_ADDRESS);
    
    // Create account from private key
    const account = privateKeyToAccount(ISSUER_PRIVATE_KEY);
    console.log('Account Address:', account.address);
    
    // Create public client for reading
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http('https://eth-sepolia.g.alchemy.com/v2/HmPTrBgvLI0gbzdkSnkiS')
    });
    
    // Create wallet client for transactions
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http('https://eth-sepolia.g.alchemy.com/v2/HmPTrBgvLI0gbzdkSnkiS')
    });
    
    console.log('\n1. Checking credential status...');
    
    // First, check if credential exists and get its details
    try {
      const credential = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'getCredential',
        args: [CREDENTIAL_HASH]
      });
      
      console.log('Credential found:');
      console.log('  Issuer:', credential[0]);
      console.log('  Timestamp:', new Date(Number(credential[1]) * 1000).toISOString());
      console.log('  Is Revoked:', credential[2]);
      
      if (credential[2]) {
        console.log('\n❌ Credential is already revoked!');
        return;
      }
      
      if (credential[0].toLowerCase() !== account.address.toLowerCase()) {
        console.log('\n❌ Account mismatch!');
        console.log('  Credential issuer:', credential[0]);
        console.log('  Current account:', account.address);
        return;
      }
      
      console.log('\n✓ Credential is valid and can be revoked by current account');
      
    } catch (error) {
      console.error('Error reading credential:', error.message);
      return;
    }
    
    console.log('\n2. Attempting revocation...');
    
    // Attempt to revoke the credential
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'revokeCredential',
        args: [CREDENTIAL_HASH],
        account: account.address
      });
      
      console.log('✓ Simulation successful, sending transaction...');
      
      const txHash = await walletClient.writeContract(request);
      console.log('Transaction sent:', txHash);
      
      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('✓ Transaction confirmed!');
      console.log('  Block:', receipt.blockNumber);
      console.log('  Gas used:', receipt.gasUsed);
      
    } catch (error) {
      console.error('❌ Revocation failed:', error.message);
      console.error('Full error:', error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testRevocation().catch(console.error);