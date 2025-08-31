import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { activityRateLimiter, createRateLimitHeaders } from '@/lib/rate-limiter'
import { revokeCredential } from '@/lib/contract'
import { Address } from 'viem'

// Revocation validation schema
const revokeSchema = z.object({
  docHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid document hash format'),
  wallet: z.string().min(4, 'Wallet address required'),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication - required for revocation
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session as Session).user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to revoke credentials.' },
        { status: 401 }
      )
    }

    // Apply rate limiting
    const rateLimitKey = (session as Session).user.id
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = revokeSchema.safeParse(body)
    
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

    const { docHash, wallet } = validationResult.data

    try {
      // Call the smart contract revoke function
      const { txHash, receipt } = await revokeCredential(
        docHash as `0x${string}`,
        wallet as Address
      )

      // Record the revocation activity in the database
      const activity = await prisma.activity.create({
        data: {
          userId: (session as Session).user.id,
          type: 'REVOKE',
          wallet: wallet,
          docHash: docHash,
          txHash: txHash,
          status: 'success',
        },
      })

      return NextResponse.json({
        success: true,
        txHash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        activity: {
          id: activity.id,
          type: activity.type,
          wallet: activity.wallet,
          docHash: activity.docHash,
          txHash: activity.txHash,
          status: activity.status,
          createdAt: activity.createdAt,
        },
      }, {
        headers: rateLimitHeaders
      })

    } catch (contractError: any) {
      console.error('Contract revocation error:', contractError)
      
      // Record the failed revocation attempt
      await prisma.activity.create({
        data: {
          userId: (session as Session).user.id,
          type: 'REVOKE',
          wallet: wallet,
          docHash: docHash,
          status: 'failed',
        },
      })

      // Parse contract-specific errors
      let errorMessage = 'Failed to revoke credential'
      if (contractError.message?.includes('CredentialNotFound')) {
        errorMessage = 'Credential not found or already revoked'
      } else if (contractError.message?.includes('UnauthorizedRevocation')) {
        errorMessage = 'You are not authorized to revoke this credential'
      } else if (contractError.message?.includes('CredentialAlreadyRevoked')) {
        errorMessage = 'This credential has already been revoked'
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: contractError.message
        },
        { status: 400, headers: rateLimitHeaders }
      )
    }

  } catch (error: unknown) {
    console.error('Revocation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error while processing revocation' },
      { status: 500 }
    )
  }
}