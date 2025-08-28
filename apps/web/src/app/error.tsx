'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isDevelopment 
              ? `Error: ${error.message}`
              : 'An unexpected error occurred. Please try again later.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && error.digest && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              Error ID: {error.digest}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset} 
              variant="default" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>If this problem persists, please contact our support team.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}