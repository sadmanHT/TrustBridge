'use client';

import Image from 'next/image';
import { ConnectButton } from '@/components/Wallet/ConnectButton';
import { NetworkBadge } from '@/components/Status/NetworkBadge';

const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and App Name */}
          <div className="flex items-center gap-2">
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
          </div>

          {/* Right side - Network Badge and Connect Button */}
          <div className="flex items-center space-x-4">
            <NetworkBadge />
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;