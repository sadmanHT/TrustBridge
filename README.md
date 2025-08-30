# TrustBridge - Blockchain Credential Verification System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftrustbridge&project-name=trustbridge&repository-name=trustbridge&root-directory=apps%2Fweb)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/trustbridge&base=apps/web)

A decentralized credential verification system that enables institutions to issue tamper-proof digital credentials and provides instant verification through blockchain technology. Built on Ethereum with a focus on privacy, security, and user experience.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Data Segmentation](#data-segmentation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Smart Contracts](#smart-contracts)
- [Governance](#governance)
- [Contributing](#contributing)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🌟 Features

### Core Functionality
- 🔐 **Secure Credential Issuance**: Only approved issuers can issue credentials
- 🔍 **Instant Verification**: Verify credentials using file upload, hash input, or QR code scanning
- 📱 **QR Code Generation**: Generate QR codes for easy credential sharing
- 🌐 **IPFS Integration**: Optional decentralized file storage
- 🔒 **Privacy-First**: Only document hashes stored on-chain, no PII
- ⚡ **Client-Side Processing**: Files processed locally in browser

### User Management
- 👤 **User Authentication**: Secure login system with NextAuth.js
- 💼 **Personal Dashboard**: Track your credential activities and linked wallets
- 🔗 **Wallet Linking**: Connect multiple Ethereum wallets to your account
- 📊 **Activity Tracking**: Comprehensive logging of all credential operations

### Administration
- 👑 **Admin Panel**: Administrative dashboard for system management
- 🛡️ **Rate Limiting**: API protection with configurable rate limits
- 🔧 **Issuer Management**: Approve and revoke credential issuers
- 📈 **Analytics**: Monitor system usage and performance

## Technology Stack

### Core Technologies
| Category | Technology | Version | Purpose |
|----------|------------|---------|----------|
| **Framework** | Next.js | 14.x | Full-stack React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Blockchain** | Ethereum | Mainnet/Sepolia | Smart contract platform |
| **Smart Contracts** | Solidity | ^0.8.19 | Contract development language |
| **Database** | PostgreSQL/SQLite | Latest | Data persistence |

### Frontend Stack
- **UI Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS 3.x with custom components
- **Components**: Radix UI primitives for accessibility
- **Icons**: Lucide React icon library
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + Custom hooks
- **Web3 Integration**: Wagmi + RainbowKit + Viem

### Backend & API
- **API Routes**: Next.js serverless functions
- **Database ORM**: Prisma with PostgreSQL/SQLite
- **Authentication**: NextAuth.js with JWT sessions
- **Security**: bcryptjs hashing, rate limiting, CORS
- **File Storage**: IPFS via Web3.Storage (optional)

### Blockchain Infrastructure
- **Development**: Hardhat framework
- **Networks**: Ethereum Mainnet, Sepolia Testnet
- **RPC Provider**: Alchemy API
- **Wallet Connection**: WalletConnect v2
- **Contract Interaction**: ethers.js v6

### Development & Deployment
- **Package Manager**: npm
- **Build Tool**: Next.js built-in bundler
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (recommended) or Netlify
- **Database Hosting**: Neon, Supabase, or PlanetScale

### Dependencies Overview
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "prisma": "^5.0.0",
    "next-auth": "^4.24.0",
    "@radix-ui/react-*": "^1.0.0",
    "tailwindcss": "^3.0.0",
    "ethers": "^6.0.0",
    "wagmi": "^2.0.0"
  }
}
```

## System Architecture

TrustBridge follows a modular, three-tier architecture designed for scalability, security, and maintainability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Web Browser   │   Mobile App    │      Admin Dashboard        │
│   (Next.js)     │   (Future)      │      (Next.js)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
           │                │                        │
           └────────────────┼────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │   Backend API   │      Authentication         │
│   Components    │   Routes        │      (NextAuth.js)          │
│   • UI/UX       │   • REST API    │      • JWT Sessions         │
│   • State Mgmt  │   • Validation  │      • Wallet Linking       │
│   • Web3 Hooks  │   • Rate Limit  │      • Role Management      │
└─────────────────┴─────────────────┴─────────────────────────────┘
           │                │                        │
           └────────────────┼────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Database      │   Blockchain    │      File Storage           │
│   (PostgreSQL)  │   (Ethereum)    │      (IPFS/Local)          │
│   • User Data   │   • Credentials │      • Documents            │
│   • Sessions    │   • Hashes      │      • QR Codes             │
│   • Activity    │   • Issuers     │      • Metadata             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Component Interaction Flow

1. **User Authentication**: NextAuth.js handles user sessions and wallet linking
2. **Credential Issuance**: Frontend → API → Smart Contract → IPFS (optional)
3. **Verification**: File Upload → Hash Computation → Blockchain Query → Result
4. **Data Persistence**: User actions logged to PostgreSQL database
5. **Security**: Rate limiting, input validation, and CORS protection

## Data Segmentation

TrustBridge implements a privacy-first data segmentation strategy that separates sensitive information across different storage layers.

### Data Classification

| Data Type | Storage Location | Access Level | Encryption |
|-----------|------------------|--------------|------------|
| **Document Hashes** | Blockchain (Public) | Public Read | None (Hashes) |
| **User Credentials** | Database (Private) | Authenticated | bcrypt |
| **Session Data** | Database (Private) | User-specific | JWT |
| **Activity Logs** | Database (Private) | Admin/User | None |
| **Document Files** | IPFS/Local (Optional) | Public/Private | Client-side |
| **Wallet Addresses** | Database + Blockchain | User-linked | Signature Verified |

### Privacy Protection Strategy

#### On-Chain Data (Public)
- **Document Hashes**: SHA-256 hashes only (no PII)
- **Issuer Addresses**: Ethereum addresses (pseudonymous)
- **Timestamps**: Block timestamps (public)
- **Metadata URIs**: IPFS links (optional, can be private)

#### Off-Chain Data (Private)
- **User Information**: Names, emails (encrypted in database)
- **Document Content**: Never stored on blockchain
- **Session Data**: Temporary, expires automatically
- **Activity Logs**: Audit trail for compliance

#### Client-Side Processing
- **File Hashing**: Performed in browser using Web Crypto API
- **Document Upload**: Files never leave user's device unless explicitly shared
- **Wallet Signatures**: Generated locally, verified on-chain

### Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  TrustBridge │    │  Blockchain │
│   Device    │    │   Platform   │    │  (Ethereum) │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
   [1] │ Upload Document   │                   │
       ├──────────────────►│                   │
   [2] │ Compute Hash      │                   │
       │ (Client-side)     │                   │
   [3] │ Send Hash Only    │                   │
       ├──────────────────►│                   │
   [4] │                   │ Store Hash        │
       │                   ├──────────────────►│
   [5] │                   │ Return Tx Hash    │
       │                   │◄──────────────────┤
   [6] │ Verification Link │                   │
       │◄──────────────────┤                   │
```

### Compliance & Governance

- **GDPR Compliance**: No PII stored on immutable blockchain
- **Data Retention**: Configurable retention policies for off-chain data
- **Right to Erasure**: User data can be deleted from database (hashes remain on-chain)
- **Audit Trail**: Complete activity logging for compliance requirements

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version for version control
- **Web Browser**: Modern browser with Web3 support

### Required Accounts & Services
- **Ethereum Wallet**: MetaMask, WalletConnect, or compatible wallet
- **Alchemy Account**: For blockchain RPC access ([Get API Key](https://alchemy.com))
- **WalletConnect Project**: For wallet connection ([Create Project](https://walletconnect.com))
- **Database**: PostgreSQL for production (SQLite for development)

### Optional Services
- **IPFS Storage**: Web3.Storage or Pinata for file storage
- **Vercel/Netlify**: For deployment hosting

## Quick Start

### 1. Repository Setup
```bash
# Clone the repository
git clone <repository-url>
cd trustbridge

# Install all dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp apps/web/.env.example apps/web/.env.local
```

**Required Environment Variables:**
```env
# Blockchain Configuration
NEXT_PUBLIC_NETWORK_NAME="sepolia"
NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111
NEXT_PUBLIC_ALCHEMY_API_KEY="your_alchemy_api_key"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..." # Deployed contract address

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_string" # Generate with: openssl rand -base64 32

# Database
DATABASE_URL="file:./dev.db" # SQLite for development
# DATABASE_URL="postgresql://user:pass@host:5432/db" # PostgreSQL for production
```

### 3. Database Initialization
```bash
cd apps/web

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### 4. Smart Contract Setup

**Option A: Use Existing Contract (Recommended)**
- Use the pre-deployed contract address in your environment variables

**Option B: Deploy Your Own Contract**
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
# Copy the deployed contract address to your .env.local
```

### 5. Start Development
```bash
cd apps/web
npm run dev
```

**Access Points:**
- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api
- **Database Studio**: `npx prisma studio`

### 6. Verify Setup
1. **Connect Wallet**: Test wallet connection on homepage
2. **Create Account**: Register a new user account
3. **Issue Credential**: Try issuing a test credential (requires admin approval)
4. **Verify Credential**: Upload and verify the test credential

## Governance

TrustBridge implements a multi-layered governance model to ensure security, compliance, and sustainable operation.

### Governance Structure

#### 1. Smart Contract Governance
- **Contract Owner**: Has administrative privileges for issuer management
- **Approved Issuers**: Whitelisted addresses that can issue credentials
- **Immutable Logic**: Core verification logic cannot be changed
- **Upgradeable Components**: Metadata and issuer management can be updated

#### 2. Platform Governance
- **System Administrators**: Manage user accounts and platform settings
- **Issuer Approval Process**: Vetting and approval of credential issuers
- **Content Moderation**: Review and moderate credential metadata
- **Security Monitoring**: Monitor for suspicious activities

#### 3. Data Governance
- **Privacy Policies**: GDPR and privacy law compliance
- **Data Retention**: Automated cleanup of expired sessions and logs
- **Access Controls**: Role-based access to sensitive data
- **Audit Logging**: Complete audit trail for all operations

### Governance Policies

#### Issuer Approval Process
1. **Application Submission**: Institution submits issuer application
2. **Identity Verification**: Verify institutional identity and credentials
3. **Technical Review**: Assess technical capabilities and security
4. **Approval Decision**: Multi-stakeholder approval process
5. **Onboarding**: Technical integration and training
6. **Ongoing Monitoring**: Regular review of issuer activities

#### Security Policies
- **Multi-Signature Requirements**: Critical operations require multiple approvals
- **Rate Limiting**: API protection against abuse and DoS attacks
- **Input Validation**: Comprehensive validation of all user inputs
- **Regular Audits**: Periodic security audits and penetration testing

#### Compliance Framework
- **Legal Compliance**: Adherence to relevant laws and regulations
- **Industry Standards**: Following best practices for credential systems
- **Privacy Protection**: Minimal data collection and strong privacy controls
- **Transparency**: Open-source code and transparent operations

### Governance Procedures

#### Emergency Procedures
1. **Security Incidents**: Immediate response and containment procedures
2. **System Outages**: Disaster recovery and business continuity plans
3. **Data Breaches**: Incident response and notification procedures
4. **Legal Issues**: Compliance and legal response procedures

#### Change Management
1. **Code Changes**: Peer review and testing requirements
2. **Smart Contract Updates**: Multi-signature approval process
3. **Policy Updates**: Stakeholder consultation and approval
4. **System Upgrades**: Staged deployment and rollback procedures

#### Dispute Resolution
1. **User Complaints**: Customer service and escalation procedures
2. **Issuer Disputes**: Mediation and arbitration processes
3. **Technical Issues**: Bug reporting and resolution procedures
4. **Policy Violations**: Investigation and enforcement procedures

## Project Structure

```
trustbridge/
├── apps/web/                    # 🌐 Next.js Web Application
│   ├── app/                     # App Router (Next.js 14)
│   │   ├── (auth)/              # Authentication pages
│   │   ├── admin/               # Admin dashboard
│   │   ├── api/                 # Backend API endpoints
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── credentials/     # Credential CRUD operations
│   │   │   ├── users/           # User management
│   │   │   └── admin/           # Admin operations
│   │   ├── dashboard/           # User dashboard
│   │   └── verify/              # Credential verification
│   ├── components/              # React UI Components
│   │   ├── ui/                  # Base components (Button, Input, etc.)
│   │   ├── auth/                # Authentication forms
│   │   ├── credentials/         # Credential management
│   │   ├── dashboard/           # Dashboard widgets
│   │   └── admin/               # Admin interface
│   ├── lib/                     # Core Utilities
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── db.ts                # Prisma database client
│   │   ├── blockchain.ts        # Web3 and contract interactions
│   │   ├── utils.ts             # Helper functions
│   │   └── validations.ts       # Zod schemas
│   ├── prisma/                  # Database Layer
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Database migrations
│   │   └── seed.ts              # Sample data seeding
│   ├── public/                  # Static Assets
│   ├── styles/                  # CSS and styling
│   └── types/                   # TypeScript definitions
├── contracts/                   # 🔗 Smart Contracts
│   ├── contracts/               # Solidity source files
│   │   └── CredentialRegistry.sol
│   ├── scripts/                 # Deployment scripts
│   ├── test/                    # Contract test suites
│   └── hardhat.config.js        # Hardhat configuration
├── packages/                    # 📦 Shared Packages
│   └── ui/                      # Reusable UI components
├── docs/                        # 📚 Documentation
├── .github/                     # GitHub workflows
└── README.md                    # Project documentation
```

### Key Directories

- **`apps/web/`**: Main Next.js application with frontend and API
- **`contracts/`**: Ethereum smart contracts and deployment tools
- **`components/`**: Modular React components organized by feature
- **`lib/`**: Core utilities for blockchain, database, and authentication
- **`prisma/`**: Database schema, migrations, and ORM configuration
- **`app/api/`**: RESTful API endpoints for backend functionality

## Dependencies & Requirements

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0"
  }
}
```

### Web3 & Blockchain

```json
{
  "dependencies": {
    "ethers": "^6.8.0",
    "wagmi": "^2.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "viem": "^2.0.0",
    "@walletconnect/web3-provider": "^1.8.0"
  }
}
```

### UI & Styling

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-toast": "^1.1.5",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.290.0"
  }
}
```

### Development Tools

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "hardhat": "^2.17.0",
    "@nomicfoundation/hardhat-toolbox": "^3.0.0"
  }
}
```

### Smart Contract Dependencies

```json
{
  "dependencies": {
    "@openzeppelin/contracts": "^4.9.0",
    "@chainlink/contracts": "^0.6.1"
  },
  "devDependencies": {
    "@nomiclabs/hardhat-ethers": "^2.2.3",
    "@nomiclabs/hardhat-waffle": "^2.0.6",
    "chai": "^4.3.10",
    "ethereum-waffle": "^4.0.10"
  }
}
```

### System Requirements

| Requirement | Minimum Version | Recommended |
|-------------|-----------------|-------------|
| **Node.js** | 18.0.0 | 20.0.0+ |
| **npm** | 8.0.0 | 10.0.0+ |
| **Git** | 2.0.0 | Latest |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB | 5GB+ |

### Browser Support

- **Chrome/Chromium**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Network Requirements

- **Ethereum Mainnet**: For production deployments
- **Sepolia Testnet**: For development and testing
- **Local Network**: Hardhat local node for development
- **IPFS Network**: Optional for decentralized file storage

## Deployment

### Quick Deploy Options

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftrustbridge&project-name=trustbridge&repository-name=trustbridge&root-directory=apps%2Fweb)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/trustbridge&base=apps/web)

### Production Deployment Guide

#### 1. Database Setup (Required)

**Choose a PostgreSQL provider:**
- **Neon** (Recommended): [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)
- **PlanetScale**: [planetscale.com](https://planetscale.com)
- **Railway**: [railway.app](https://railway.app)

**Update Prisma schema:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

#### 2. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd apps/web
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# Add all other required env vars

# Deploy database schema
npx prisma migrate deploy
```

#### 3. Alternative Deployment Options

**Netlify:**
```bash
# Build settings
Build command: cd apps/web && npm run build
Publish directory: apps/web/.next
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Manual Server:**
```bash
# Build and start
cd apps/web
npm run build
npm start
```

### Environment Configuration

**Production Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

# Blockchain
NEXT_PUBLIC_NETWORK_NAME="mainnet"
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
NEXT_PUBLIC_ALCHEMY_API_KEY="your-mainnet-key"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

## Configuration

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|----------|
| `NEXT_PUBLIC_NETWORK_NAME` | Ethereum network | ✅ | `sepolia` / `mainnet` |
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | Network chain ID | ✅ | `11155111` / `1` |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Alchemy RPC key | ✅ | `your_alchemy_key` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect ID | ✅ | `your_wc_project_id` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Smart contract address | ✅ | `0x742d35Cc...` |
| `NEXTAUTH_URL` | Application URL | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Auth secret key | ✅ | `openssl rand -base64 32` |
| `DATABASE_URL` | Database connection | ✅ | See examples below |
| `WEB3_STORAGE_TOKEN` | IPFS storage token | ❌ | `your_web3_token` |

### Database Connection Examples

```bash
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Cloud Providers
# Neon
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb"

# Supabase
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"

# Railway
DATABASE_URL="postgresql://postgres:pass@containers-us-west-xxx.railway.app:5432/railway"
```

### Network Configuration

**Sepolia Testnet (Development):**
```env
NEXT_PUBLIC_NETWORK_NAME="sepolia"
NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111
```

**Ethereum Mainnet (Production):**
```env
NEXT_PUBLIC_NETWORK_NAME="mainnet"
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
```

## API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
All protected endpoints require authentication via NextAuth.js session cookies or JWT tokens.

### Core Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/signin` | User login | ❌ |
| `GET` | `/user/profile` | Get user profile | ✅ |
| `POST` | `/user/link-wallet` | Link wallet to account | ✅ |
| `POST` | `/credentials/issue` | Issue new credential | ✅ (Issuer) |
| `GET` | `/credentials/verify/:hash` | Verify credential | ❌ |
| `GET` | `/credentials/user` | Get user credentials | ✅ |
| `POST` | `/admin/approve-issuer` | Approve issuer | ✅ (Admin) |

### Request/Response Examples

#### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

# Response
{
  "success": true,
  "message": "User registered successfully"
}
```

#### Credential Verification
```bash
GET /api/credentials/verify/0x1234567890abcdef...

# Response
{
  "isValid": true,
  "credential": {
    "hash": "0x1234567890abcdef...",
    "issuer": "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    "recipient": "0x123...",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {
      "title": "Bachelor of Science",
      "institution": "University of Technology"
    }
  }
}
```

#### Issue Credential
```bash
POST /api/credentials/issue
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipientAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
  "documentHash": "0x1234567890abcdef...",
  "metadata": {
    "title": "Bachelor of Science",
    "institution": "University of Technology",
    "issueDate": "2024-01-15"
  }
}
```

### Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 10 requests per minute per IP
- **Credential Operations**: 50 requests per minute per user

## Contributing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/trustbridge.git
   cd trustbridge
   git checkout -b feature/your-feature-name
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd apps/web && npm install
   cd ../../contracts && npm install
   ```

