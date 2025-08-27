'use client';

import { Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-dark-surface/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Tagline */}
          <div className="text-center md:text-left">
            <p className="text-slate-300 text-sm">
              Securing digital credentials with blockchain technology
            </p>
            <p className="text-slate-500 text-xs mt-1">
              © 2024 TrustBridge. Built for transparency and trust.
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              onClick={() => window.open('https://etherscan.io', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Etherscan
            </Button>
          </div>
        </div>

        {/* Bottom divider with additional info */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>Powered by Ethereum blockchain technology</p>
            <p className="mt-2 sm:mt-0">
              Smart contracts verified and open source
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;