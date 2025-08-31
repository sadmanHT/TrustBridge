// Debug script to check revoke functionality
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugRevoke() {
  try {
    console.log('=== Debugging Revoke Functionality ===');
    
    const wallet = '0x9b3B275B3934571729d4528499BE268B15F80c5e';
    
    console.log('\n1. Checking all issued credentials for this wallet...');
    const issuedCredentials = await prisma.activity.findMany({
      where: {
        wallet: wallet,
        type: 'ISSUE',
        status: 'success'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${issuedCredentials.length} issued credentials:`);
    issuedCredentials.forEach((cred, index) => {
      console.log(`  ${index + 1}. Hash: ${cred.docHash}`);
      console.log(`     Issued: ${cred.createdAt}`);
      console.log(`     TX: ${cred.txHash}`);
      console.log('');
    });
    
    if (issuedCredentials.length > 0) {
      const testHash = issuedCredentials[0].docHash;
      console.log(`\n2. Checking revoke attempts for most recent credential: ${testHash}`);
      
      const revokeAttempts = await prisma.activity.findMany({
        where: {
          docHash: testHash,
          type: 'REVOKE'
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`Found ${revokeAttempts.length} revoke attempts for this credential:`);
      revokeAttempts.forEach((attempt, index) => {
        console.log(`  ${index + 1}. Status: ${attempt.status}, Created: ${attempt.createdAt}`);
      });
    }
    
    console.log('\n3. Checking user wallet connection...');
    const userWallet = await prisma.userWallet.findFirst({
      where: {
        address: wallet
      },
      include: {
        user: true
      }
    });
    
    if (userWallet) {
      console.log('User wallet found:', {
        userId: userWallet.userId,
        address: userWallet.address,
        userEmail: userWallet.user.email
      });
    } else {
      console.log('No user wallet connection found');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRevoke();