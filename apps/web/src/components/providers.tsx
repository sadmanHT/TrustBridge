'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { config } from '../lib/wagmi';
import { useState, useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';

// Create query client with proper initialization
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure the QueryClient is created only once per component instance
  const [queryClient] = useState(() => makeQueryClient());

  // Suppress WalletConnect warnings on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.warn = function(...args) {
        const message = String(args[0] || '');
        if (
          message.includes('WalletConnect Core is already initialized') ||
          message.includes('This is probably a mistake and can lead to unexpected behavior') ||
          message.includes('Init() was called')
        ) {
          return;
        }
        return originalWarn.apply(this, args);
      };
      
      console.error = function(...args) {
        const message = String(args[0] || '');
        if (
          message.includes('WalletConnect Core is already initialized') ||
          message.includes('Init() was called')
        ) {
          return;
        }
        return originalError.apply(this, args);
      };
      
      // Cleanup function to restore original console methods
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}