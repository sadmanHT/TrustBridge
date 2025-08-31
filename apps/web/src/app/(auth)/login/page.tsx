import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginClient from './LoginClient'

// Force dynamic rendering since we use server-side session checks
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')
  return <LoginClient />
}