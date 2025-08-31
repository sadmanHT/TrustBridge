// Check what credentials actually exist on the blockchain
const { PrismaClient } = require('@prisma/client');
const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

const prisma = new PrismaClient();

// Contract ABI for reading credentials
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "docHash",
        "type": "bytes32"
      }
    ],
    "name": "getCredentialDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "valid",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "cidOrEmpty",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
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
    "name": "verifyCredential",
    "outputs": [
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "valid",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "cidOrEmpty",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x15aAC17c57390Fb0b0B3424d7FC548082e8A6F5b';

async function checkCredentials() {
  try {
    console.log('=== Checking Existing Credentials ===');
    
    // Create public client for reading
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http('https://eth-sepolia.g.alchemy.com/v2/HmPTrBgvLI0gbzdkSnkiS')
    });
    
    console.log('Contract Address:', CONTRACT_ADDRESS);
    
    // Get all issued credentials from database
    console.log('\n1. Getting issued credentials from database...');
    const issuedCredentials = await prisma.activity.findMany({
      where: {
        type: 'ISSUE',
        status: 'success'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`Found ${issuedCredentials.length} issued credentials in database:`);
    
    for (let i = 0; i < issuedCredentials.length; i++) {
      const cred = issuedCredentials[i];
      console.log(`\n${i + 1}. Hash: ${cred.docHash}`);
      console.log(`   Wallet: ${cred.wallet}`);
      console.log(`   TX: ${cred.txHash}`);
      console.log(`   Created: ${cred.createdAt}`);
      
      // Check if this credential exists on blockchain
      try {
        console.log('   Checking on blockchain...');
        
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: contractABI,
          functionName: 'verifyCredential',
          args: [cred.docHash]
        });
        
        console.log(`   ✓ On-chain status:`);
        console.log(`     Issuer: ${result[0]}`);
        console.log(`     Valid: ${result[1]}`);
        console.log(`     CID: ${result[2]}`);
        
        if (result[1]) {
          console.log(`   ✓ This credential is VALID and can be revoked`);
        } else {
          console.log(`   ❌ This credential is INVALID/REVOKED`);
        }
        
      } catch (error) {
        console.log(`   ❌ Not found on blockchain: ${error.message}`);
      }
    }
    
    // Test the specific credential that was failing
    console.log('\n2. Testing specific failing credential...');
    const failingHash = '0xd57283fe51b58a9dbfce608a81cc781de43e43dd0ad90132f069c6820923cf82';
    console.log('Hash:', failingHash);
    
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'verifyCredential',
        args: [failingHash]
      });
      
      console.log('✓ Found on blockchain:');
      console.log('  Issuer:', result[0]);
      console.log('  Valid:', result[1]);
      console.log('  CID:', result[2]);
      
    } catch (error) {
      console.log('❌ Not found on blockchain:', error.message);
    }
    
  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkCredentials().catch(console.error);