import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Session } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session as Session)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session as Session).user.id
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalIssued, totalVerified, last7dIssued, last7dVerified] = await Promise.all([
      prisma.activity.count({
        where: {
          userId,
          type: 'ISSUE',
          status: 'success'
        }
      }),
      prisma.activity.count({
        where: {
          userId,
          type: 'VERIFY',
          status: 'success'
        }
      }),
      prisma.activity.count({
        where: {
          userId,
          type: 'ISSUE',
          status: 'success',
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.activity.count({
        where: {
          userId,
          type: 'VERIFY',
          status: 'success',
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })
    ])

    return NextResponse.json({
      totalIssued,
      totalVerified,
      last7dIssued,
      last7dVerified
    })
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}