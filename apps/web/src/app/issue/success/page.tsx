'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

import { QRCodeCard } from '../../../components/ui/QR';
import { CopyButton } from '../../../components/ui/copy-button';
import { CheckCircle, ExternalLink, Download, Eye, AlertCircle } from 'lucide-react';
import { formatAddress } from '../../../lib/format';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useToast } from '../../../hooks/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const tx = searchParams.get('tx');
  const cid = searchParams.get('cid');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && hash) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setVerifyUrl(`${baseUrl}/verify?hash=${hash}`);
    }
  }, [hash]);

  // Validate parameters
  useEffect(() => {
    if (!hash || !tx) {
      return; // Basic missing params check handled below
    }

    // Validate hash format (should be 0x followed by 64 hex characters)
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      setValidationError('Invalid document hash format. Expected a valid SHA-256 hash.');
      return;
    }

    // Validate transaction hash format (should be 0x followed by 64 hex characters)
    if (!/^0x[0-9a-fA-F]{64}$/.test(tx)) {
      setValidationError('Invalid transaction hash format. Expected a valid Ethereum transaction hash.');
      return;
    }

    // Clear validation error if all checks pass
    setValidationError(null);
  }, [hash, tx]);

  const getEtherscanUrl = (txHash: string) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  const getIpfsUrl = (cid: string) => {
    return `https://ipfs.io/ipfs/${cid}`;
  };

  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!hash) {
      toast({
        title: 'Error',
        description: 'Document hash is required for PDF download',
        variant: 'destructive',
      });
      return;
    }

    let url: string | null = null;
    
    try {
      toast({
        title: 'Generating Diploma',
        description: 'Creating your digital diploma PDF...',
      });

      // Generate verification URL
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/verify?hash=${encodeURIComponent(hash)}`;

      // Generate QR code as data URL
      const qrCodeDataUrl = await new Promise<string>((resolve, reject) => {
        try {
          // Import QRCode dynamically and render
          import('qrcode').then(QRCodeLib => {
            QRCodeLib.toDataURL(verificationUrl, {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            }, (err, url) => {
              if (err) reject(err);
              else resolve(url);
            });
          }).catch(reject);
        } catch (error) {
          reject(error);
        }
      });

      // Prepare diploma data
      const diplomaData = {
        holderName: 'Certificate Holder',
        credentialTitle: 'Verification Certificate by TrustBridge',
        issuerAddress: 'Blockchain Issuer',
        txHash: tx || 'N/A',
        docHash: hash,
        issuedAtISO: new Date().toISOString(),
        qrPngDataUrl: qrCodeDataUrl,
      };

      // Import and use the diploma generation function
      const { generateDiplomaPDF } = await import('@/lib/diploma');
      const pdfBytes = await generateDiplomaPDF(diplomaData);

      // Create blob and download
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      if (typeof window !== 'undefined') {
        url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TrustBridge-Verification-Certificate.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: 'Certificate Downloaded',
        description: 'Your verification certificate has been saved as TrustBridge-Verification-Certificate.pdf',
      });

    } catch (error) {
      console.error('Error generating diploma:', error);
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to generate diploma',
        variant: 'destructive',
      });
    } finally {
      // Always revoke the object URL to prevent memory leaks
      if (url && typeof window !== 'undefined') {
        URL.revokeObjectURL(url);
      }
    }
  };

  // Empty state if required params are missing or invalid
  if (!hash || !tx || validationError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">
              {validationError ? 'Invalid Parameters' : 'Missing Information'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {validationError || 'This success page requires credential hash and transaction information.'}
            </p>
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/issue">
                <Button variant="outline" className="w-full">
                  Issue New Credential
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" className="w-full">
                  Verify Existing Credential
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              ✅ Credential Issued
            </h1>
            <p className="text-muted-foreground">
              Your credential has been successfully issued and recorded on the blockchain.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Credential Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Credential Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Hash */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Document Hash:
                  </span>
                  <CopyButton text={hash} className="h-6 w-6" />
                </div>
                <p className="text-xs font-mono bg-muted p-2 rounded border break-all">
                  {hash}
                </p>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Transaction:
                  </span>
                  <div className="flex items-center space-x-1">
                    <CopyButton text={tx} className="h-6 w-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(getEtherscanUrl(tx), '_blank');
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs font-mono bg-muted p-2 rounded border">
                  {formatAddress(tx)}
                </p>
              </div>

              {/* IPFS CID (if present) */}
              {cid && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      IPFS CID:
                    </span>
                    <div className="flex items-center space-x-1">
                      <CopyButton text={cid} className="h-6 w-6" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.open(getIpfsUrl(cid), '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs font-mono bg-muted p-2 rounded border">
                    {formatAddress(cid)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code for Verification */}
          {verifyUrl && (
            <QRCodeCard
              value={verifyUrl}
              title="Verification QR Code"
              description="Scan to verify this credential"
              downloadFileName={`credential-qr-${hash.slice(0, 8)}`}
              className="h-fit"
            />
          )}
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
              
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Eye className="h-4 w-4 mr-2" />
                  Go to Verify
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadPDF}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certification PDF
              </Button>
              
              <Link href="/" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full">
                  Issue Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading success details...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}