'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuthGuard(redirectPath?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      // Not authenticated, redirect to login with next parameter
      const currentPath = redirectPath || window.location.pathname
      const loginUrl = `/login?next=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
    }
  }, [session, status, router, redirectPath])

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user
  }
}

export function useWalletCheck() {
  const { data: session } = useSession()
  const [hasWallet, setHasWallet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = session?.user as { id?: string }
    const userId = user?.id
    
    const checkWallets = async () => {
      if (!userId) {
        setHasWallet(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/wallet/link')
        if (response.ok) {
          const data = await response.json()
          setHasWallet(data.wallets && data.wallets.length > 0)
        }
      } catch (error) {
        console.error('Error checking wallets:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkWallets()
  }, [session?.user])
  
  return {
    hasWallet,
    isLoading
  }
}