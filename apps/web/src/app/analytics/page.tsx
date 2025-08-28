'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { getEventAnalytics, getVerificationStats } from '@/lib/analytics';
import type { EventAnalytics, VerificationStats } from '@/types/events';

type TimePeriod = '7d' | '30d' | 'all';

interface ChartData {
  date: string;
  issued: number;
  revoked: number;
  verifications: number;
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

function KPICard({ title, value, icon, trend, loading }: KPICardProps) {
  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-black/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-200">{title}</CardTitle>
        <div className="text-slate-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
        {trend !== undefined && (
          <p className={`text-xs flex items-center gap-1 ${
            trend >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
        <p className="text-slate-400 text-center">{message}</p>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [verificationStats, setVerificationStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range based on time period
  const dateRange = useMemo(() => {
    switch (timePeriod) {
      case '7d':
        return { fromBlock: BigInt(0), days: 7 };
      case '30d':
        return { fromBlock: BigInt(0), days: 30 };
      case 'all':
      default:
        return { fromBlock: BigInt(0), days: null };
    }
  }, [timePeriod]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [analyticsData, verificationData] = await Promise.all([
          getEventAnalytics(dateRange),
          getVerificationStats()
        ]);
        
        setAnalytics(analyticsData);
        setVerificationStats(verificationData);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analytics || !verificationStats) return [];

    const days = dateRange.days || 30;
    const data: ChartData[] = [];

    // Create a map for issued and revoked data
    const issuedMap = new Map(analytics.issuedByDay.map(item => [item.date, item.count]));
    const revokedMap = new Map(analytics.revokedByDay.map(item => [item.date, item.count]));
    
    // Get verification data from localStorage and group by day
    const verificationMap = new Map<string, number>();
    verificationStats.recentVerifications.forEach(verification => {
      const date = format(new Date(verification.timestamp), 'yyyy-MM-dd');
      verificationMap.set(date, (verificationMap.get(date) || 0) + 1);
    });

    // Generate data for the specified period
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      data.push({
        date,
        issued: issuedMap.get(date) || 0,
        revoked: revokedMap.get(date) || 0,
        verifications: verificationMap.get(date) || 0,
      });
    }

    return data;
  }, [analytics, verificationStats, dateRange]);

  // Export to CSV function
  const exportToCSV = () => {
    if (!chartData.length) return;

    const headers = ['Date', 'Issued Certificates', 'Revoked Certificates', 'Verifications'];
    const csvContent = [
      headers.join(','),
      ...chartData.map(row => [
        row.date,
        row.issued,
        row.revoked,
        row.verifications
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${timePeriod}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Monitor credential issuance, revocation, and verification trends</p>
        </div>
        <EmptyState message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Monitor credential issuance, revocation, and verification trends</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Time Period Filter */}
          <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <TabsList className="bg-black/20 backdrop-blur-md border-white/10">
              <TabsTrigger value="7d" className="data-[state=active]:bg-white/20">7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="data-[state=active]:bg-white/20">30 Days</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-white/20">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Export Button */}
          <Button
            onClick={exportToCSV}
            disabled={loading || !chartData.length}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Issued"
          value={analytics?.totalIssued || 0}
          icon={<CheckCircle className="h-4 w-4" />}
          loading={loading}
        />
        <KPICard
          title="Total Revoked"
          value={analytics?.totalRevoked || 0}
          icon={<AlertCircle className="h-4 w-4" />}
          loading={loading}
        />
        <KPICard
          title="Session Verifications"
          value={verificationStats?.totalVerifications || 0}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issued Certificates Chart */}
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Issued Certificates</CardTitle>
              <CardDescription className="text-slate-400">
                Daily issuance trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="issued" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <EmptyState message="No issuance data available for the selected period" />
        )}

        {/* Revoked Certificates Chart */}
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Revoked Certificates</CardTitle>
              <CardDescription className="text-slate-400">
                Daily revocation trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revoked" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <EmptyState message="No revocation data available for the selected period" />
        )}
      </div>

      {/* Verification Attempts Chart */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Verification Attempts</CardTitle>
              <CardDescription className="text-slate-400">
                Daily verification activity from session data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="verifications" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <EmptyState message="No verification data available for the selected period" />
        )}
      </div>

      {/* Combined Overview Chart */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <Card className="bg-black/20 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Combined Overview</CardTitle>
              <CardDescription className="text-slate-400">
                All metrics combined for comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="issued" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Issued"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revoked" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Revoked"
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="verifications" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Verifications"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <EmptyState message="No data available for the selected period" />
        )}
      </div>
    </div>
  );
}