# Admin Scripts

This directory contains administrative scripts for managing the TrustBridge contract.

## Approve Issuer Script

The `admin-approve-issuer.js` script allows contract owners to approve new issuers for local testing.

### Prerequisites

1. **Environment Variables**: Create a `.env.local` file in the web app root with:
   ```bash
   # Required for all operations
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
   
   # Required for admin operations
   ADMIN_PRIVATE_KEY=0x...
   ```

2. **Admin Private Key**: The `ADMIN_PRIVATE_KEY` must be the private key of the contract owner.
   - ⚠️ **Security Warning**: Never commit private keys to version control
   - Use a test wallet with minimal funds for local development
   - Consider using a `.env.local` file which is gitignored

### Usage

#### Method 1: Using npm script (Recommended)
```bash
npm run admin:approve-issuer <wallet_address>
```

#### Method 2: Direct execution
```bash
node scripts/admin-approve-issuer.js <wallet_address>
```

### Examples

```bash
# Approve a specific wallet address
npm run admin:approve-issuer 0x1234567890123456789012345678901234567890

# The script will:
# 1. Validate the address format
# 2. Check if you're the contract owner
# 3. Check if the address is already approved
# 4. Submit the approval transaction
# 5. Wait for confirmation
```

### Output Example

```
🔧 Admin Issuer Approval Script
================================
Contract: 0xABC123...
Address to approve: 0x1234567890123456789012345678901234567890

📋 Admin account: 0xDEF456...
🔍 Verifying admin permissions...
✅ Admin permissions verified
🔍 Checking current approval status...
📝 Address 0x1234567890123456789012345678901234567890 is not yet approved
🚀 Submitting approval transaction...
📋 Transaction submitted: 0xTXHASH...
⏳ Waiting for confirmation...
✅ Transaction confirmed!
🎉 Successfully approved 0x1234567890123456789012345678901234567890 as an issuer
📋 Block: 12345678
⛽ Gas used: 45000
```

### Error Handling

The script handles common errors:

- **Invalid address format**: Validates Ethereum address format
- **Missing environment variables**: Checks for required configuration
- **Unauthorized account**: Verifies admin is the contract owner
- **Already approved**: Skips if address is already an approved issuer
- **Transaction failures**: Reports specific contract errors

### Security Best Practices

1. **Private Key Management**:
   - Use a dedicated test wallet for admin operations
   - Never share or commit private keys
   - Consider using hardware wallets for production

2. **Network Safety**:
   - Always test on Sepolia testnet first
   - Verify contract addresses before running
   - Double-check wallet addresses before approval

3. **Access Control**:
   - Only run admin scripts from secure environments
   - Regularly rotate admin keys
   - Monitor approved issuer list

### Troubleshooting

#### Common Issues

1. **"Missing ADMIN_PRIVATE_KEY"**:
   - Add the contract owner's private key to `.env.local`
   - Ensure the key starts with `0x`

2. **"Admin account is not the contract owner"**:
   - Verify you're using the correct private key
   - Check the contract deployment records

3. **"Invalid address format"**:
   - Ensure the address is a valid Ethereum address
   - Include the `0x` prefix

4. **"RPC request timeout"**:
   - Check your internet connection
   - Verify Alchemy API key is valid
   - Try again after a few moments

### Development Notes

- The script uses the Sepolia testnet by default
- Transactions require ETH for gas fees
- Approval is permanent (use `revokeIssuer` to remove)
- The script includes a 10-second timeout for RPC calls