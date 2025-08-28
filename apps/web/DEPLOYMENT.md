# TrustBridge Deployment Guide

This guide covers deploying TrustBridge to various platforms with proper environment variable configuration.

## Environment Variables Overview

### Required Variables
These variables **must** be set for the application to function:

- `NEXTAUTH_SECRET` - JWT signing secret (min 32 characters)
- `NEXTAUTH_URL` - Your deployed application URL
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key for blockchain connectivity
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

### Optional Variables
These have sensible defaults but can be customized:

- `NEXT_PUBLIC_DEFAULT_CHAIN_ID` - Default: `11155111` (Sepolia)
- `NEXT_PUBLIC_NETWORK_NAME` - Default: `sepolia`
- `NEXT_PUBLIC_APP_NAME` - Default: `TrustBridge`
- `NEXT_PUBLIC_APP_DESCRIPTION` - Default: `Blockchain Document Verification`
- `NEXT_PUBLIC_IPFS_GATEWAY` - Default: `https://ipfs.io/ipfs/`

## Platform-Specific Deployment

### Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add each variable individually (no quotes needed)
   - Set `NEXTAUTH_URL` to your Netlify domain: `https://your-site.netlify.app`

3. **Required Netlify Configuration**
   The `netlify.toml` file is already configured with:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Branch Deploys**
   - Use branch deploys for staging
   - Set different `NEXTAUTH_URL` for each environment

### Vercel

1. **Project Settings**
   - Vercel automatically detects Next.js projects
   - Build command: `npm run build`
   - Output directory: `.next`

2. **Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development
   - Set `NEXTAUTH_URL` to your Vercel domain: `https://your-project.vercel.app`

3. **Required Vercel Configuration**
   The `vercel.json` file is configured with:
   ```json
   {
     "builds": [
       {
         "src": "apps/web/next.config.js",
         "use": "@vercel/next"
       }
     ]
   }
   ```

4. **Preview Deployments**
   - Each PR gets a preview deployment
   - Use different environment variables for preview vs production

### Docker

1. **Dockerfile** (create if needed):
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

2. **Environment Variables**
   - Use Docker Compose or container orchestration
   - Mount environment file or use container environment
   - Example docker-compose.yml:
   ```yaml
   version: '3.8'
   services:
     trustbridge:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         - DATABASE_URL=${DATABASE_URL}
         # ... other variables
   ```

### Railway

1. **Deployment**
   - Connect your GitHub repository
   - Railway auto-detects Next.js

2. **Environment Variables**
   - Go to Variables tab in Railway dashboard
   - Add all required variables
   - Set `NEXTAUTH_URL` to your Railway domain

### Render

1. **Web Service Settings**
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

2. **Environment Variables**
   - Add in Render dashboard under Environment
   - Set `NEXTAUTH_URL` to your Render domain

## Environment Variable Validation

### Build-Time Validation
The application validates environment variables during build:

```bash
npm run build
```

This will:
- Check all required variables are present
- Validate format (URLs, addresses, etc.)
- Show helpful error messages for missing/invalid variables

### Runtime Health Check
After deployment, check the health endpoint:

```bash
curl https://your-domain.com/api/health
```

Response includes:
- Environment validation status
- Error details (in development)
- Service health indicators

## Security Best Practices

### Environment Variables
1. **Never commit secrets** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** (especially `NEXTAUTH_SECRET`)
4. **Use platform secret management** when available
5. **Validate all inputs** before deployment

### NEXTAUTH_SECRET
- Generate with: `openssl rand -base64 32`
- Must be at least 32 characters
- Should be unique per environment
- Store securely in your deployment platform

### Database Security
- Use connection pooling in production
- Enable SSL/TLS for database connections
- Use read replicas for better performance
- Regular backups and monitoring

## Troubleshooting

### Common Issues

1. **"NEXTAUTH_SECRET is required"**
   - Ensure variable is set in deployment platform
   - Check it's at least 32 characters long

2. **"Invalid contract address"**
   - Verify contract is deployed to correct network
   - Check address format (0x followed by 40 hex characters)

3. **Wallet connection fails**
   - Verify WalletConnect Project ID is correct
   - Check domain is added to WalletConnect allowed origins

4. **Build fails with environment errors**
   - Run `npm run build` locally first
   - Check all required variables are set
   - Verify variable formats match validation rules

### Debug Mode
Enable debug logging in development:
```
NEXT_PUBLIC_DEBUG_MODE=true
```

### Health Check
Monitor application health:
- `/api/health` - Environment and service status
- Check logs for validation errors
- Monitor blockchain connectivity

## Production Checklist

- [ ] All required environment variables set
- [ ] `NEXTAUTH_SECRET` is secure and unique
- [ ] `NEXTAUTH_URL` matches deployed domain
- [ ] Database connection works
- [ ] Contract address is correct for target network
- [ ] WalletConnect domain is whitelisted
- [ ] Health check endpoint returns 200
- [ ] Build completes without environment errors
- [ ] SSL/HTTPS is enabled
- [ ] Error monitoring is configured
- [ ] Backup strategy is in place

## Support

For deployment issues:
1. Check the health endpoint: `/api/health`
2. Review build logs for environment validation errors
3. Verify all required variables are set correctly
4. Test locally with production environment variables