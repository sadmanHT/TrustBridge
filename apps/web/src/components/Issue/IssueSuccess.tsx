'use client';

import React, { useCallback } from 'react';
import { CheckCircle, Copy, ExternalLink, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeCard } from '@/components/ui/QR';
import { CopyField } from '@/components/ui/Copy';
import { CopyButton } from '@/components/ui/copy-button';
import { useToast } from '@/hooks/use-toast';
import { generateDiplomaPDF } from '@/lib/diploma';
import { formatTxHash } from '@/lib/format';
import { cn } from '@/lib/utils';

interface IssueSuccessProps {
  hash: string;
  txHash: string;
  cid?: string;
  fileName?: string;
  className?: string;
}

export function IssueSuccess({ hash, txHash, cid, fileName, className }: IssueSuccessProps) {
  const { toast } = useToast();
  
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/verify?hash=${encodeURIComponent(hash)}`;
  const etherscanUrl = `https://etherscan.io/tx/${txHash}`;
  const ipfsUrl = cid ? `https://ipfs.io/ipfs/${cid}` : undefined;

  const handleDownloadDiploma = useCallback(async () => {
    try {
      // Show generating toast
      toast({
        title: "Generating Diploma",
        description: "Creating your digital diploma PDF...",
      });

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
        credentialTitle: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Digital Credential',
        issuerAddress: 'Blockchain Issuer', // This could be passed as a prop if available
        txHash: txHash,
        docHash: hash,
        issuedAtISO: new Date().toISOString(),
        qrPngDataUrl: qrCodeDataUrl,
      };

      // Generate PDF
      const pdfBytes = await generateDiplomaPDF(diplomaData);

      // Create blob and download
      // pdfBytes: Uint8Array
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      
      // Ensure we only call browser APIs on the client
      if (typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TrustBridge-Diploma.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
      }

      // Show success toast
      toast({
        title: "Diploma Downloaded",
        description: "Your digital diploma has been saved as TrustBridge-Diploma.pdf",
      });

    } catch (error) {
      console.error('Error generating diploma:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate diploma",
        variant: "destructive",
      });
    }
  }, [hash, txHash, fileName, verificationUrl, toast]);

  const handleCopyVerifyLink = useCallback(() => {
    navigator.clipboard.writeText(verificationUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Verification link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy verification link",
        variant: "destructive",
      });
    });
  }, [verificationUrl, toast]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Credential Issued Successfully!
        </CardTitle>
        <CardDescription>
          Your document has been verified and stored on the blockchain.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Document Hash */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Document Hash (SHA-256)</label>
            <Badge variant="outline" className="text-xs text-gray-500">
              Cryptographic Fingerprint
            </Badge>
          </div>
          <CopyField 
            value={hash} 
            label="Document Hash" 
            className="font-mono text-xs" 
          />
        </div>

        {/* Transaction Hash */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Transaction Hash</label>
          <div className="flex items-center space-x-2">
            <CopyField 
              value={txHash} 
              label="Transaction Hash" 
              className="font-mono text-xs flex-1" 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(etherscanUrl, '_blank')}
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* IPFS CID (if available) */}
        {cid && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">IPFS Content ID</label>
              <Badge variant="outline" className="text-xs text-blue-500">
                Decentralized Storage
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <CopyField 
                value={cid} 
                label="IPFS CID" 
                className="font-mono text-xs flex-1" 
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(ipfsUrl!, '_blank')}
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Verification QR Code</p>
            <QRCodeCard 
              value={verificationUrl}
              size={200}
              downloadFileName={`trustbridge-${fileName || 'credential'}-qr`}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Verification URL</label>
            <CopyField value={verificationUrl} label="Verification URL" className="text-xs" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            onClick={handleDownloadDiploma}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 hover:scale-[1.02]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Diploma
          </Button>
          
          <Button 
            onClick={handleCopyVerifyLink}
            variant="outline"
            className="font-semibold"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copy Verify Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}