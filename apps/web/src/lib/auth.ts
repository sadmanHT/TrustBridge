import bcrypt from 'bcryptjs'
import { NextAuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Adapter } from 'next-auth/adapters'
import { prisma } from './prisma'
import { getEnvConfigSafe } from './env'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      isVerified: boolean
      image?: string | null
      createdAt?: Date
      subscriptionStatus?: string
      trialEndDate?: Date
      renewalDate?: Date
      verificationCount: number
      verificationFeesDue: number
    }
  }
  interface User {
    role: string
    isVerified: boolean
    subscriptionStatus?: string
    trialEndDate?: Date
    renewalDate?: Date
    verificationCount: number
    verificationFeesDue: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isVerified: boolean
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(
  email: string, 
  password: string, 
  name?: string, 
  role?: string,
  paymentMethod?: string, 
  paymentTxnId?: string
) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await hashPassword(password)
  
  // Calculate subscription data based on role
  const now = new Date()
  const subscriptionData = role === 'issuer' ? {
    subscriptionStatus: 'trial',
    trialEndDate: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
    renewalDate: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000), // Same as trial end for now
  } : {}

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: role === 'issuer' ? 'ISSUER' : 'VERIFIER',
      isVerified: true, // Set as verified for payment users
      paymentMethod,
      paymentTxnId,
      paymentStatus: 'assumed_paid',
      verificationCount: 0,
      verificationFeesDue: 0,
      ...subscriptionData,
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'ADMIN'
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  // Ensure NEXTAUTH_URL is set for serverless compatibility
  ...(getEnvConfigSafe().NEXTAUTH_URL && { url: getEnvConfigSafe().NEXTAUTH_URL }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isVerified = user.isVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isVerified = token.isVerified
        // Fetch fresh user data from database to ensure we have all fields
        const user = await prisma.user.findUnique({
          where: { id: token.id }
        })
        if (user) {
          session.user.name = user.name
          session.user.email = user.email
          session.user.createdAt = user.createdAt
          session.user.isVerified = user.isVerified // Use fresh data from DB
          session.user.subscriptionStatus = user.subscriptionStatus
          session.user.trialEndDate = user.trialEndDate
          session.user.renewalDate = user.renewalDate
          session.user.verificationCount = user.verificationCount
          session.user.verificationFeesDue = user.verificationFeesDue
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      const env = getEnvConfigSafe();
      const trustedBaseUrl = env.NEXTAUTH_URL || baseUrl;
      
      // Allow relative redirects using the trusted base URL
      if (url.startsWith('/')) {
        return `${trustedBaseUrl}${url}`;
      }
      
      // Allow redirects to the same origin as NEXTAUTH_URL
      if (url.startsWith(trustedBaseUrl)) {
        return url;
      }
      
      // Block external redirects - return to trusted base URL
      return trustedBaseUrl;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: getEnvConfigSafe().NEXTAUTH_SECRET,
}