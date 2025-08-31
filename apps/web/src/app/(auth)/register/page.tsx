'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('verifier')
  const [paymentMethod, setPaymentMethod] = useState('bkash')
  const [paymentTxnId, setPaymentTxnId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    // Validate role
    if (!role || !['issuer', 'verifier'].includes(role)) {
      setError('Please select a valid account type')
      setIsLoading(false)
      return
    }

    // Validate payment fields
    if (!paymentMethod || !['bkash', 'nagad'].includes(paymentMethod)) {
      setError('Please select a valid payment method')
      setIsLoading(false)
      return
    }

    if (!paymentTxnId.trim()) {
      setError('Transaction ID is required')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          paymentMethod,
          paymentTxnId: paymentTxnId.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Please sign in.',
      })

      // Redirect to login page
      router.push('/login')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration'
      setError(errorMessage)
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Join TrustBridge
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Create your account to start managing credentials
          </p>
        </div>
        
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              {/* Account Type Selection */}
              <div className="space-y-2">
                <Label className="text-slate-200">Account Type</Label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="issuer"
                      checked={role === 'issuer'}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-slate-200 font-medium">Issuer (University/Institution)</div>
                      <div className="text-sm text-slate-400">Issue credentials and certificates. Includes 6-month free trial, then ৳150,000/year.</div>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="verifier"
                      checked={role === 'verifier'}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-slate-200 font-medium">Verifier (Employer/Agency)</div>
                      <div className="text-sm text-slate-400">Verify credentials and certificates. Pay ৳98 per verification.</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Payment Verification Section */}
              <div className="space-y-4 pt-4 border-t border-slate-600">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Payment for Verification (৳ 50)</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Enter your bKash/Nagad transaction ID. For now, we assume payments are completed.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-200">Payment Method</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={paymentMethod === 'bkash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isLoading}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-200">bKash</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={paymentMethod === 'nagad'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isLoading}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-200">Nagad</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTxnId" className="text-slate-200">Transaction ID</Label>
                  <Input
                    id="paymentTxnId"
                    type="text"
                    placeholder="e.g., 8XY12Z3AB"
                    value={paymentTxnId}
                    onChange={(e) => setPaymentTxnId(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="text-center">
                  <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    How to pay via bKash/Nagad (coming soon)
                  </a>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}