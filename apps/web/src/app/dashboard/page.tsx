import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardClient } from '@/components/Dashboard/DashboardClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, Clock } from 'lucide-react'
import { Session } from 'next-auth'

// Force revalidation on every request to ensure fresh data
export const revalidate = 0

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!(session as Session)?.user?.id) {
    redirect('/login?from=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Personal Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Track your credential activities and performance
          </p>
        </div>

        {/* Subscription Information for Issuers */}
        {(session as Session).user.role === 'ISSUER' && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Issuer Subscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Issuer Status */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Issuer Status</span>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    ✅ Active
                  </Badge>
                </div>

                {/* Subscription Status */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Subscription</span>
                  </div>
                  <Badge 
                    variant={(session as Session).user.subscriptionStatus === 'trial' ? 'default' : 'secondary'}
                    className={(session as Session).user.subscriptionStatus === 'trial' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}
                  >
                    {(session as Session).user.subscriptionStatus === 'trial' ? '🎯 Free Trial' : '💳 Active'}
                  </Badge>
                </div>

                {/* Valid Until */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Valid Until</span>
                  </div>
                  <p className="text-white font-mono text-sm">
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>

                {/* Trial End Date */}
                {(session as Session).user.subscriptionStatus === 'trial' && (session as Session).user.trialEndDate && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Trial Ends</span>
                    </div>
                    <p className="text-white font-mono text-sm">
                      {new Date((session as Session).user.trialEndDate!).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Renewal Date */}
                {(session as Session).user.renewalDate && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Next Renewal</span>
                    </div>
                    <p className="text-white font-mono text-sm">
                      {new Date((session as Session).user.renewalDate!).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Information */}
              <div className="pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Yearly Subscription</p>
                    <p className="text-slate-400 text-xs">Unlimited credential issuance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">৳150,000</p>
                    <p className="text-slate-400 text-xs">per year</p>
                  </div>
                </div>
              </div>

              {/* Trial Information */}
              {(session as Session).user.subscriptionStatus === 'trial' && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    🎉 You're currently on a <strong>6-month free trial</strong>. Enjoy full access to all issuer features!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verification Information for Verifiers */}
        {(session as Session).user.role === 'VERIFIER' && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Verification Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Verification Count */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Total Verifications</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-white">
                      {(session as Session).user.verificationCount || 0}
                    </p>
                    <span className="text-slate-400 text-sm">verifications</span>
                  </div>
                </div>

                {/* Remaining Balance */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Remaining Balance</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-green-400">
                      ৳980
                    </p>
                    <span className="text-slate-400 text-sm">BDT</span>
                  </div>
                </div>

                {/* Fees Due */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Fees Due</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-white">
                      ${((session as Session).user.verificationFeesDue || 0).toFixed(2)}
                    </p>
                    <span className="text-slate-400 text-sm">USD</span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Per-Verification Fee</p>
                    <p className="text-slate-400 text-xs">Pay only for what you use</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">$5.00</p>
                    <p className="text-slate-400 text-xs">per verification</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {((session as Session).user.verificationFeesDue || 0) > 0 && (
                <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3">
                  <p className="text-orange-200 text-sm">
                    💳 You have <strong>${((session as Session).user.verificationFeesDue || 0).toFixed(2)}</strong> in outstanding verification fees. Payment will be processed automatically.
                  </p>
                </div>
              )}

              {/* No Usage Information */}
              {((session as Session).user.verificationCount || 0) === 0 && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    🔍 Start verifying credentials to see your usage statistics here. You'll be charged $5.00 per verification.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dashboard Client with KPIs and Activities */}
        <DashboardClient userId={(session as Session).user.id} />
      </div>
    </div>
  )
}