3. **Setup Development Environment**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Configure your environment variables
   ```

4. **Start Development**
   ```bash
   # Terminal 1: Start web app
   cd apps/web
   npm run dev
   
   # Terminal 2: Start local blockchain (optional)
   cd contracts
   npx hardhat node
   ```

### Contribution Guidelines

#### Code Standards
- **TypeScript**: Use strict type checking
- **ESLint**: Follow the configured linting rules
- **Prettier**: Format code before committing
- **Conventional Commits**: Use semantic commit messages

#### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/description`
2. **Write Tests**: Add tests for new functionality
3. **Update Documentation**: Update README and code comments
4. **Run Quality Checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
5. **Submit PR**: Create detailed pull request with description

#### Commit Message Format
```
type(scope): description

feat(auth): add wallet connection feature
fix(api): resolve credential verification bug
docs(readme): update installation instructions
test(contracts): add issuer approval tests
```

### Development Workflow

#### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Smart contract tests
cd contracts
npx hardhat test
```

#### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
```

### Project Priorities

#### High Priority
- 🔒 Security improvements and audits
- 🚀 Performance optimizations
- 📱 Mobile responsiveness
- 🧪 Test coverage improvements

#### Medium Priority
- 🌐 Multi-language support
- 📊 Analytics and monitoring
- 🔌 Additional wallet integrations
- 📄 Advanced credential templates

