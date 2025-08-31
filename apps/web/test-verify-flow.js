const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function testVerifyFlow() {
  try {
    console.log('Testing verify flow by simulating a verification...');
    
    // Simulate a successful verification
    const response = await fetch('http://localhost:3000/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'VERIFY',
        docHash: '0x' + '1234567890abcdef'.repeat(4), // Valid 64-char hex hash
        status: 'success'
      })
    });
    
    console.log('API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Verification recorded successfully:', data);
      
      // Check total VERIFY activities
      const verifyCount = await prisma.activity.count({
        where: {
          type: 'VERIFY'
        }
      });
      
      console.log('Total VERIFY activities in database:', verifyCount);
      
      // Simulate another verification
      const response2 = await fetch('http://localhost:3000/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'VERIFY',
          docHash: '0x' + 'abcdef1234567890'.repeat(4), // Different valid 64-char hex hash
          status: 'success'
        })
      });
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('Second verification recorded:', data2);
        
        const newVerifyCount = await prisma.activity.count({
          where: {
            type: 'VERIFY'
          }
        });
        
        console.log('New total VERIFY activities:', newVerifyCount);
        console.log('Count increased by:', newVerifyCount - verifyCount);
      }
    } else {
      const errorData = await response.text();
      console.error('Failed to record verification:', errorData);
    }
    
  } catch (error) {
    console.error('Error testing verify flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVerifyFlow();