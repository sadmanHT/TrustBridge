import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from '@/components/Dashboard/DashboardClient'
import { Session } from 'next-auth'

// Server component for KPIs calculation
async function getKPIs(userId: string) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalIssued, totalVerified, last7dIssued, last7dVerified] = await Promise.all([
    prisma.activity.count({
      where: {
        userId,
        type: 'ISSUE',
        status: 'success'
      }
    }),
    prisma.activity.count({
      where: {
        userId,
        type: 'VERIFY',
        status: 'success'
      }
    }),
    prisma.activity.count({
      where: {
        userId,
        type: 'ISSUE',
        status: 'success',
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    }),
    prisma.activity.count({
      where: {
        userId,
        type: 'VERIFY',
        status: 'success',
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })
  ])

  return {
    totalIssued,
    totalVerified,
    last7dIssued,
    last7dVerified
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!(session as Session)?.user?.id) {
    redirect('/login?from=/dashboard')
  }

  const kpis = await getKPIs((session as Session).user.id)

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

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Issued</p>
                <p className="text-3xl font-bold text-white">{kpis.totalIssued}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Verified</p>
                <p className="text-3xl font-bold text-white">{kpis.totalVerified}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Issued (7d)</p>
                <p className="text-3xl font-bold text-white">{kpis.last7dIssued}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Verified (7d)</p>
                <p className="text-3xl font-bold text-white">{kpis.last7dVerified}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <DashboardClient userId={(session as Session).user.id} />
      </div>
    </div>
  )
}