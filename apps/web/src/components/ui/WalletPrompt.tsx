'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, Wallet } from 'lucide-react'
import Link from 'next/link'

interface WalletPromptProps {
  onDismiss?: () => void
  className?: string
}

export function WalletPrompt({ onDismiss, className }: WalletPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) {
    return null
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className || ''}`}>
      <Wallet className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <span className="text-blue-800">
            <strong>Connect your wallet</strong> to enable blockchain interactions and track your credentials.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Connect Wallet
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}