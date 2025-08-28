# NextAuth.js Security Configuration Guide

This guide covers secure configuration of NextAuth.js for the TrustBridge application.

## 🔐 Quick Setup

### 1. Generate Strong NEXTAUTH_SECRET

**Windows (PowerShell):**
```powershell
# Method A: Using Node.js (recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method B: Using PowerShell cryptography
$bytes = New-Object byte[] 32; (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

**macOS/Linux:**
```bash
# Method A: Using OpenSSL
openssl rand -base64 64

# Method B: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Environment Configuration

**Local Development (.env.local):**
```env
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Production (.env.production):**
```env
NEXTAUTH_SECRET=different-secret-for-production
NEXTAUTH_URL=https://your-domain.com
```

## 🚀 Deployment Platforms

### Vercel (Recommended)

1. Go to **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. Add variables for each environment:

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `NEXTAUTH_SECRET` | `prod-secret` | `preview-secret` | `dev-secret` |
| `NEXTAUTH_URL` | `https://yourdomain.com` | `https://app-branch-hash.vercel.app` | `http://localhost:3000` |

3. **Redeploy** after adding variables

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
# ... your build steps ...
EXPOSE 3000
CMD ["npm", "run", "start"]
```

```bash
# Run with environment variables
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=https://your-domain.com \
  -e NEXTAUTH_SECRET='your-production-secret' \
  -e DATABASE_URL='your-database-url' \
  your-app:latest
```

### Other Platforms

**Railway/Render/Fly.io:**
- Use their dashboard to set environment variables
- Store secrets in their secret management systems
- Never hardcode secrets in your application

## 🔒 Security Best Practices

### ✅ DO

- **Use cryptographically secure secrets** (≥32 bytes)
- **Different secrets per environment** (dev/staging/prod)
- **Store secrets in platform secret managers**
- **Rotate secrets periodically**
- **Use HTTPS in production**
- **Monitor for secret leaks in logs**
- **Keep `.env*` files in `.gitignore`**

### ❌ DON'T

- **Never commit secrets to git**
- **Don't use weak/short secrets**
- **Don't reuse secrets across environments**
- **Don't add trailing slashes to NEXTAUTH_URL**
- **Don't log secrets in application code**
- **Don't use default/placeholder secrets**

## 🔄 Secret Rotation

### Simple Rotation (Logs everyone out)

1. Generate new `NEXTAUTH_SECRET`
2. Update environment variables
3. Redeploy application
4. All users will need to sign in again

### Zero-Downtime Rotation (Advanced)

1. Switch to database sessions:
   ```js
   // auth.config.js
   export default {
     session: { strategy: 'database' },
     // ...
   }
   ```
2. Rotate during maintenance window
3. Users stay logged in

## 🧪 Testing & Verification

### Run Security Verification

```bash
# Check your current configuration
node verify-auth.js
```

### Manual Testing Checklist

- [ ] **Sign in flow works correctly**
- [ ] **Sessions persist across page refreshes**
- [ ] **Protected routes redirect properly**
- [ ] **Sign out clears session**
- [ ] **No JWE decryption errors in logs**
- [ ] **Cookies are set for correct domain**

### Browser DevTools Check

1. Open **DevTools** → **Application** → **Cookies**
2. Verify NextAuth cookies exist:
   - `next-auth.session-token` (production)
   - `__Secure-next-auth.session-token` (HTTPS)
   - `next-auth.csrf-token`

## 🚨 Common Issues & Solutions

### JWEDecryptionFailed Error

**Cause:** Wrong or missing `NEXTAUTH_SECRET`

**Solution:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
NEXTAUTH_SECRET=your-new-secret

# Restart development server
npm run dev
```

### Callback URL Mismatch

**Cause:** `NEXTAUTH_URL` doesn't match actual domain

**Solution:**
```env
# Local
NEXTAUTH_URL=http://localhost:3000

# Production (no trailing slash!)
NEXTAUTH_URL=https://your-domain.com
```

### Session Not Persisting

**Causes & Solutions:**
- **Wrong domain:** Check `NEXTAUTH_URL` matches your domain
- **HTTPS issues:** Ensure secure cookies in production
- **Secret rotation:** Users need to sign in again after secret change

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Security Considerations](https://next-auth.js.org/security)
- [Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Deployment Guide](https://next-auth.js.org/deployment)

## 🛠 Utilities

- `verify-auth.js` - Security configuration checker
- `.env.production.template` - Production environment template
- This guide - Complete security reference

---

**Remember:** Security is not a one-time setup. Regularly review and update your configuration, rotate secrets, and monitor for security issues.