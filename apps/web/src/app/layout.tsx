import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '../components/providers';
import { Toaster } from '../components/ui/toaster';
import NavBar from '../components/layout/NavBar';
import StatusStrip from '../components/Status/StatusStrip';
import Footer from '../components/layout/Footer';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TrustBridge - Blockchain Document Verification',
    template: '%s | TrustBridge'
  },
  description: 'Secure, decentralized document verification platform powered by Ethereum blockchain. Issue and verify digital credentials with cryptographic proof.',
  keywords: ['blockchain', 'document verification', 'ethereum', 'digital credentials', 'decentralized', 'cryptographic proof', 'IPFS'],
  authors: [{ name: 'TrustBridge Team' }],
  creator: 'TrustBridge',
  publisher: 'TrustBridge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://trustbridge.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trustbridge.app',
    title: 'TrustBridge - Blockchain Document Verification',
    description: 'Secure, decentralized document verification platform powered by Ethereum blockchain. Issue and verify digital credentials with cryptographic proof.',
    siteName: 'TrustBridge',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrustBridge - Blockchain Document Verification Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustBridge - Blockchain Document Verification',
    description: 'Secure, decentralized document verification platform powered by Ethereum blockchain.',
    images: ['/og-image.png'],
    creator: '@trustbridge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon.png' },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#0b0f1a',
    'theme-color': '#0b0f1a',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-grid`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {/* Navigation Bar */}
            <NavBar />
            
            {/* Status Strip */}
            <StatusStrip />
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}