#### Future Enhancements
- 📱 Mobile application
- 🔗 Cross-chain compatibility
- 🤖 AI-powered verification
- 🏢 Enterprise features
  }
}
```

### Admin Endpoints

#### POST `/api/admin/approve-issuer`
Approve a new credential issuer (admin only).

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
  "name": "University of Technology"
}
```

#### GET `/api/admin/stats`
Get system statistics (admin only).

**Response:**
```json
{
  "totalUsers": 1250,
  "totalCredentials": 3420,
  "totalIssuers": 45,
  "recentActivity": [
    {
      "type": "credential_issued",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": "Credential issued by University of Technology"
    }
  ]
}
```

## 🎯 Usage Guide

### For Credential Recipients

1. **Create Account**
   - Register with email and password
   - Link your Ethereum wallet

2. **Receive Credentials**
   - Credentials are issued directly to your wallet address
   - View all your credentials in the dashboard

3. **Share Credentials**
   - Generate QR codes for easy sharing
   - Share verification links

### For Credential Issuers

1. **Get Approved**
   - Apply for issuer status through admin
   - Provide institutional verification

2. **Issue Credentials**
   - Upload credential documents
   - Add metadata (title, description, etc.)
   - Issue to recipient's wallet address

3. **Manage Credentials**
   - Track issued credentials
   - View verification statistics

