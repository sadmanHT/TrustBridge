# CI/CD Setup Guide

This guide explains how to set up automatic deployment to Netlify and Vercel using GitHub Actions.

## Overview

The CI/CD pipeline automatically:
- Builds and tests the application on every push to `main`
- Caches `node_modules` for faster builds
- Skips deployment if only documentation files change
- Deploys to both Netlify and Vercel in parallel
- Provides deployment status notifications

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings:

### Netlify Secrets

1. **NETLIFY_AUTH_TOKEN**
   - Go to [Netlify User Settings > Applications](https://app.netlify.com/user/applications)
   - Click "New access token"
   - Copy the generated token

2. **NETLIFY_SITE_ID**
   - Go to your Netlify site dashboard
   - Navigate to Site Settings > General
   - Copy the "Site ID" from the Site information section

### Vercel Secrets

1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Give it a name and set appropriate scope
   - Copy the generated token

2. **VERCEL_ORG_ID**
   - Run `vercel link` in your project directory
   - Check the `.vercel/project.json` file for `orgId`
   - Or find it in your Vercel dashboard URL

3. **VERCEL_PROJECT_ID**
   - Run `vercel link` in your project directory
   - Check the `.vercel/project.json` file for `projectId`
   - Or find it in your Vercel project settings

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

## Workflow Features

### Smart Deployment
- Only deploys when non-documentation files change
- Documentation-only changes (*.md files, docs/ folder) skip deployment
- Pull requests always trigger builds for testing

### Build Optimization
- Caches `node_modules` based on `package-lock.json` hash
- Uses Node.js 18 with npm for consistency
- Parallel deployment to both platforms

### Error Handling
- Continues deployment even if one platform fails
- Provides clear status notifications
- Uploads build artifacts for debugging

## Manual Deployment Commands

If you need to deploy manually:

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=.next
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Environment Variables

Make sure to configure the following environment variables in both Netlify and Vercel:

### Required Variables
- `NEXTAUTH_SECRET`: Random string for NextAuth.js
- `NEXTAUTH_URL`: Your production URL
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Smart contract address
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: Alchemy API key

### Optional Variables
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID
- `NEXT_PUBLIC_NETWORK_NAME`: Blockchain network (default: sepolia)
- `NEXT_PUBLIC_DEFAULT_CHAIN_ID`: Chain ID (default: 11155111)
- `NEXT_PUBLIC_RPC_URL`: Custom RPC URL
- `PINATA_API_KEY`: Pinata API key for IPFS
- `PINATA_SECRET_API_KEY`: Pinata secret key
- `PINATA_JWT`: Pinata JWT token

## Troubleshooting

### Build Failures
- Check that all required secrets are set
- Verify environment variables are configured
- Review build logs in GitHub Actions

### Deployment Failures
- Ensure CLI tokens have proper permissions
- Check that site/project IDs are correct
- Verify build output directory is correct

### Cache Issues
- Clear GitHub Actions cache if needed
- Update `package-lock.json` to invalidate cache

## Monitoring

- GitHub Actions provides detailed logs for each step
- Netlify and Vercel dashboards show deployment status
- Build artifacts are retained for 1 day for debugging

## Security Notes

- Never commit tokens or secrets to the repository
- Use GitHub's encrypted secrets for sensitive data
- Regularly rotate access tokens
- Review deployment logs for any exposed information