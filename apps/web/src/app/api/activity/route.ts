import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { activityRateLimiter, createRateLimitHeaders } from '@/lib/rate-limiter'

// Activity validation schema that matches Prisma model
const activitySchema = z.object({
  type: z.enum(['ISSUE', 'VERIFY', 'REVOKE']),
  wallet: z.string().min(4, 'Wallet address required').optional(),
  docHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid document hash format'),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
  cid: z.string().optional(),
  status: z.enum(['success', 'failed', 'revoked']),
  error: z.string().optional(), // Allow error messages for failed activities
}).refine((data) => {
  // Wallet is required for ISSUE type, optional for VERIFY
  if (data.type === 'ISSUE' && !data.wallet) {
    return false;
  }
  return true;
}, {
  message: "Wallet address is required for ISSUE activities",
  path: ["wallet"]
})



export async function POST(request: NextRequest) {
  try {
    // Parse request body first to check activity type
    const body = await request.json()
    const activityType = body.type
    
    // Check authentication - required for ISSUE and REVOKE, optional for VERIFY
    const session = await getServerSession(authOptions)
    if ((activityType === 'ISSUE' || activityType === 'REVOKE') && (!session?.user || !(session as Session).user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to perform this action.' },
        { status: 401 }
      )
    }

    // Apply rate limiting (use session user ID if available, otherwise use IP)
    const rateLimitKey = session?.user ? (session as Session).user.id : request.ip || 'anonymous'
    const rateLimitResult = activityRateLimiter.check(rateLimitKey)
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: rateLimitHeaders
        }
      )
    }
    const validationResult = activitySchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const activityData = validationResult.data

    // Create the activity record
    const activity = await prisma.activity.create({
      data: {
        userId: session?.user ? (session as Session).user.id : null,
        type: activityData.type,
        wallet: activityData.wallet || null,
        docHash: activityData.docHash,
        txHash: activityData.txHash,
        cid: activityData.cid,
        status: activityData.status,
      },
    })

    // Update verification tracking for verifier users
    if (activityData.type === 'VERIFY' && 
        activityData.status === 'success' && 
        session?.user && 
        (session as Session).user.id) {
      
      const userId = (session as Session).user.id
      
      // Get user to check role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })
      
      // Only track for verifier users
      if (user?.role === 'VERIFIER') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            verificationCount: {
              increment: 1
            },
            verificationFeesDue: {
              increment: 5.00 // $5 per verification
            }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        type: activity.type,
        wallet: activity.wallet,
        docHash: activity.docHash,
        txHash: activity.txHash,
        cid: activity.cid,
        status: activity.status,
        createdAt: activity.createdAt,
      },
    }, {
      headers: rateLimitHeaders
    })
  } catch (error: unknown) {
    console.error('Activity creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error while recording activity' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user activities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as Session).user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items
    const type = searchParams.get('type') as 'ISSUE' | 'VERIFY' | null
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    const skip = (page - 1) * limit

    // Build where clause with proper typing
    interface WhereClause {
      userId?: string | null;
      type?: 'ISSUE' | 'VERIFY';
      status?: string;
      OR?: Array<{
        wallet?: { contains: string; mode: 'insensitive' };
        docHash?: { contains: string; mode: 'insensitive' };
        txHash?: { contains: string; mode: 'insensitive' };
        cid?: { contains: string; mode: 'insensitive' };
      }>;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    }

    // Include all activities (both user and anonymous) for dashboard view
    const where: WhereClause = {}
    
    // Add user filter only when specifically requested
    if (searchParams.get('userOnly') === 'true') {
      where.userId = (session as Session).user.id
    }
    
    if (type && ['ISSUE', 'VERIFY', 'REVOKE'].includes(type)) {
      where.type = type as 'ISSUE' | 'VERIFY' | 'REVOKE'
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { wallet: { contains: search, mode: 'insensitive' } },
        { docHash: { contains: search, mode: 'insensitive' } },
        { txHash: { contains: search, mode: 'insensitive' } },
        { cid: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Get activities with pagination
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        select: {
          id: true,
          type: true,
          wallet: true,
          docHash: true,
          txHash: true,
          cid: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ])

    return NextResponse.json({
      activities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}