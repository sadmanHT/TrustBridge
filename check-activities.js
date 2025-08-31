const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkActivities() {
  try {
    console.log('Checking database activities...')
    
    // Count all activities by type and status
    const allActivities = await prisma.activity.findMany({
      select: {
        type: true,
        status: true,
        createdAt: true,
        userId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('\nAll activities:')
    allActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.type} - ${activity.status} - ${activity.createdAt.toISOString()} - User: ${activity.userId || 'Anonymous'}`)
    })
    
    // Count totals
    const totalVerify = await prisma.activity.count({
      where: {
        type: 'VERIFY',
        status: 'success'
      }
    })
    
    const totalIssue = await prisma.activity.count({
      where: {
        type: 'ISSUE',
        status: 'success'
      }
    })
    
    console.log('\n=== SUMMARY ===')
    console.log(`Total successful VERIFY activities: ${totalVerify}`)
    console.log(`Total successful ISSUE activities: ${totalIssue}`)
    console.log(`Total activities: ${allActivities.length}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkActivities()