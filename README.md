# TrustBridge - Blockchain Credential Verification System

A decentralized credential verification system built on Ethereum that allows institutions to issue tamper-proof digital credentials and enables instant verification through blockchain technology.

## Features

- 🔐 **Secure Credential Issuance**: Only approved issuers can issue credentials
- 🔍 **Instant Verification**: Verify credentials using file upload, hash input, or QR code scanning
- 📱 **QR Code Generation**: Generate QR codes for easy credential sharing
- 🌐 **IPFS Integration**: Optional decentralized file storage
- 🔒 **Privacy-First**: Only document hashes stored on-chain, no PII
- ⚡ **Client-Side Processing**: Files processed locally in browser
- 👤 **User Authentication**: Secure login system with NextAuth.js
- 💼 **Personal Dashboard**: Track your credential activities and linked wallets
- 🔗 **Wallet Linking**: Connect multiple Ethereum wallets to your account
- 👑 **Admin Panel**: Administrative dashboard for system management
- 📊 **Activity Tracking**: Comprehensive logging of all credential operations
- 🛡️ **Rate Limiting**: API protection with configurable rate limits

## Prerequisites

- Node.js 18+ and Yarn
- Ethereum wallet with Sepolia testnet ETH
- Alchemy API key for blockchain connectivity
- Web3.Storage token for IPFS uploads (optional)
- Database (SQLite for development, PostgreSQL for production)

## Setup Instructions

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Fill in the following variables in `.env`:

**Database Configuration:**
- `DATABASE_URL`: Database connection string (e.g., `file:./dev.db` for SQLite)

**Authentication:**
- `NEXTAUTH_SECRET`: Random secret key for NextAuth.js session encryption
- `NEXTAUTH_URL`: Your application URL (e.g., `http://localhost:3000`)

