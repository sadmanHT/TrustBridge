// Test MetaMask connection and account verification
// This should be run in the browser console

const testMetaMaskConnection = async () => {
  try {
    console.log('=== Testing MetaMask Connection ===');
    
    // Check if MetaMask is available
    if (typeof window.ethereum === 'undefined') {
      console.error('MetaMask is not installed');
      return;
    }
    
    console.log('✓ MetaMask detected');
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('Connected accounts:', accounts);
    
    // Check current account
    const currentAccount = accounts[0];
    console.log('Current account:', currentAccount);
    
    // Expected issuer account
    const expectedIssuer = '0x9b3B275B3934571729d4528499BE268B15F80c5e';
    console.log('Expected issuer:', expectedIssuer);
    
    // Check if current account matches expected issuer
    if (currentAccount.toLowerCase() === expectedIssuer.toLowerCase()) {
      console.log('✓ Current account matches expected issuer');
    } else {
      console.log('✗ Account mismatch!');
      console.log('  Current:', currentAccount);
      console.log('  Expected:', expectedIssuer);
      console.log('\nPlease switch to the correct account in MetaMask');
    }
    
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    console.log('Expected chain ID: 0xaa36a7 (Sepolia)');
    
    if (chainId === '0xaa36a7') {
      console.log('✓ Connected to Sepolia network');
    } else {
      console.log('✗ Wrong network! Please switch to Sepolia');
    }
    
  } catch (error) {
    console.error('Error testing MetaMask connection:', error);
  }
};

// Instructions for browser console
console.log('Copy and paste this function into your browser console:');
console.log('testMetaMaskConnection();');

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testMetaMaskConnection };
}