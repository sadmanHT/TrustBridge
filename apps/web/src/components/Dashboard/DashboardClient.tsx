'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Copy, Download, ExternalLink, Filter, RefreshCw, Search, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Activity {
  id: string
  type: 'ISSUE' | 'VERIFY' | 'REVOKE'
  wallet: string | null
  docHash: string
  txHash: string | null
  cid: string | null
  status: string
  createdAt: string
}

interface KPIs {
  totalIssued: number
  totalVerified: number
  last7dIssued: number
  last7dVerified: number
}

interface DashboardClientProps {
  userId: string
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [kpis, setKpis] = useState<KPIs>({ totalIssued: 0, totalVerified: 0, last7dIssued: 0, last7dVerified: 0 })
  const [kpisLoading, setKpisLoading] = useState(true)
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  
  // Revoke modal state
  const [revokeModalOpen, setRevokeModalOpen] = useState(false)
  const [revokeActivity, setRevokeActivity] = useState<Activity | null>(null)
  const [revoking, setRevoking] = useState(false)
  
  const itemsPerPage = 10

  const fetchKpis = async () => {
    try {
      setKpisLoading(true)
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/kpis?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data: KPIs = await response.json()
        setKpis(data)
      } else {
        toast.error('Failed to fetch KPIs')
      }
    } catch (error) {
      toast.error('Error fetching KPIs')
    } finally {
      setKpisLoading(false)
    }
  }

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom: dateFrom.toISOString() }),
        ...(dateTo && { dateTo: dateTo.toISOString() })
      })

      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/activity?${params}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.totalCount)
      } else {
        toast.error('Failed to fetch activities')
      }
    } catch {
      toast.error('Error fetching activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKpis()
    fetchActivities()
  }, [currentPage, typeFilter, statusFilter, searchTerm, dateFrom, dateTo])

  // Add manual refresh functionality
  const handleRefresh = async () => {
    await Promise.all([fetchKpis(), fetchActivities()])
    toast.success('Dashboard refreshed')
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const formatAddress = (address: string | null) => {
    if (!address) return 'Anonymous'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const getEtherscanUrl = (txHash: string) => {
    return `https://etherscan.io/tx/${txHash}`
  }

  const getIPFSUrl = (cid: string) => {
    return `https://ipfs.io/ipfs/${cid}`
  }

  const handleRevoke = (activity: Activity) => {
    setRevokeActivity(activity)
    setRevokeModalOpen(true)
  }

  const confirmRevoke = async () => {
    if (!revokeActivity) return
    
    setRevoking(true)
    try {
      // Import the contract function dynamically to avoid SSR issues
      const { revokeCredential } = await import('@/lib/contract')
      
      // Call the contract function directly (it will handle MetaMask connection)
       const result = await revokeCredential(
         revokeActivity.docHash as `0x${string}`,
         revokeActivity.wallet as `0x${string}`
       )
       const txHash = result.txHash
      
      // Record the successful revocation in the database via API
      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'REVOKE',
          docHash: revokeActivity.docHash,
          wallet: revokeActivity.wallet,
          txHash: txHash,
          status: 'success'
        }),
      })
      
      if (response.ok) {
        toast.success('Credential revoked successfully')
        setRevokeModalOpen(false)
        setRevokeActivity(null)
        // Refresh activities to show the revoked status
        await fetchActivities()
        await fetchKpis()
      } else {
        // Transaction succeeded but database recording failed
        toast.success('Credential revoked successfully (database update failed)')
        setRevokeModalOpen(false)
        setRevokeActivity(null)
        await fetchActivities()
        await fetchKpis()
      }
      
    } catch (error: any) {
      console.error('Revocation error:', error)
      
      // Record the failed attempt in the database
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'REVOKE',
            docHash: revokeActivity.docHash,
            wallet: revokeActivity.wallet,
            status: 'failed'
          }),
        })
      } catch (dbError) {
        console.error('Failed to record failed revocation:', dbError)
      }
      
      // Show user-friendly error message
      let errorMessage = 'Failed to revoke credential'
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user'
      } else if (error.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first'
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = 'You are not authorized to revoke this credential'
      } else if (error.message?.includes('already revoked')) {
        errorMessage = 'This credential has already been revoked'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      }
      
      toast.error(errorMessage)
    } finally {
      setRevoking(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: 'default' as const, className: 'bg-green-600 text-white' },
      failed: { variant: 'destructive' as const, className: '' },
      revoked: { variant: 'secondary' as const, className: 'bg-orange-600 text-white' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.failed
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const exportToCSV = () => {
    const headers = ['Time', 'Type', 'Hash', 'Wallet', 'Status', 'TX Hash', 'CID']
    const csvData = activities.map(activity => [
      new Date(activity.createdAt).toLocaleString(),
      activity.type,
      activity.docHash,
      activity.wallet || 'Anonymous',
      activity.status,
      activity.txHash || '',
      activity.cid || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `activities_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSV exported successfully')
  }

  const clearFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Issued</p>
                <p className="text-3xl font-bold text-white">{kpisLoading ? '...' : kpis.totalIssued}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Verified</p>
                <p className="text-3xl font-bold text-white">{kpisLoading ? '...' : kpis.totalVerified}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Issued (7d)</p>
                <p className="text-3xl font-bold text-white">{kpisLoading ? '...' : kpis.last7dIssued}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Verified (7d)</p>
                <p className="text-3xl font-bold text-white">{kpisLoading ? '...' : kpis.last7dVerified}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Activity History</span>
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                {totalCount} total
              </Badge>
            </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              disabled={loading || kpisLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              disabled={activities.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search hash or wallet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ISSUE">Issue</SelectItem>
              <SelectItem value="VERIFY">Verify</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal bg-slate-700 border-slate-600 text-white",
                  !dateFrom && "text-slate-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal bg-slate-700 border-slate-600 text-white flex-1",
                    !dateTo && "text-slate-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Hash</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Wallet</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">TX</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">CID</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading activities...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No activities found
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-slate-300 text-sm">
                      {new Date(activity.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={
                          activity.type === 'ISSUE' ? 'text-green-400 border-green-400' : 
                          activity.type === 'VERIFY' ? 'text-blue-400 border-blue-400' :
                          'text-red-400 border-red-400'
                        }
                      >
                        {activity.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-300 text-sm">
                          {formatHash(activity.docHash)}
                        </span>
                        <Button
                          onClick={() => handleCopy(activity.docHash)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-300 text-sm">
                          {formatAddress(activity.wallet)}
                        </span>
                        <Button
                          onClick={() => handleCopy(activity.wallet || 'Anonymous')}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          disabled={!activity.wallet}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="py-3 px-4">
                      {activity.txHash ? (
                        <a
                          href={getEtherscanUrl(activity.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                        >
                          <span className="font-mono text-sm">{formatHash(activity.txHash)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {activity.cid ? (
                        <a
                          href={getIPFSUrl(activity.cid)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                        >
                          <span className="font-mono text-sm">{formatHash(activity.cid)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {activity.type === 'ISSUE' && activity.status === 'success' ? (
                        <Button
                          onClick={() => handleRevoke(activity)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          title="Revoke credential"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} activities
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Previous
              </Button>
              <span className="text-slate-300 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )})}      </CardContent>
    </Card>

      {/* Revoke Confirmation Modal */}
      <Dialog open={revokeModalOpen} onOpenChange={setRevokeModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Revoke Credential</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to revoke this credential? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {revokeActivity && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-300">
                  <div><strong>Hash:</strong> {revokeActivity.docHash}</div>
                  <div><strong>Issued:</strong> {new Date(revokeActivity.createdAt).toLocaleString()}</div>
                  <div><strong>Wallet:</strong> {revokeActivity.wallet || 'Anonymous'}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeModalOpen(false)}
              disabled={revoking}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRevoke}
              disabled={revoking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {revoking ? 'Revoking...' : 'Revoke Credential'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}