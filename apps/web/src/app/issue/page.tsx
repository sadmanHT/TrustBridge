'use client';

import { IssueCard } from '@/components/Issue/IssueCard';
import { useRouter } from 'next/navigation';
import { useWalletCheck } from '@/hooks/use-auth-guard';
import { WalletPrompt } from '@/components/ui/WalletPrompt';
import { TxDiagnostics } from '@/components/debug/TxDiagnostics';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Bug } from 'lucide-react';

export default function IssuePage() {
  const router = useRouter();
  const { hasWallet, isLoading: isWalletLoading } = useWalletCheck();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [currentDocHash, setCurrentDocHash] = useState<string>('');
  const [currentIpfsCid, setCurrentIpfsCid] = useState<string>('');
  const [currentTxHash, setCurrentTxHash] = useState<string>('');

  const handleSuccess = (hash: string, txHash: string) => {
    // Store current transaction data for diagnostics
    setCurrentTxHash(txHash);
    
    // Redirect to success page with parameters
    const params = new URLSearchParams({
      hash,
      tx: txHash
    });
    router.push(`/issue/success?${params.toString()}`);
  };
  
  const handleFileProcessed = (hash: string, ipfsCid: string) => {
    setCurrentDocHash(hash);
    setCurrentIpfsCid(ipfsCid);
  };
  
  const handleTxSubmitted = (txHash: string) => {
    setCurrentTxHash(txHash);
  };

  const handleError = (error: string) => {
    console.error('Issue credential error:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Issue New Credential
          </h1>
          <p className="text-muted-foreground">
            Upload a document to create a tamper-proof blockchain credential
          </p>
        </div>
        
        {/* Wallet Connection Prompt */}
        {!isWalletLoading && !hasWallet && (
          <WalletPrompt className="mb-6" />
        )}
        
        <div className="relative">
          <IssueCard 
            onSuccess={handleSuccess}
            onError={handleError}
            onFileProcessed={handleFileProcessed}
          />
          
          {/* Diagnostics Toggle Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDiagnostics(true)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Debug
            </Button>
          </div>
        </div>
        
        {/* Diagnostics Drawer */}
        <Drawer
          open={showDiagnostics}
          onOpenChange={setShowDiagnostics}
          title="Transaction Diagnostics"
          description="Debug and monitor transaction status"
        >
          <TxDiagnostics
             docHash={currentDocHash}
             ipfsCid={currentIpfsCid}
             txHash={currentTxHash}
             onTxSubmitted={handleTxSubmitted}
           />
        </Drawer>
        
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Document</h3>
              <p className="text-sm text-muted-foreground">
                Select and upload your document. We support PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, and GIF files.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Generate Hash</h3>
              <p className="text-sm text-muted-foreground">
                A unique cryptographic hash is generated from your document, creating a digital fingerprint.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Blockchain Record</h3>
              <p className="text-sm text-muted-foreground">
                The hash is permanently recorded on the blockchain, creating an immutable proof of authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}