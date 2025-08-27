'use client';

import { useState } from 'react';
import Lottie from 'lottie-react';
import { Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import successAnimation from '../../../public/animations/success.json';

interface VerifySuccessProps {
  issuer: string;
  cid?: string;
  hash: string;
}

export function VerifySuccess({ issuer, cid, hash }: VerifySuccessProps) {
  const [copiedIssuer, setCopiedIssuer] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const { toast } = useToast();

  const shortAddress = `${issuer.slice(0, 6)}...${issuer.slice(-4)}`;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?hash=${hash}`;

  const copyToClipboard = async (text: string, type: 'issuer' | 'share') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'issuer') {
        setCopiedIssuer(true);
        setTimeout(() => setCopiedIssuer(false), 2000);
      } else {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
      
      toast({
        title: 'Copied!',
        description: type === 'issuer' ? 'Issuer address copied to clipboard' : 'Share link copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  const openCidLink = () => {
    if (cid) {
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      window.open(ipfsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardContent className="p-8 text-center space-y-6">
        {/* Lottie Animation */}
        <div className="flex justify-center">
          <div className="w-24 h-24">
            <Lottie
              animationData={successAnimation}
              loop={false}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
            Verified ✅
          </h2>
          <p className="text-sm text-green-600 dark:text-green-300">
            This credential is valid and verified on the blockchain
          </p>
        </div>

        {/* Issuer Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-left">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Issued by
              </p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {shortAddress}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(issuer, 'issuer')}
              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-800"
            >
              {copiedIssuer ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>

          {/* CID Link */}
          {cid && (
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-left flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Metadata
                </p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                  {cid.slice(0, 20)}...{cid.slice(-8)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={openCidLink}
                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-800"
              >
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <div className="pt-2">
          <Button
            onClick={() => copyToClipboard(shareUrl, 'share')}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            disabled={copiedShare}
          >
            {copiedShare ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share Verification Link
              </>
            )}
          </Button>
        </div>

        {/* Credential Hash */}
        <div className="pt-2 border-t border-green-200 dark:border-green-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Credential Hash
          </p>
          <Badge variant="outline" className="font-mono text-xs break-all">
            {hash}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default VerifySuccess;