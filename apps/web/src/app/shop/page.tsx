import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Shield, Star } from 'lucide-react'
import { Session } from 'next-auth'

export default async function ShopPage() {
  const session = await getServerSession(authOptions)
  
  if (!(session as Session)?.user?.id) {
    redirect('/login?from=/shop')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            TrustBridge Shop
          </h1>
          <p className="text-slate-400 text-lg">
            Choose the perfect subscription plan for your needs
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verifier Subscription */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-medium">
              PAY-PER-USE
            </div>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Verifier Subscription
              </CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">
                  ৳98<span className="text-lg font-normal text-slate-400">/verification</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Pay only for what you verify
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Unlimited document verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Real-time blockchain validation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Detailed verification reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">API access for integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">24/7 customer support</span>
                </div>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 font-medium">Current Balance</span>
                  <span className="text-2xl font-bold text-blue-300">৳980</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Sufficient for 10 verifications
                </p>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Select Verification Package
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-center transition-colors">
                    <div className="font-bold">5 Verifications</div>
                    <div className="text-sm">৳490</div>
                  </button>
                  <button className="bg-blue-700 hover:bg-blue-600 text-white p-3 rounded-lg text-center transition-colors">
                    <div className="font-bold">10 Verifications</div>
                    <div className="text-sm">৳980</div>
                  </button>
                  <button className="bg-blue-700 hover:bg-blue-600 text-white p-3 rounded-lg text-center transition-colors">
                    <div className="font-bold">15 Verifications</div>
                    <div className="text-sm">৳1,470</div>
                  </button>
                  <button className="bg-blue-700 hover:bg-blue-600 text-white p-3 rounded-lg text-center transition-colors">
                    <div className="font-bold">20 Verifications</div>
                    <div className="text-sm">৳1,960</div>
                  </button>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Purchase Selected Package
              </Button>
            </CardContent>
          </Card>

          {/* Issuer Subscription */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-xs font-medium">
              PREMIUM
            </div>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Issuer Subscription
              </CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">
                  ৳150,000<span className="text-lg font-normal text-slate-400">/year</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Unlimited credential issuance
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Unlimited credential issuance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Advanced credential templates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Bulk credential operations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Custom branding options</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Priority customer support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-slate-300">6-month free trial included</span>
                </div>
              </div>

              {(session as Session).user.role === 'ISSUER' ? (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-green-600 text-white">
                      ✅ Active
                    </Badge>
                    <span className="text-green-200 font-medium">Current Subscription</span>
                  </div>
                  <p className="text-green-200 text-sm">
                    Valid until {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4">
                  <p className="text-orange-200 text-sm mb-2">
                    💡 <strong>Note:</strong> This subscription is required for issuing credentials.
                  </p>
                  <p className="text-orange-200 text-xs">
                    Switch to Issuer role to access this subscription.
                  </p>
                </div>
              )}

              <Button 
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" 
                size="lg"
                disabled={(session as Session).user.role !== 'ISSUER'}
              >
                {(session as Session).user.role === 'ISSUER' ? 'Manage Subscription' : 'Upgrade to Issuer'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="text-center space-y-4">
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Need Help Choosing?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-blue-300 mb-2">Choose Verifier if you:</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Need to verify documents occasionally</li>
                  <li>• Want to pay only for what you use</li>
                  <li>• Require API access for integration</li>
                  <li>• Need detailed verification reports</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-300 mb-2">Choose Issuer if you:</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Need to issue credentials regularly</li>
                  <li>• Want unlimited issuance capability</li>
                  <li>• Require advanced templates and branding</li>
                  <li>• Need bulk operations for efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}