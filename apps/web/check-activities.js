require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkActivities() {
  try {
    console.log('Checking activities in database...');
    
    const allActivities = await prisma.activity.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        userId: true,
        docHash: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total activities found: ${allActivities.length}`);
    
    const verifyActivities = allActivities.filter(a => a.type === 'VERIFY');
    console.log(`VERIFY activities: ${verifyActivities.length}`);
    
    const successfulVerifies = verifyActivities.filter(a => a.status === 'success');
    console.log(`Successful VERIFY activities: ${successfulVerifies.length}`);
    
    if (allActivities.length > 0) {
      console.log('\nAll activities:');
      allActivities.forEach(activity => {
        console.log(`- ${activity.type} | ${activity.status} | userId: ${activity.userId || 'null'} | ${activity.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivities();