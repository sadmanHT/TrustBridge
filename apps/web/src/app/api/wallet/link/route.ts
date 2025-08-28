import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { verifyMessage } from 'viem'
import { z } from 'zod'

// Request validation schema
const linkWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
  nonce: z.string().min(1, 'Nonce is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    if (!(session as Session)?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = linkWalletSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { address, signature, message, nonce } = validationResult.data

    // Verify the nonce matches the session nonce
    // Note: In a real implementation, you'd store the nonce in the session
    // For now, we'll validate the message format
    const expectedMessagePrefix = `Link wallet to TrustBridge\nNonce: ${nonce}`
    if (!message.startsWith(expectedMessagePrefix)) {
      return NextResponse.json(
        { error: 'Invalid message format or nonce' },
        { status: 400 }
      )
    }

    // Verify the signature
    let isValidSignature = false
    try {
      isValidSignature = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
    } catch (error) {
      console.error('Signature verification error:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 400 }
      )
    }

    // Check if wallet is already linked to this user
    const existingWallet = await prisma.userWallet.findFirst({
      where: {
        userId: (session as Session).user.id,
        address: address.toLowerCase(),
      },
    })

    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet already linked to your account' },
        { status: 409 }
      )
    }

    // Check if wallet is linked to another user
    const walletLinkedToOther = await prisma.userWallet.findFirst({
      where: {
        address: address.toLowerCase(),
        userId: { not: (session as Session).user.id },
      },
    })

    if (walletLinkedToOther) {
      return NextResponse.json(
        { error: 'Wallet is already linked to another account' },
        { status: 409 }
      )
    }

    // Create the wallet link
    const userWallet = await prisma.userWallet.create({
      data: {
        userId: (session as Session).user.id,
        address: address.toLowerCase(),
      },
    })

    // Log the activity
    await prisma.activity.create({
      data: {
        userId: (session as Session).user.id,
        type: 'VERIFY',
        wallet: address.toLowerCase(),
        docHash: 'wallet-link',
        status: 'success',
      },
    })

    return NextResponse.json({
      success: true,
      wallet: {
        id: userWallet.id,
        address: userWallet.address,
        createdAt: userWallet.createdAt,
      },
    })
  } catch (error) {
    console.error('Wallet linking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve linked wallets
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!(session as Session)?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const wallets = await prisma.userWallet.findMany({
      where: {
        userId: (session as Session).user.id,
      },
      select: {
          id: true,
          address: true,
          label: true,
          createdAt: true,
        },
      orderBy: {
          createdAt: 'desc',
        },
    })

    return NextResponse.json({ wallets })
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to unlink a wallet
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session as Session)?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get('id')

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      )
    }

    // Verify the wallet belongs to the current user
    const wallet = await prisma.userWallet.findFirst({
      where: {
        id: walletId,
        userId: (session as Session).user.id,
      },
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or not owned by user' },
        { status: 404 }
      )
    }

    // Delete the wallet
    await prisma.userWallet.delete({
      where: {
        id: walletId,
      },
    })

    // Log the activity
    await prisma.activity.create({
      data: {
        userId: (session as Session).user.id,
        type: 'VERIFY',
        wallet: wallet.address,
        docHash: 'wallet-unlink',
        status: 'success',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unlinking wallet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}