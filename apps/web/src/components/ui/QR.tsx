'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Download, QrCode } from 'lucide-react';
import { useState, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
}

export function QRCode({ 
  value, 
  size = 200, 
  level = 'M', 
  includeMargin = true,
  className 
}: QRCodeProps) {
  return (
    <div className={className}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        className="border rounded-lg"
      />
    </div>
  );
}

interface QRCodeCardProps {
  value: string;
  title?: string;
  description?: string;
  size?: number;
  downloadFileName?: string;
  className?: string;
}

export function QRCodeCard({ 
  value, 
  title = 'QR Code', 
  description,
  size = 200,
  downloadFileName = 'qr-code',
  className 
}: QRCodeCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = async () => {
    // Client-side check for SSR safety
    if (typeof window === 'undefined' || !qrRef.current) return;
    
    setIsDownloading(true);
    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      // Create canvas and convert SVG to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${downloadFileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
          }
          setIsDownloading(false);
        }, 'image/png');
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setIsDownloading(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <QrCode className="h-5 w-5" />
              <h3 className="font-semibold">{title}</h3>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* QR Code */}
          <div ref={qrRef} className="flex justify-center">
            <QRCode value={value} size={size} />
          </div>

          {/* Download Button */}
          <Button
            onClick={downloadQR}
            disabled={isDownloading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download PNG'}</span>
          </Button>

          {/* Value Display */}
          <div className="w-full max-w-sm">
            <p className="text-xs text-muted-foreground text-center break-all">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      // Dynamic import to avoid SSR issues
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      const scanner = new Html5QrcodeScanner(
        'qr-scanner',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          setIsScanning(false);
        },
        (errorMessage) => {
          // Handle scan errors silently unless critical
          if (errorMessage.includes('NotFoundException')) {
            return; // Normal when no QR code is detected
          }
          console.warn('QR scan error:', errorMessage);
        }
      );
    } catch {
      const errorMsg = 'Failed to start QR scanner';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsScanning(false);
    }
  };

  return (
    <div className={className}>
      {!isScanning ? (
        <div className="text-center space-y-4">
          <Button onClick={startScanning} className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>Start QR Scanner</span>
          </Button>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div id="qr-scanner" className="w-full" />
          <Button 
            onClick={() => setIsScanning(false)} 
            variant="outline" 
            size="sm"
          >
            Stop Scanner
          </Button>
        </div>
      )}
    </div>
  );
}