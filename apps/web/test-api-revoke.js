// Test the exact same revocation process as the API
const { createWalletClient, http, createPublicClient } = require('viem');
const { sepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// Contract ABI for revokeCredential function
const contractABI = [
  {
    "type": "function",
    "name": "revokeCredential",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
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
const CREDENTIAL_HASH = '0x8b87d322500e9efa8c2efc8e7882ff1e50e7f1fda9baeb4709f0a355b5a439a2'; // Use a valid one
const ISSUER_PRIVATE_KEY = '0x3b84a2368d6c906ff07faa257e5b25dd6460896f17d771a583be3761da7e6638';

async function testAPIRevocation() {
  try {
    console.log('=== Testing API-style Revocation ===');
    console.log('Credential Hash:', CREDENTIAL_HASH);
    console.log('Contract Address:', CONTRACT_ADDRESS);
    
    // Create account from private key (same as API)
    const account = privateKeyToAccount(ISSUER_PRIVATE_KEY);
    console.log('Account Address:', account.address);
    
    // Create public client for reading
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http('https://eth-sepolia.g.alchemy.com/v2/HmPTrBgvLI0gbzdkSnkiS')
    });
    
    // Create wallet client (same as API)
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http('https://eth-sepolia.g.alchemy.com/v2/HmPTrBgvLI0gbzdkSnkiS')
    });
    
    console.log('\n1. Verifying credential exists and is valid...');
    
    // Verify credential exists (same as API logic)
    const credential = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: 'verifyCredential',
      args: [CREDENTIAL_HASH]
    });
    
    console.log('Credential found:');
    console.log('  Issuer:', credential[0]);
    console.log('  Valid:', credential[1]);
    console.log('  CID:', credential[2]);
    
    if (!credential[1]) {
      console.log('❌ Credential is already revoked!');
      return;
    }
    
    if (credential[0].toLowerCase() !== account.address.toLowerCase()) {
      console.log('❌ Account mismatch!');
      console.log('  Credential issuer:', credential[0]);
      console.log('  Current account:', account.address);
      return;
    }
    
    console.log('✓ Credential is valid and can be revoked by current account');
    
    console.log('\n2. Getting wallet addresses (simulating API logic)...');
    
    // Get addresses from wallet client (same as API)
    const addresses = await walletClient.getAddresses();
    console.log('Wallet addresses:', addresses);
    
    if (!addresses.includes(account.address)) {
      console.log('❌ Account not found in wallet addresses!');
      return;
    }
    
    console.log('✓ Account found in wallet addresses');
    
    console.log('\n3. Simulating contract call (same as API)...');
    
    try {
      // Simulate the contract call first
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'revokeCredential',
        args: [CREDENTIAL_HASH],
        account: account.address
      });
      
      console.log('✓ Simulation successful');
      
      // Execute the transaction (same as API)
      console.log('\n4. Executing transaction...');
      const txHash = await walletClient.writeContract(request);
      console.log('Transaction sent:', txHash);
      
      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('✓ Transaction confirmed!');
      console.log('  Block:', receipt.blockNumber);
      console.log('  Gas used:', receipt.gasUsed);
      console.log('  Status:', receipt.status);
      
      // Verify revocation
      console.log('\n5. Verifying revocation...');
      const updatedCredential = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'verifyCredential',
        args: [CREDENTIAL_HASH]
      });
      
      console.log('Updated credential status:');
      console.log('  Issuer:', updatedCredential[0]);
      console.log('  Valid:', updatedCredential[1]);
      
      if (!updatedCredential[1]) {
        console.log('✅ SUCCESS: Credential has been revoked!');
      } else {
        console.log('❌ FAILED: Credential is still valid');
      }
      
    } catch (error) {
      console.error('❌ Revocation failed:', error.message);
      console.error('Error details:', error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAPIRevocation().catch(console.error);