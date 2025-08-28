'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ConnectButton } from '@/components/Wallet/ConnectButton';
import { NetworkBadge } from '@/components/Status/NetworkBadge';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const NavBar = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and App Name */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="TrustBridge Logo" 
              width={32} 
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-accent-gradient">TrustBridge</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Blockchain Document Verification</p>
            </div>
          </Link>

          {/* Right side - Auth, Network Badge and Connect Button */}
          <div className="flex items-center space-x-4">
            {/* Authentication Section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : session ? (
              <UserMenu />
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-700/50">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
            
            <NetworkBadge />
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;