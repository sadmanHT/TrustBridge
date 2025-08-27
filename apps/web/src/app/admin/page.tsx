'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import contractConfig from '../../contractConfig.json';
import { CheckCircle, XCircle, Shield, UserCheck, UserX, ExternalLink } from 'lucide-react';
import { isAddress } from 'viem';

interface ApprovedIssuer {
  address: string;
  name?: string;
  approved: boolean;
  addedAt: number;
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [issuerAddress, setIssuerAddress] = useState('');
  const [approvedIssuers, setApprovedIssuers] = useState<ApprovedIssuer[]>([]);
  const [isApproving, setIsApproving] = useState(false);

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: contractConfig.address as `0x${string}`,
    abi: contractConfig.abi,
    functionName: 'owner',
  });

  // Write contract for approving issuers
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if current user is the owner
  const isOwner = isConnected && address && contractOwner && 
    typeof contractOwner === 'string' && 
    address.toLowerCase() === contractOwner.toLowerCase();

  // Load approved issuers from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('approvedIssuers');
    if (stored) {
      try {
        setApprovedIssuers(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored issuers:', e);
      }
    }
  }, []);

  // Save approved issuers to localStorage
  const saveApprovedIssuers = (issuers: ApprovedIssuer[]) => {
    localStorage.setItem('approvedIssuers', JSON.stringify(issuers));
    setApprovedIssuers(issuers);
  };

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Transaction Confirmed",
        description: `Issuer approval updated successfully!`,
      });
      setIssuerAddress('');
      setIsApproving(false);
    }
  }, [isConfirmed, hash, toast]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsApproving(false);
    }
  }, [error, toast]);

  const handleApproveIssuer = async (approve: boolean) => {
    if (!issuerAddress || !isAddress(issuerAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);

    try {
      writeContract({
        address: contractConfig.address as `0x${string}`,
        abi: contractConfig.abi,
        functionName: 'approveIssuer',
        args: [issuerAddress as `0x${string}`, approve],
      });

      // Update local storage
      const existingIndex = approvedIssuers.findIndex(issuer => 
        issuer.address.toLowerCase() === issuerAddress.toLowerCase()
      );

      let updatedIssuers: ApprovedIssuer[];
      if (existingIndex >= 0) {
        updatedIssuers = [...approvedIssuers];
        updatedIssuers[existingIndex] = {
          ...updatedIssuers[existingIndex],
          approved: approve,
        };
      } else {
        updatedIssuers = [
          ...approvedIssuers,
          {
            address: issuerAddress,
            approved: approve,
            addedAt: Date.now(),
          }
        ];
      }

      saveApprovedIssuers(updatedIssuers);
    } catch (err) {
      console.error('Failed to approve issuer:', err);
      setIsApproving(false);
    }
  };

  const addIssuerManually = () => {
    if (!issuerAddress || !isAddress(issuerAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive",
      });
      return;
    }

    const existingIndex = approvedIssuers.findIndex(issuer => 
      issuer.address.toLowerCase() === issuerAddress.toLowerCase()
    );

    if (existingIndex >= 0) {
      toast({
        title: "Address Already Added",
        description: "This address is already in the list.",
        variant: "destructive",
      });
      return;
    }

    const updatedIssuers = [
      ...approvedIssuers,
      {
        address: issuerAddress,
        approved: false, // Default to false, will be checked on-chain
        addedAt: Date.now(),
      }
    ];

    saveApprovedIssuers(updatedIssuers);
    setIssuerAddress('');
    toast({
      title: "Address Added",
      description: "Address added to monitoring list.",
    });
  };

  const removeFromList = (addressToRemove: string) => {
    const updatedIssuers = approvedIssuers.filter(issuer => 
      issuer.address.toLowerCase() !== addressToRemove.toLowerCase()
    );
    saveApprovedIssuers(updatedIssuers);
    toast({
      title: "Address Removed",
      description: "Address removed from monitoring list.",
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>
              Connect your wallet to access admin functions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only the contract owner can access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              <p>Your address: {address}</p>
              <p>Owner address: {contractOwner ? String(contractOwner) : 'Loading...'}</p>
            </div>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage credential issuers</p>
        </div>
        <ConnectButton />
      </div>

      {/* Approve/Unapprove Issuer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Approve/Unapprove Issuer
          </CardTitle>
          <CardDescription>
            Enter an Ethereum address to approve or unapprove as a credential issuer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issuer-address">Issuer Address</Label>
            <Input
              id="issuer-address"
              placeholder="0x..."
              value={issuerAddress}
              onChange={(e) => setIssuerAddress(e.target.value)}
              disabled={isPending || isConfirming || isApproving}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleApproveIssuer(true)}
              disabled={!issuerAddress || isPending || isConfirming || isApproving}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isPending || isConfirming || isApproving ? 'Processing...' : 'Approve'}
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => handleApproveIssuer(false)}
              disabled={!issuerAddress || isPending || isConfirming || isApproving}
              className="flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Unapprove
            </Button>
            
            <Button
              variant="outline"
              onClick={addIssuerManually}
              disabled={!issuerAddress}
              className="flex items-center gap-2"
            >
              Add to List
            </Button>
          </div>

          {hash && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Transaction submitted:{' '}
                <a
                  href={`https://etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline hover:no-underline"
                >
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Issuers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Issuers</CardTitle>
          <CardDescription>
            List of addresses being monitored. On-chain approval status is the source of truth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedIssuers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No issuers in the monitoring list</p>
              <p className="text-sm">Add addresses above to start monitoring</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedIssuers.map((issuer) => (
                  <TableRow key={issuer.address}>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        {issuer.address.slice(0, 10)}...{issuer.address.slice(-8)}
                        <a
                          href={`https://etherscan.io/address/${issuer.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={issuer.approved ? "default" : "secondary"}>
                        {issuer.approved ? 'Approved' : 'Not Approved'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(issuer.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromList(issuer.address)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}