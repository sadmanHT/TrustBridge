import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get global statistics
    const [totalUsers, totalActivities, totalWallets, recentActivities] = await Promise.all([
      // Total registered users
      prisma.user.count(),
      
      // Total activities (issues and verifications)
      prisma.activity.count(),
      
      // Total linked wallets
      prisma.userWallet.count(),
      
      // Recent activities in last 24 hours
      prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalActivities,
      totalWallets,
      recentActivities
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}