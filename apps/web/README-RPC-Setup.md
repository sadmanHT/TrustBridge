# RPC Configuration Guide

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the web app root directory with the following variables:

```bash
# Alchemy API Key for Ethereum RPC access
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# WalletConnect Project ID for wallet connections
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Getting API Keys

1. **Alchemy API Key**:
   - Visit [Alchemy Dashboard](https://dashboard.alchemy.com/)
   - Create a new app for Ethereum Sepolia testnet
   - Copy the API key from your app dashboard

2. **WalletConnect Project ID**:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID from your project settings

### Development vs Production

**Development (.env.local)**:
```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=your_dev_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_dev_walletconnect_id
```

**Production (Vercel/Netlify)**:
- Set the same environment variables in your deployment platform's environment settings
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access

## Using /api/rpc Endpoint

### Purpose
The `/api/rpc` endpoint provides a proxy for Ethereum RPC calls with built-in error handling and environment validation.

### Usage Examples

**Basic RPC Call**:
```javascript
const response = await fetch('/api/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'eth_chainId',
    params: []
  })
})

const result = await response.json()
```

**Error Handling**:
```javascript
try {
  const response = await fetch('/api/rpc')
  if (!response.ok) {
    throw new Error(`RPC Error: ${response.status}`)
  }
  const data = await response.json()
} catch (error) {
  console.error('Network unreachable:', error)
  // Show user-friendly error message
}
```

### Response Format

**Success Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xaa36a7"
}
```

**Error Response**:
```json
{
  "error": "Missing ALCHEMY_API_KEY environment variable"
}
```

### Environment Validation

The RPC endpoint automatically:
- Validates required environment variables are present
- Returns descriptive error messages for missing configuration
- Handles network timeouts and connection failures
- Provides fallback error responses for better UX

### Integration with viem/wagmi

The RPC configuration is automatically used by:
- `src/lib/viem.ts` - Public client configuration
- `src/lib/wagmi.ts` - Wagmi provider setup
- `src/lib/chainHealth.ts` - Network health checks

### Troubleshooting

**Common Issues**:
1. **"Missing API key" errors**: Verify `.env.local` file exists and contains correct variables
2. **Network timeouts**: Check Alchemy API key validity and rate limits
3. **Chain ID mismatches**: Ensure using Sepolia testnet (chain ID: 11155111)

**Debug Steps**:
1. Check browser console for environment variable logs
2. Verify API keys in Alchemy/WalletConnect dashboards
3. Test RPC endpoint directly: `curl http://localhost:3000/api/rpc`
4. Review network tab for failed requests

### Security Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the client
- Never commit `.env.local` files to version control
- Use different API keys for development and production
- Monitor API usage in Alchemy dashboard to prevent rate limiting