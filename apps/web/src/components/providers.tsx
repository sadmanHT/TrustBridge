'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './providers/AuthProvider';
import { config, sepolia } from '../lib/wagmi';
import { initializeWalletListeners } from '../lib/walletListeners';
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

  // Suppress WalletConnect warnings and initialize wallet listeners
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Suppress WalletConnect initialization warnings
    console.warn = function(...args) {
      const message = String(args[0] || '');
      if (
        message.includes('WalletConnect Core is already initialized') ||
        message.includes('This is probably a mistake and can lead to unexpected behavior') ||
        message.includes('Init() was called') ||
        message.includes('WalletConnect Core is already initialized. This is probably a mistake a')
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
    
    // Initialize wallet listeners after a short delay to avoid race conditions
    const timer = setTimeout(() => {
      initializeWalletListeners();
    }, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <RainbowKitProvider
              modalSize="compact"
              initialChain={sepolia}
              showRecentTransactions={true}
            >
              {children}
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}