const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function testUserVerification() {
  try {
    console.log('Testing user verification flow...');
    
    // Get current count
    const initialCount = await prisma.activity.count({
      where: {
        type: 'VERIFY',
        status: 'success'
      }
    });
    
    console.log('Initial VERIFY count:', initialCount);
    
    // Simulate a user verification with a realistic document hash
    const testHash = '0x' + 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';
    
    const response = await fetch('http://localhost:3000/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'VERIFY',
        docHash: testHash,
        status: 'success'
      })
    });
    
    console.log('API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('User verification recorded:', data);
      
      // Check new count
      const newCount = await prisma.activity.count({
        where: {
          type: 'VERIFY',
          status: 'success'
        }
      });
      
      console.log('New VERIFY count:', newCount);
      console.log('Count increased by:', newCount - initialCount);
      
      // Test a failed verification too
      const failedHash = '0x' + 'f1e2d3c4b5a6789012345678901234567890fedcba1234567890fedcba123456';
      
      const failedResponse = await fetch('http://localhost:3000/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'VERIFY',
          docHash: failedHash,
          status: 'failed',
          error: 'Credential not found on blockchain'
        })
      });
      
      if (failedResponse.ok) {
        const failedData = await failedResponse.json();
        console.log('Failed verification recorded:', failedData);
        
        // Check final counts
        const [totalVerify, successVerify, failedVerify] = await Promise.all([
          prisma.activity.count({ where: { type: 'VERIFY' } }),
          prisma.activity.count({ where: { type: 'VERIFY', status: 'success' } }),
          prisma.activity.count({ where: { type: 'VERIFY', status: 'failed' } })
        ]);
        
        console.log('Final counts:');
        console.log('- Total VERIFY activities:', totalVerify);
        console.log('- Successful VERIFY activities:', successVerify);
        console.log('- Failed VERIFY activities:', failedVerify);
      }
    } else {
      const errorData = await response.text();
      console.error('Failed to record verification:', errorData);
    }
    
  } catch (error) {
    console.error('Error testing user verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserVerification();