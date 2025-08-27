# TrustBridge - Blockchain Credential Verification System

A decentralized credential verification system built on Ethereum that allows institutions to issue tamper-proof digital credentials and enables instant verification through blockchain technology.

## Features

- 🔐 **Secure Credential Issuance**: Only approved issuers can issue credentials
- 🔍 **Instant Verification**: Verify credentials using file upload, hash input, or QR code scanning
- 📱 **QR Code Generation**: Generate QR codes for easy credential sharing
- 🌐 **IPFS Integration**: Optional decentralized file storage
- 🔒 **Privacy-First**: Only document hashes stored on-chain, no PII
- ⚡ **Client-Side Processing**: Files processed locally in browser

## Prerequisites

- Node.js 18+ and Yarn
- Ethereum wallet with Sepolia testnet ETH
- Alchemy API key for blockchain connectivity
- Web3.Storage token for IPFS uploads (optional)

## Setup Instructions

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Fill in the following variables in `.env`:

- `ALCHEMY_API_KEY`: Get from [Alchemy Dashboard](https://dashboard.alchemy.com/)
- `WALLET_PRIVATE_KEY`: Your wallet's private key (without 0x prefix)
- `WEB3_STORAGE_TOKEN`: Get from [Web3.Storage](https://web3.storage/) (optional for IPFS)

### 2. Install Dependencies

```bash
# Install all dependencies
yarn
```

### 3. Smart Contract Setup

```bash
# Compile contracts
yarn contracts:compile

# Run tests
yarn contracts:test

# Deploy to Sepolia testnet
yarn contracts:deploy:sepolia
```

The deployment will:
- Print the deployed contract address
- Automatically create `/apps/web/src/contractConfig.json` with the contract details

### 4. Start the Web Application

```bash
# Start Next.js development server
yarn web:dev
```

The application will be available at `http://localhost:3000`

## Getting Sepolia ETH

You'll need Sepolia testnet ETH to deploy contracts and issue credentials:

1. **Alchemy Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
2. **Chainlink Faucet**: [https://faucets.chain.link/sepolia](https://faucets.chain.link/sepolia)
3. **QuickNode Faucet**: [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia)

## GitHub Setup and Deployment

### Prerequisites

1. **Git Installation**: Download and install Git from [git-scm.com](https://git-scm.com/)
2. **GitHub Account**: Sign up at [github.com](https://github.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
4. **Environment Variables**: Have your environment variables ready

### Initial Setup

#### 1. Initialize Git Repository

```bash
# Navigate to project root
cd D:\Blockchain

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: TrustBridge blockchain credential system"
```

#### 2. Push to GitHub

1. **Create Repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `trustbridge` or similar
   - Don't initialize with README (we already have one)

2. **Connect and Push**:
   ```bash
   # Add GitHub remote (replace with your repository URL)
   git remote add origin https://github.com/yourusername/trustbridge.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

#### 3. Verify Build

Ensure the application builds cleanly:

```bash
# Navigate to web app
cd apps/web

# Install dependencies
npm install

# Build the application
npm run build
```

### Vercel Deployment

#### 1. Import Project

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `apps/web` directory as the root directory

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `apps/web`

#### 2. Configure Environment Variables

Go to **Project Settings → Environment Variables** and add:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY_URL=your_pinata_gateway
```

**Important**: Set these for all environments (Production, Preview, Development)

#### 3. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at the provided URL

### Redeployment

#### Automatic Redeployment (Recommended)

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

**That's it!** Vercel automatically detects the push and redeploys your application.

#### Manual Redeployment

1. Go to your Vercel project dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on any previous deployment

### Environment Variable Updates

1. **Update in Vercel**:
   - Go to Project Settings → Environment Variables
   - Edit existing variables or add new ones
   - Choose environments (Production, Preview, Development)

2. **Trigger Redeployment**:
   ```bash
   # Environment changes require redeployment
   git commit --allow-empty -m "Trigger redeploy for env var changes"
   git push origin main
   ```

### Development Workflow

```bash
# 1. Make changes to your code
# 2. Test locally
npm run dev

# 3. Build and test
npm run build

# 4. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 5. Vercel automatically deploys
```

### Troubleshooting

#### Build Failures
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify local build works: `npm run build`
- Check for missing dependencies

#### Git Issues
- Ensure Git is installed: `git --version`
- Check remote URL: `git remote -v`
- Verify GitHub authentication

#### Environment Issues
- Verify all required environment variables are set
- Check contract addresses match deployed contracts
- Ensure API keys are valid

### Security Best Practices

1. **Never commit sensitive data**:
   - `.env` files are excluded by `.gitignore`
   - Use Vercel's environment variable system
   - Rotate API keys regularly

2. **Repository Security**:
   - Keep repository private if needed
   - Use branch protection rules
   - Review pull requests before merging

### Domain Configuration

1. **Custom Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS as instructed
   - SSL certificates are automatic

### Monitoring and Maintenance

1. **Monitor Deployments**:
   - Check Vercel dashboard regularly
   - Set up deployment notifications
   - Monitor function logs for errors

2. **Keep Updated**:
   - Update dependencies regularly
   - Test in preview deployments
   - Monitor for security vulnerabilities

## End-to-End Demo Flow

### For Issuers (Educational Institutions)

1. **Connect Wallet**
   - Navigate to `/issuer`
   - Connect your MetaMask wallet
   - Ensure you're on Sepolia testnet

2. **Issue a Credential**
   - Fill in student details (name, degree, graduation year)
   - Upload the credential document (PDF, image, etc.)
   - Click "Issue Credential"
   - Confirm the transaction in MetaMask

3. **Share Verification**
   - After successful issuance, a QR code is generated
   - Download the QR code as PNG
   - Share the verification URL or QR code with the student

### For Verifiers (Employers, Other Institutions)

1. **Verify Credentials**
   - Navigate to `/verify`
   - Choose verification method:
     - **File Upload**: Upload the original document
     - **Hash Input**: Enter the document hash directly
     - **QR Scanner**: Scan the QR code from issuer
     - **URL Parameter**: Use shared verification links

2. **View Results**
   - See verification status (Valid/Invalid/Not Found)
   - View issuer information
   - Access IPFS document link (if available)
   - Share verification results

### For Students (Credential Holders)

1. **Receive Credentials**
   - Get QR code or verification URL from issuer
   - Save the original document file

2. **Share with Verifiers**
   - Provide the verification URL
   - Share the QR code
   - Or give access to the original document file

## Project Structure

```
├── apps/web/                 # Next.js frontend application
│   ├── src/app/issuer/       # Credential issuance interface
│   ├── src/app/verify/       # Credential verification interface
│   ├── src/lib/              # Utility libraries (IPFS, hashing, etc.)
│   └── src/components/       # Reusable UI components
├── contracts/                # Smart contracts and deployment scripts
│   ├── contracts/            # Solidity smart contracts
│   ├── scripts/              # Deployment scripts
│   └── test/                 # Contract tests
└── README.md                 # This file
```

## Security Features

- **Client-Side Hashing**: Files are hashed locally using Web Crypto API
- **Minimal On-Chain Data**: Only SHA-256 hashes and metadata stored on blockchain
- **No PII On-Chain**: Personal information stored locally, not on blockchain
- **Issuer Whitelist**: Only approved addresses can issue credentials
- **Privacy Warnings**: Clear notices about public IPFS storage

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum (Sepolia), Solidity, Hardhat
- **Web3**: Wagmi, RainbowKit, Viem
- **Storage**: IPFS via Web3.Storage
- **UI Components**: Radix UI, Lucide Icons

## Troubleshooting

### Common Issues

1. **Transaction Fails**
   - Ensure you have enough Sepolia ETH
   - Check if you're an approved issuer
   - Verify network connection

2. **IPFS Upload Fails**
   - Check Web3.Storage token configuration
   - Verify file size limits
   - Check network connectivity

3. **Verification Not Working**
   - Ensure the document hasn't been modified
   - Check if the credential was issued on the same network
   - Verify the contract address is correct

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment configuration
3. Ensure you're connected to Sepolia testnet
4. Check that all dependencies are installed correctly

## 🎬 Demo Mode - Complete Walkthrough

Follow this step-by-step demo to see TrustBridge in action:

### Scene 1: The Problem 🚨

**Scenario**: A university graduate needs to prove their degree authenticity to an employer, but traditional paper certificates can be forged or lost.

```
❌ Traditional Problems:
• Paper certificates can be forged
• Verification requires manual contact with institutions
• Documents can be lost or damaged
• No instant verification possible
```

### Scene 2: Issuer Issues Credential 🎓

**University Admin Issues Digital Credential**

1. **Navigate to Issuer Dashboard**
   ```bash
   # Open browser to:
   http://localhost:3000/issuer
   ```

2. **Connect Wallet & Fill Details**
   ```
   Expected UI:
   ┌─────────────────────────────────────┐
   │ 🎓 Credential Issuer Dashboard      │
   │                                     │
   │ Student Name: [John Doe           ] │
   │ Degree: [Computer Science BS      ] │
   │ Graduation Year: [2024            ] │
   │ Document: [📄 diploma.pdf         ] │
   │                                     │
   │ [Issue Credential] 🔗 Connected    │
   └─────────────────────────────────────┘
   ```

3. **Transaction Confirmation**
   ```bash
   Expected CLI Output:
   ✅ Computing document hash...
   ✅ Uploading to IPFS...
   ✅ Issuing credential on blockchain...
   
   Transaction Hash: 0x1234...abcd
   Document Hash: 0x5678...efgh
   IPFS CID: bafybeig...example
   Gas Used: 85,432
   ```

### Scene 3: QR Code Generated & Shared 📱

**Success Screen with QR Code**

```
Expected UI:
┌─────────────────────────────────────┐
│ ✅ Credential Issued Successfully!   │
│                                     │
│ Student: John Doe                   │
│ Degree: Computer Science BS         │
│ Year: 2024                          │
│                                     │
│     ████ ▄▄▄▄ ██▄▄ ████            │
│     █  █ █▄▄█ █▄▄█ █  █            │
│     ████ ▄▄▄▄ ██▄▄ ████            │
│                                     │
│ Verification URL:                   │
│ localhost:3000/verify?hash=0x5678   │
│                                     │
│ [📥 Download PNG] [🔗 Copy Link]    │
└─────────────────────────────────────┘
```

**CLI Output:**
```bash
🎉 Credential issued successfully!
📱 QR Code generated for easy sharing
🔗 Verification URL: http://localhost:3000/verify?hash=0x5678...efgh
```

### Scene 4: Verifier Uploads/Scans → ✅ Verified 🔍

**Employer Verifies the Credential**

1. **Navigate to Verification Page**
   ```bash
   # Open browser to:
   http://localhost:3000/verify
   ```

2. **Multiple Verification Methods**
   ```
   Expected UI:
   ┌─────────────────────────────────────┐
   │ 🔍 Credential Verification          │
   │                                     │
   │ Choose verification method:         │
   │ • [📄 Upload Document]              │
   │ • [#️⃣ Enter Hash]                   │
   │ • [📱 Scan QR Code]                 │
   │ • [🔗 Paste URL]                    │
   └─────────────────────────────────────┘
   ```

3. **Verification Process**
   ```bash
   Expected CLI Output:
   🔄 Computing document hash...
   🔍 Checking blockchain...
   📡 Querying Sepolia network...
   
   Hash: 0x5678...efgh
   Block: 4,521,337
   Gas Used: 21,000
   ```

4. **Verification Results**
   ```
   Expected UI:
   ┌─────────────────────────────────────┐
   │ ✅ CREDENTIAL VERIFIED              │
   │                                     │
   │ Status: ✅ Valid                    │
   │ Issuer: University of Technology    │
   │ Address: 0x1234...5678              │
   │ Issued: 2024-01-15 14:30:22        │
   │                                     │
   │ Document Details:                   │
   │ • Hash: 0x5678...efgh               │
   │ • IPFS: bafybeig...example          │
   │ • Size: 2.4 MB                      │
   │                                     │
   │ [🔗 View on IPFS] [📋 Copy Hash]    │
   │ [🔄 Verify Another] [📤 Share]      │
   └─────────────────────────────────────┘
   ```

**Final CLI Output:**
```bash
🎉 VERIFICATION COMPLETE!

✅ Status: VALID
🏛️  Issuer: University of Technology (Approved)
📅 Issued: January 15, 2024
🔗 Transaction: 0x1234...abcd
📄 Document: diploma.pdf (Authentic)

🔒 Security Features Verified:
  ✅ Document hash matches blockchain
  ✅ Issuer is approved and valid
  ✅ Credential has not been revoked
  ✅ IPFS document accessible

⚡ Verification completed in 2.3 seconds
```

### 🎯 Demo Summary

**What Just Happened:**
1. **Problem Solved**: Instant, tamper-proof credential verification
2. **Issuer**: University issued credential with blockchain anchoring
3. **Student**: Received QR code for easy sharing
4. **Verifier**: Instantly verified authenticity without contacting university

**Key Benefits Demonstrated:**
- ⚡ **Instant Verification**: 2-3 seconds vs days/weeks
- 🔒 **Tamper-Proof**: Blockchain ensures document integrity
- 🌐 **Global Access**: Works anywhere with internet
- 💰 **Cost Effective**: No manual verification processes
- 🔐 **Privacy-First**: Only hashes on-chain, documents stay private

## License

MIT License - see LICENSE file for details.