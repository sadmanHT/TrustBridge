'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { signOutAndDisconnect } from '@/lib/authWallet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function UserMenu() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  if (!session?.user) {
    return null
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOutAndDisconnect()
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out and disconnected from your wallet.',
      })
    } catch {
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing you out.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }



  // Get user initials for avatar fallback
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
            <AvatarFallback className="bg-slate-700 text-white">
              {getInitials(session.user.name, session.user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {session.user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-slate-400">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 cursor-pointer p-0">
          <Link href="/dashboard" className="flex items-center w-full px-2 py-1.5">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 cursor-pointer p-0">
          <Link href="/profile" className="flex items-center w-full px-2 py-1.5">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 cursor-pointer p-0">
          <Link href="/settings" className="flex items-center w-full px-2 py-1.5">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem 
          className="text-red-400 hover:bg-slate-700 cursor-pointer"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}