**Blockchain Configuration:**
- `ALCHEMY_API_KEY`: Get from [Alchemy Dashboard](https://dashboard.alchemy.com/)
- `WALLET_PRIVATE_KEY`: Your wallet's private key (without 0x prefix)
- `WEB3_STORAGE_TOKEN`: Get from [Web3.Storage](https://web3.storage/) (optional for IPFS)

**Rate Limiting (Optional):**
- `UPSTASH_REDIS_REST_URL`: Redis URL for rate limiting
- `UPSTASH_REDIS_REST_TOKEN`: Redis token for rate limiting

### 2. Install Dependencies

```bash
# Install all dependencies
yarn
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Smart Contract Setup

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

### 5. Start the Web Application

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

## 🚀 Quick Deployment (1-Click)

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftrustbridge&project-name=trustbridge&repository-name=trustbridge&root-directory=apps%2Fweb&env=NEXTAUTH_SECRET,DATABASE_URL,NEXT_PUBLIC_RPC_URL,PINATA_JWT&envDescription=Required%20environment%20variables%20for%20TrustBridge&envLink=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftrustbridge%23environment-configuration)

**Steps:**
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account and fork the repository
3. Configure the required environment variables:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `DATABASE_URL`: Your database connection string
   - `NEXT_PUBLIC_RPC_URL`: Your Alchemy or Infura RPC URL
   - `PINATA_JWT`: Your Pinata JWT token (optional)
4. Click "Deploy" and wait for the build to complete
5. Your TrustBridge app will be live at the provided URL!

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/trustbridge&base=apps/web)

**Steps:**
1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account and authorize Netlify
3. Configure the required environment variables in Netlify dashboard:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `DATABASE_URL`: Your database connection string
   - `NEXT_PUBLIC_RPC_URL`: Your Alchemy or Infura RPC URL
   - `PINATA_JWT`: Your Pinata JWT token (optional)
4. Click "Deploy site" and wait for the build to complete
5. Your TrustBridge app will be live at the provided `.netlify.app` URL!

---

## 🛠️ Manual Setup and Deployment

### Prerequisites

1. **Git Installation**: Download and install Git from [git-scm.com](https://git-scm.com/)
2. **GitHub Account**: Sign up at [github.com](https://github.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) OR **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
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

## Netlify Deployment (Alternative)

### Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be in a GitHub repository (already completed above)
3. **Environment Variables**: Have your environment variables ready

### Netlify Configuration

The repository includes a <mcfile name="netlify.toml" path="D:\Blockchain\netlify.toml"></mcfile> configuration file with optimized settings:

```toml
[build]
  base = "apps/web"
  command = "npm run build"
  publish = "apps/web/.next"

[build.environment]
  NODE_VERSION = "18"
```

### Deployment Steps

#### 1. Import Project to Netlify

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose "GitHub" and authorize Netlify
   - Select your `trustbridge` repository

2. **Configure Build Settings**:
   - **Base directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/web/.next`
   - **Node version**: 18 (automatically set by netlify.toml)

#### 2. Environment Variables

Go to **Site Settings → Environment Variables** and add:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY_URL=your_pinata_gateway
```

#### 3. Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your application
3. Your app will be available at the provided `.netlify.app` URL

### Netlify vs Vercel Comparison

| Feature | Netlify | Vercel |
|---------|---------|--------|
| **Ease of Setup** | Simple Git integration | Simple Git integration |
| **Build Performance** | Good | Excellent |
| **Edge Functions** | Available | Available |
| **Custom Domains** | Free SSL included | Free SSL included |
| **Analytics** | Basic (paid for advanced) | Built-in Web Vitals |
| **Pricing** | Generous free tier | Generous free tier |
| **Best For** | Static sites, JAMstack | Next.js applications |

### Netlify Redeployment

#### Automatic Redeployment
```bash
# Any push to main branch triggers automatic deployment
git add .
git commit -m "Your changes"
git push origin main
```

#### Manual Redeployment
1. Go to Netlify site dashboard
2. Click "Deploys" tab
3. Click "Trigger deploy" → "Deploy site"

### Netlify-Specific Features

#### 1. Branch Previews
- Automatic deploy previews for pull requests
- Each branch gets its own preview URL
- Perfect for testing before merging

#### 2. Form Handling
- Built-in form processing (if needed for contact forms)
- Spam protection included
- No backend required

---

## 🔧 Production Deployment Checklist

### Before Going Live

- [ ] **Environment Variables**: All required environment variables are set
- [ ] **Database**: Production database is configured and accessible
- [ ] **Smart Contracts**: Contracts are deployed to mainnet (not testnet)
- [ ] **API Keys**: All API keys are valid and have appropriate rate limits
- [ ] **Domain**: Custom domain is configured (optional)
- [ ] **SSL**: HTTPS is enabled (automatic on Vercel/Netlify)
- [ ] **Error Monitoring**: Set up error tracking (Sentry, LogRocket, etc.)
- [ ] **Analytics**: Configure analytics if needed
- [ ] **Backup**: Database backup strategy is in place

### Environment Variables for Production

```env
# Authentication (Required)
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Blockchain (Required)
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# File Storage (Optional)
PINATA_JWT=your-pinata-jwt-token
NEXT_PUBLIC_PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Build Configuration
SKIP_ENV_VALIDATION=true
NODE_ENV=production
```

### Post-Deployment Verification

After deployment, verify these core functionalities:

1. **🔐 Authentication Flow**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Session persistence works
   - [ ] Logout works properly

2. **📊 Dashboard Access**
   - [ ] User dashboard loads
   - [ ] Wallet connection works
   - [ ] Activity history displays
   - [ ] Profile management works

3. **📄 Credential Operations**
   - [ ] Issue credential (admin)
   - [ ] Upload and verify credential
   - [ ] QR code generation works
   - [ ] Hash verification works

4. **✅ Verification Flow**
   - [ ] File upload verification
   - [ ] Hash input verification
   - [ ] QR code scanning works
   - [ ] Verification results display correctly

5. **🔗 Blockchain Integration**
   - [ ] Wallet connection works
   - [ ] Contract interactions work
   - [ ] Transaction signing works
   - [ ] Network switching works (if applicable)

### Performance Optimization

- **Image Optimization**: Next.js automatically optimizes images
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Configure appropriate cache headers
- **CDN**: Vercel/Netlify provide global CDN automatically
- **Database**: Use connection pooling for production databases
- **Monitoring**: Set up performance monitoring (Vercel Analytics, etc.)

### Security Considerations

- **Environment Variables**: Never commit secrets to version control
- **API Rate Limiting**: Implement rate limiting for public APIs
- **Input Validation**: All user inputs are validated
- **CORS**: Configure appropriate CORS policies
- **CSP**: Consider implementing Content Security Policy
- **Database**: Use read-only database users where possible
- **Logging**: Log security events but not sensitive data

#### 3. Split Testing
- A/B testing capabilities
- Traffic splitting between deployments
- Analytics for conversion tracking

### Troubleshooting Netlify

#### Build Failures
- Check build logs in Netlify dashboard
- Verify Node.js version compatibility
- Ensure all dependencies are listed in package.json
- Check environment variables are set

#### Runtime Issues
- Verify all `NEXT_PUBLIC_*` variables are set
- Check browser console for client-side errors
- Review Netlify function logs if using serverless functions

### Custom Domain on Netlify

1. **Add Domain**:
   - Go to Site Settings → Domain management
   - Click "Add custom domain"
   - Enter your domain name

2. **Configure DNS**:
   - Point your domain's DNS to Netlify
   - Use Netlify's nameservers or CNAME records
   - SSL certificate is automatically provisioned

### Security Headers

The `netlify.toml` includes security headers:
- X-Frame-Options: Prevents clickjacking
- X-XSS-Protection: XSS attack protection
- Content-Security-Policy: Controls resource loading
- X-Content-Type-Options: MIME type sniffing protection

## Usage

### Authentication System

The application now includes a comprehensive authentication system:

1. **Sign Up/Login**: Create an account or sign in at `/auth/signin`
2. **Link Wallets**: Connect multiple Ethereum wallets to your account
3. **Personal Dashboard**: View your activity history and linked wallets
4. **Admin Access**: Administrators can access system-wide statistics and user management

### Creating Users

**Option 1: Database Seeding**
```bash
npx prisma db seed
```
This creates sample users including an admin user.

**Option 2: Manual Registration**
1. Navigate to `/auth/signin`
2. Click "Create Account" or sign up
3. Complete the registration process

**Option 3: Direct Database Insert**
```bash
npx prisma studio
# Use Prisma Studio to manually create users
```

### Wallet Linking Process

1. **Login** to your account
2. **Navigate to Dashboard** (`/dashboard`)
3. **Click "Link New Wallet"**
4. **Connect your wallet** using WalletConnect or MetaMask
5. **Sign the verification message** to prove wallet ownership
6. **Wallet is now linked** and appears in your dashboard

### Dashboard Features

**Personal Dashboard** (`/dashboard`):
- View all your credential activities
- Manage linked wallets
- Track issuance and verification history
- Quick access to issue new credentials

**Admin Dashboard** (`/admin`):
- System-wide statistics
- User management
- Activity monitoring
- Platform analytics

### For Issuers

1. **Login** to your account (required)
2. **Connect your wallet** using the "Connect Wallet" button
3. **Upload a document** you want to issue as a credential
4. **Review the document hash** and metadata
5. **Submit to blockchain** - this will create an immutable record
6. **Activity is logged** to your dashboard automatically
7. **Share the QR code** or document hash with the credential holder

### For Verifiers

1. **Choose verification method**:
   - Upload the original document
   - Enter the document hash directly
   - Scan a QR code
2. **View verification results** showing:
   - Document authenticity status
   - Issuer information
   - Timestamp of issuance
   - IPFS link (if available)
3. **No login required** for verification (public access)

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