### For Verifiers

1. **Verify by Upload**
   - Upload the credential file
   - System computes hash and checks blockchain

2. **Verify by Hash**
   - Enter the document hash directly
   - Get instant verification results

3. **Verify by QR Code**
   - Scan QR code with mobile device
   - View credential details and verification status

## 🔐 Smart Contract

### CredentialRegistry.sol

The main smart contract handles:
- Credential issuance and storage
- Issuer management and approval
- Verification logic
- Event emission for transparency

**Key Functions:**

```solidity
// Issue a new credential
function issueCredential(
    address recipient,
    bytes32 documentHash,
    string memory metadataURI
) external onlyApprovedIssuer

// Verify a credential
function verifyCredential(bytes32 documentHash) 
    external view returns (bool isValid, CredentialData memory credential)

// Approve a new issuer (admin only)
function approveIssuer(address issuer) external onlyOwner
```

**Events:**
```solidity
event CredentialIssued(
    bytes32 indexed documentHash,
    address indexed issuer,
    address indexed recipient,
    uint256 timestamp
);

event IssuerApproved(address indexed issuer, uint256 timestamp);
```

## 🧪 Development

### Running Tests

**Frontend Tests**
```bash
cd apps/web
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

**Smart Contract Tests**
```bash
cd contracts
npx hardhat test
npx hardhat test --grep "CredentialRegistry"  # Specific tests
npx hardhat coverage  # Coverage report
```

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix  # Auto-fix issues

# Type checking
npm run type-check

# Formatting
npm run format
```

