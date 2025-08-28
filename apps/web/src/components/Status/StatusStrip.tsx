'use client';

import { useAccount } from 'wagmi';
import { Wallet, FileText, User, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  status: 'connected' | 'warning' | 'error';
  description: string;
  icon: React.ReactNode;
}

const StatusCard = ({ title, status, description, icon }: StatusCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'border-green-400/20 bg-green-400/5';
      case 'warning':
        return 'border-yellow-400/20 bg-yellow-400/5';
      case 'error':
        return 'border-red-400/20 bg-red-400/5';
    }
  };

  return (
    <Card className={cn(
      'glass border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer',
      getStatusColor()
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-slate-100 text-sm">{title}</span>
          </div>
          {getStatusIcon()}
        </div>
        <p className="text-xs text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
};

const StatusStrip = () => {
  const { address, isConnected, chain } = useAccount();

  // Determine wallet status
  const walletStatus = isConnected ? 'connected' : 'error';
  const walletDescription = isConnected 
    ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
    : 'Not connected';

  // Determine contract status (simplified - you can enhance this with actual contract checks)
  const contractStatus = isConnected && chain ? 'connected' : 'warning';
  const contractDescription = isConnected && chain
    ? `Deployed on ${chain.name}`
    : 'Contract not available';

  // Determine issuer status (simplified - you can enhance this with actual issuer checks)
  const issuerStatus = isConnected ? 'connected' : 'error';
  const issuerDescription = isConnected
    ? 'Authorized issuer'
    : 'Authorization required';

  return (
    <div className="w-full py-4">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="Wallet"
            status={walletStatus}
            description={walletDescription}
            icon={<Wallet className="h-4 w-4 text-slate-300" />}
          />
          <StatusCard
            title="Contract"
            status={contractStatus}
            description={contractDescription}
            icon={<FileText className="h-4 w-4 text-slate-300" />}
          />
          <StatusCard
            title="Issuer"
            status={issuerStatus}
            description={issuerDescription}
            icon={<User className="h-4 w-4 text-slate-300" />}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusStrip;