#!/usr/bin/env node
/**
 * NextAuth.js Security Verification Script
 * 
 * This script demonstrates proper NEXTAUTH_SECRET generation and verification
 * Run with: node verify-auth.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 NextAuth.js Security Verification\n');

// 1. Generate strong NEXTAUTH_SECRET examples
console.log('1. Strong NEXTAUTH_SECRET Generation:');
console.log('   Method A (hex): ', crypto.randomBytes(32).toString('hex'));
console.log('   Method B (base64):', crypto.randomBytes(32).toString('base64'));
console.log('   Method C (base64url):', crypto.randomBytes(32).toString('base64url'));
console.log();

// 2. Check current .env.local configuration
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('2. Current Environment Configuration:');
  
  // Check NEXTAUTH_SECRET
  const secretMatch = envContent.match(/NEXTAUTH_SECRET=(.+)/);
  if (secretMatch) {
    const secret = secretMatch[1];
    console.log('   ✅ NEXTAUTH_SECRET found');
    console.log('   📏 Length:', secret.length, 'characters');
    
    if (secret.length >= 32) {
      console.log('   ✅ Secret length is adequate (≥32 chars)');
    } else {
      console.log('   ⚠️  Secret might be too short (<32 chars)');
    }
    
    if (secret.includes('your-nextauth-secret') || secret.includes('change-this')) {
      console.log('   ❌ Using default/placeholder secret - SECURITY RISK!');
    } else {
      console.log('   ✅ Using custom secret');
    }
  } else {
    console.log('   ❌ NEXTAUTH_SECRET not found');
  }
  
  // Check NEXTAUTH_URL
  const urlMatch = envContent.match(/NEXTAUTH_URL=(.+)/);
  if (urlMatch) {
    const url = urlMatch[1];
    console.log('   ✅ NEXTAUTH_URL found:', url);
    
    if (url.endsWith('/')) {
      console.log('   ⚠️  URL has trailing slash - this may cause issues');
    } else {
      console.log('   ✅ URL format is correct (no trailing slash)');
    }
  } else {
    console.log('   ❌ NEXTAUTH_URL not found');
  }
  
  console.log();
} else {
  console.log('2. ❌ .env.local file not found\n');
}

// 3. Security checklist
console.log('3. Security Checklist:');
console.log('   📋 Environment Variables:');
console.log('      □ NEXTAUTH_SECRET is cryptographically secure (≥32 bytes)');
console.log('      □ NEXTAUTH_URL matches your domain (no trailing slash)');
console.log('      □ Secrets are not committed to git (.gitignore)');
console.log('   📋 Deployment:');
console.log('      □ Set environment variables in production platform');
console.log('      □ Use different secrets for different environments');
console.log('      □ Rotate secrets periodically');
console.log();

// 4. Environment-specific URLs
console.log('4. Environment-Specific NEXTAUTH_URL Examples:');
console.log('   Local:      http://localhost:3000');
console.log('   Vercel:     https://your-app-git-branch-hash.vercel.app');
console.log('   Production: https://your-domain.com');
console.log('   Docker:     https://app.your-domain.com');
console.log();

console.log('✨ Verification complete! Check the items above for security compliance.');
console.log('🔗 For more info: https://next-auth.js.org/configuration/options#nextauth_secret');