'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Shield, Upload, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectButton } from '@/components/Wallet/ConnectButton';
import { NetworkBadge } from '@/components/Status/NetworkBadge';
import { ContractCard } from '@/components/Status/ContractCard';
import { IssuerCard } from '@/components/Status/IssuerCard';
import { IssueCard } from '@/components/Issue/IssueCard';
import { VerifyCard } from '@/components/Verify/VerifyCard';
import { Container, Grid, Section, Spacer, Divider } from '@/components/ui/Layout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Hero from '@/components/sections/Hero';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('issue');

  const handleIssueComplete = (hash: string, txHash: string) => {
    toast({
      title: "Credential Issued Successfully",
      description: `Document hash: ${hash.slice(0, 10)}... | Tx: ${txHash.slice(0, 10)}...`,
    });
  };

  const handleVerificationComplete = (result: { valid: boolean }) => {
    toast({
      title: result.valid ? "Valid Credential" : "Invalid Credential",
      description: result.valid 
        ? "Document credential is verified on the blockchain"
        : "Document credential is invalid or revoked",
      variant: result.valid ? "default" : "destructive",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="skip-link sr-only focus:not-sr-only"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      {/* Hero Section */}
      <Hero 
        onIssueClick={() => setActiveTab('issue')}
        onVerifyClick={() => setActiveTab('verify')}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Section className="border-b border-white/10 glass py-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent-gradient rounded-lg" aria-hidden="true">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-accent-gradient">TrustBridge</h1>
                  <p className="text-sm text-slate-300">Blockchain Document Verification</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4" role="navigation" aria-label="User account and network status">
              <NetworkBadge />
              <ConnectButton />
            </div>
          </div>
        </Section>
      </motion.div>

      <Container size="xl" className="py-8">

        {/* Status Cards */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <section className="mb-8" aria-labelledby="system-status-heading">
              <h3 id="system-status-heading" className="text-lg font-semibold text-slate-100 mb-4">System Status</h3>
              <Grid className="grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <ContractCard />
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <IssuerCard />
                </motion.div>
              </Grid>
            </section>
            <Divider className="mb-8 border-white/10" />
          </motion.div>
        )}

        {/* Main Application */}
        <main
          id="main-content"
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Full-width Pill Tabs */}
            <div className="w-full">
              <div 
                className="flex w-full bg-slate-800/30 backdrop-blur-sm rounded-full p-1 border border-white/10"
role="tablist"
                aria-label="Document credential actions"
              >
                <motion.button
                  onClick={() => setActiveTab('issue')}
                  whileTap={{ scale: 0.98 }}
                  role="tab"
                  aria-selected={activeTab === 'issue'}
                  aria-controls="issue-panel"
                  id="issue-tab"
className={cn(
                    "flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-full transition-all duration-300 font-medium focus-enhanced",
                    activeTab === 'issue'
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  )}
                  aria-label="Switch to issue credential tab"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>Issue Credential</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('verify')}
                  whileTap={{ scale: 0.98 }}
                  role="tab"
                  aria-selected={activeTab === 'verify'}
                  aria-controls="verify-panel"
                  id="verify-tab"
className={cn(
                    "flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-full transition-all duration-300 font-medium focus-enhanced",
                    activeTab === 'verify'
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  )}
                  aria-label="Switch to verify credential tab"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Verify Credential</span>
                </motion.button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="w-full">
              {activeTab === 'issue' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  role="tabpanel"
                  id="issue-panel"
                  aria-labelledby="issue-tab"
                >
                  <Card className="glass border-white/10 shadow-2xl">
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl text-high-contrast">Issue New Credential</CardTitle>
                      <CardDescription className="text-high-contrast-muted text-base">
                        Upload a document to create a tamper-proof blockchain credential
                      </CardDescription>
                      <p className="text-sm text-slate-500 mt-2">
                        Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, GIF • Max size: 10MB
                      </p>
                    </CardHeader>
                    <CardContent>
                      <IssueCard 
                        onSuccess={handleIssueComplete}
                        className="border-0 bg-transparent shadow-none"
                        onSwitchToVerify={() => setActiveTab('verify')}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'verify' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  role="tabpanel"
                  id="verify-panel"
                  aria-labelledby="verify-tab"
                >
                  <Card className="glass border-white/10 shadow-2xl">
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl text-high-contrast">Verify Credential</CardTitle>
                      <CardDescription className="text-high-contrast-muted text-base">
                        Check if a document credential exists and is valid on the blockchain
                      </CardDescription>
                      <p className="text-sm text-slate-500 mt-2">
                        Upload the original file, enter its hash, or scan a QR code to verify authenticity
                      </p>
                    </CardHeader>
                    <CardContent>
                      <VerifyCard 
                        onVerificationComplete={handleVerificationComplete}
                        className="border-0 bg-transparent shadow-none"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </main>

        <Spacer size="xl" />

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Section className="glass rounded-2xl">
            <div className="text-center mb-12">
              <h3 id="how-it-works-heading" className="text-2xl font-bold text-high-contrast mb-4">How It Works</h3>
              <p className="text-high-contrast-muted max-w-2xl mx-auto">
                TrustBridge uses blockchain technology to create tamper-proof document verification
              </p>
            </div>
            
            <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="listitem"
              >
                <Card className="text-center glass border-0">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-accent-gradient rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-high-contrast">1. Upload Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-high-contrast-muted">
                      Upload your document and generate a cryptographic hash that uniquely identifies it
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="listitem"
              >
                <Card className="text-center glass border-0">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-accent-gradient rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-high-contrast">2. Blockchain Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-high-contrast-muted">
                      The document hash is recorded on the blockchain, creating an immutable verification record
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="listitem"
              >
                <Card className="text-center glass border-0">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-accent-gradient rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-high-contrast">3. Instant Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-high-contrast-muted">
                      Anyone can verify document authenticity by checking the hash against blockchain records
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Section>
        </motion.div>

        <Spacer size="lg" />

        {/* Footer */}
        <footer className="text-center text-sm text-slate-400" role="contentinfo">
          <p>Powered by Ethereum • Built with Next.js & Wagmi</p>
        </footer>
      </Container>
    </div>
  );
}