### Database Management

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Deploy migrations (production)
npx prisma migrate deploy
```

### Local Development Workflow

1. **Start development server**
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Start local blockchain (optional)**
   ```bash
   cd contracts
   npx hardhat node
   ```

3. **Deploy contracts locally**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Reset database
npx prisma migrate reset
npx prisma generate
```

**Wallet Connection Issues**
- Ensure MetaMask is installed and connected to the correct network
- Check that NEXT_PUBLIC_DEFAULT_CHAIN_ID matches your network
- Clear browser cache and cookies

**Smart Contract Deployment Fails**
```bash
# Check network configuration
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Ensure sufficient ETH for gas fees
# Check Alchemy API key is valid
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm install
```

### Production Issues

**Vercel Deployment Fails**
- Check environment variables are set correctly
- Ensure DATABASE_URL uses PostgreSQL (not SQLite)
- Verify build logs in Vercel dashboard

**Database Migration Issues**
```bash
# Force migration in production
npx prisma migrate deploy --force

# Check migration status
npx prisma migrate status
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Web Vitals**: Core web vitals tracking
- **Error Tracking**: Automatic error reporting

### Database Monitoring
- **Query Performance**: Monitor slow queries
- **Connection Pool**: Track database connections
- **Migration Status**: Monitor schema changes

### Blockchain Monitoring
- **Transaction Status**: Track on-chain operations
- **Gas Usage**: Monitor transaction costs
- **Event Logs**: Track smart contract events

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/trustbridge.git
   cd trustbridge
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes and test**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit and push**
   ```bash
   git commit -m 'feat: add amazing feature'
   git push origin feature/amazing-feature
   ```

5. **Create Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all checks pass before submitting PR

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

## 🛡️ Security

### Security Features

- **Client-side Processing**: Files never leave user's browser
- **Hash-only Storage**: No PII stored on blockchain
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation
- **CSRF Protection**: Built-in CSRF tokens
- **Secure Headers**: Security headers configured

### Security Best Practices

- Regular dependency updates
- Environment variable protection
- Secure database connections
- Wallet signature verification
- Admin role protection

### Reporting Security Issues

Please report security vulnerabilities to security@trustbridge.app

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@trustbridge.app
- **Documentation**: [docs.trustbridge.app](https://docs.trustbridge.app)
- **Discord**: [Join our community](https://discord.gg/trustbridge)
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/trustbridge/issues)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core credential issuance and verification
- ✅ User authentication and wallet linking
- ✅ Admin dashboard
- ✅ QR code generation
- ✅ Rate limiting and security

### Phase 2 (Q2 2024)
- [ ] Mobile application (React Native)
- [ ] Batch credential issuance
- [ ] Advanced analytics dashboard
- [ ] API v2 with GraphQL
- [ ] Enhanced search and filtering

### Phase 3 (Q3 2024)
- [ ] Multi-chain support (Polygon, BSC)
- [ ] Integration with educational institutions
- [ ] Credential templates and standards
- [ ] Advanced verification workflows
- [ ] White-label solutions

### Phase 4 (Q4 2024)
- [ ] AI-powered fraud detection
- [ ] Decentralized identity integration
- [ ] Enterprise SSO integration
- [ ] Advanced reporting and compliance
- [ ] Marketplace for credential services

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent database toolkit
- **Ethereum Foundation** - For the blockchain infrastructure
- **Vercel** - For seamless deployment platform
- **Open Source Community** - For the countless libraries and tools

---

**Built with ❤️ by the TrustBridge Team**

For more information, visit [trustbridge.app](https://trustbridge.app)

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