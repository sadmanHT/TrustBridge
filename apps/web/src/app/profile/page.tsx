'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield, Edit } from 'lucide-react';
import { formatAddress } from '@/lib/format';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/login');
  }

  // Debug: Log session data to console
  console.log('Session data:', session);

  // Get user initials for avatar fallback
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const joinedDate = session.user.createdAt 
    ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-2"
            >
              <span>Refresh Session (Sign Out & Back In)</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {getInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{session.user.name || 'User'}</CardTitle>
                <CardDescription>{session.user.email}</CardDescription>
                <div className="flex justify-center mt-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Account
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
                <CardDescription>
                  Your basic account details and authentication information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      value={session.user.name || ''} 
                      readOnly
                      className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="email" 
                        value={session.user.email || ''} 
                        readOnly
                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="text" 
                        value={joinedDate} 
                        readOnly
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-md text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account ID</label>
                    <input 
                      type="text" 
                      value={session.user.id || 'N/A'} 
                      readOnly
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Wallet Connection</span>
                </CardTitle>
                <CardDescription>
                  Your connected blockchain wallet information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Wallet Status</p>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p className="text-sm text-gray-600">
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  {isConnected && address && (
                    <div className="text-right">
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm font-mono text-gray-600">
                        {formatAddress(address)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and navigation shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/issue">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Issue Credential
                    </Button>
                  </Link>
                  <Link href="/verify">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Credential
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}