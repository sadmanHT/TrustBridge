import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Loading...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we prepare your content
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}