/**
 * Environment Variable Validation and Configuration
 * 
 * This module provides centralized environment variable validation with graceful failure handling.
 * It ensures all required environment variables are present and properly formatted.
 */

interface EnvConfig {
  // Authentication
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  
  // Database
  DATABASE_URL: string;
  
  // Blockchain & Web3
  NEXT_PUBLIC_CONTRACT_ADDRESS: string;
  NEXT_PUBLIC_ALCHEMY_API_KEY: string;
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: string;
  NEXT_PUBLIC_NETWORK_NAME: string;
  NEXT_PUBLIC_RPC_URL?: string;
  
  // IPFS (Optional)
  PINATA_API_KEY?: string;
  PINATA_SECRET_API_KEY?: string;
  PINATA_JWT?: string;
  NEXT_PUBLIC_PINATA_GATEWAY_URL?: string;
  NEXT_PUBLIC_IPFS_GATEWAY?: string;
  
  // Application Settings (Optional)
  NEXT_PUBLIC_APP_NAME?: string;
  NEXT_PUBLIC_APP_DESCRIPTION?: string;
  NEXT_PUBLIC_ENABLE_TESTNETS?: string;
  NEXT_PUBLIC_DEBUG_MODE?: string;
}

/**
 * Required environment variables that must be present
 */
const REQUIRED_ENV_VARS = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'NEXT_PUBLIC_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_ALCHEMY_API_KEY',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
] as const;

/**
 * Optional environment variables with default values
 */
const DEFAULT_VALUES = {
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: '11155111', // Sepolia
  NEXT_PUBLIC_NETWORK_NAME: 'sepolia',
  NEXT_PUBLIC_RPC_URL: 'https://polygon-mainnet.infura.io/v3/your-infura-key',
  NEXT_PUBLIC_APP_NAME: 'TrustBridge',
  NEXT_PUBLIC_APP_DESCRIPTION: 'Blockchain Document Verification',
  NEXT_PUBLIC_IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
  NEXT_PUBLIC_ENABLE_TESTNETS: 'true',
  NEXT_PUBLIC_DEBUG_MODE: 'false',
} as const;



/**
 * Validation rules for environment variables
 */
const VALIDATION_RULES = {
  NEXTAUTH_SECRET: (value: string) => {
    if (value.length < 32) {
      return 'NEXTAUTH_SECRET must be at least 32 characters long for security';
    }
    if (value === 'your-nextauth-secret-key-here-replace-with-random-string') {
      return 'NEXTAUTH_SECRET must be replaced with a secure random string';
    }
    return null;
  },
  NEXTAUTH_URL: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'NEXTAUTH_URL must be a valid URL';
    }
  },
  NEXT_PUBLIC_CONTRACT_ADDRESS: (value: string) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      return 'NEXT_PUBLIC_CONTRACT_ADDRESS must be a valid Ethereum address';
    }
    if (value === '0x1234567890123456789012345678901234567890') {
      return 'NEXT_PUBLIC_CONTRACT_ADDRESS must be replaced with actual contract address';
    }
    return null;
  },
  NEXT_PUBLIC_ALCHEMY_API_KEY: (value: string) => {
    if (value === 'your_alchemy_api_key_here') {
      return 'NEXT_PUBLIC_ALCHEMY_API_KEY must be replaced with actual API key';
    }
    if (value.length < 10) {
      return 'NEXT_PUBLIC_ALCHEMY_API_KEY appears to be invalid';
    }
    return null;
  },
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: (value: string) => {
    if (value === 'your_walletconnect_project_id_here') {
      return 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID must be replaced with actual project ID';
    }
    if (value.length < 10) {
      return 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID appears to be invalid';
    }
    return null;
  },
};

/**
 * Environment validation error class
 */
export class EnvValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates a single environment variable
 */
function validateEnvVar(key: string, value: string | undefined): string | null {
  if (!value) {
    return `${key} is required but not set`;
  }
  
  const validator = VALIDATION_RULES[key as keyof typeof VALIDATION_RULES];
  if (validator) {
    return validator(value);
  }
  
  return null;
}

/**
 * Validates all environment variables and returns errors
 */
function validateEnvironment(): string[] {
  const errors: string[] = [];
  
  // Check required variables
  for (const key of REQUIRED_ENV_VARS) {
    const error = validateEnvVar(key, process.env[key]);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
}

/**
 * Auto-detects NEXTAUTH_URL based on deployment platform
 */
function getAutoDetectedNextAuthUrl(): string {
  // Auto-detect deployment platform and construct URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NETLIFY_URL) {
    return process.env.NETLIFY_URL;
  }
  
  // Check for custom domain on Vercel
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  
  // Check for Netlify site URL
  if (process.env.URL) {
    return process.env.URL;
  }
  
  // Check for deploy context on Netlify
  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Production-specific defaults
 */
const PRODUCTION_DEFAULTS = {
  NODE_ENV: 'production',
  NEXTAUTH_URL: getAutoDetectedNextAuthUrl(),
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'production-secret-required',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://production:production@localhost:5432/trustbridge_prod',
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-mainnet.infura.io/v3/your-infura-key',
  PINATA_API_KEY: process.env.PINATA_API_KEY || '',
  PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY || '',
  PINATA_JWT: process.env.PINATA_JWT || '',
  NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud',
  NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
} as const;

/**
 * Gets environment variable with fallback to default value
 */
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (value) return value;
  
  // Special handling for NEXTAUTH_URL auto-detection
  if (key === 'NEXTAUTH_URL') {
    return getAutoDetectedNextAuthUrl();
  }
  
  // Use production defaults in production environment
  if (process.env.NODE_ENV === 'production') {
    const prodDefault = PRODUCTION_DEFAULTS[key as keyof typeof PRODUCTION_DEFAULTS];
    if (prodDefault) return prodDefault;
  }
  
  const defaultValue = DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES];
  if (defaultValue) return defaultValue;
  
  throw new Error(`Environment variable ${key} is not set and has no default value`);
}

/**
 * Validates and loads environment configuration
 * 
 * @param options Configuration options
 * @returns Validated environment configuration
 * @throws EnvValidationError if validation fails
 */
export function loadEnvConfig(options: {
  /** Whether to throw on validation errors (default: true) */
  throwOnError?: boolean;
  /** Whether to log validation results (default: true in development) */
  logResults?: boolean;
} = {}): EnvConfig {
  const { 
    throwOnError = true, 
    logResults = process.env.NODE_ENV === 'development' 
  } = options;
  
  // Skip validation during build if SKIP_ENV_VALIDATION is set or in development
  const skipValidation = process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NODE_ENV === 'development';
  
  if (skipValidation) {
    console.log('⚠️  Skipping environment validation during build');
    // Return safe config with fallbacks for build
    return {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build-time-fallback',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || getAutoDetectedNextAuthUrl(),
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build',
      NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'build-time-fallback',
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'build-time-fallback',
      NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '11155111',
      NEXT_PUBLIC_NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia',
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || '',
      PINATA_API_KEY: process.env.PINATA_API_KEY || 'build-time-fallback',
       PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY || 'build-time-fallback',
       PINATA_JWT: process.env.PINATA_JWT || 'build-time-fallback',
       NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/',
      NEXT_PUBLIC_IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'TrustBridge',
      NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Blockchain Document Verification',
      NEXT_PUBLIC_ENABLE_TESTNETS: process.env.NEXT_PUBLIC_ENABLE_TESTNETS || 'true',
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE || 'false',
    };
  }
  
  const errors = validateEnvironment();
  
  if (logResults) {
    if (errors.length === 0) {
      console.info('✅ Environment validation passed');
    } else {
      console.error('❌ Environment validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
    }
  }
  
  if (errors.length > 0 && throwOnError) {
    throw new EnvValidationError(errors);
  }
  
  // Return configuration object
  return {
    // Required variables
    NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET'),
    NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL'),
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    NEXT_PUBLIC_CONTRACT_ADDRESS: getEnvVar('NEXT_PUBLIC_CONTRACT_ADDRESS'),
    NEXT_PUBLIC_ALCHEMY_API_KEY: getEnvVar('NEXT_PUBLIC_ALCHEMY_API_KEY'),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: getEnvVar('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'),
    NEXT_PUBLIC_DEFAULT_CHAIN_ID: getEnvVar('NEXT_PUBLIC_DEFAULT_CHAIN_ID'),
    NEXT_PUBLIC_NETWORK_NAME: getEnvVar('NEXT_PUBLIC_NETWORK_NAME'),
    
    // Optional variables
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY,
    PINATA_JWT: process.env.PINATA_JWT,
    NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || getEnvVar('NEXT_PUBLIC_RPC_URL'),
    NEXT_PUBLIC_IPFS_GATEWAY: getEnvVar('NEXT_PUBLIC_IPFS_GATEWAY'),
    NEXT_PUBLIC_APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME'),
    NEXT_PUBLIC_APP_DESCRIPTION: getEnvVar('NEXT_PUBLIC_APP_DESCRIPTION'),
    NEXT_PUBLIC_ENABLE_TESTNETS: getEnvVar('NEXT_PUBLIC_ENABLE_TESTNETS'),
    NEXT_PUBLIC_DEBUG_MODE: getEnvVar('NEXT_PUBLIC_DEBUG_MODE'),
  };
}

/**
 * Validates environment variables without throwing
 * Useful for health checks and diagnostics
 */
export function checkEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors = validateEnvironment();
  const warnings: string[] = [];
  
  // Check for common warnings
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      warnings.push('NEXTAUTH_URL should not use localhost in production');
    }
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      warnings.push('Debug mode should be disabled in production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Pre-validated environment configuration
 * This will be loaded once and cached
 */
let envConfig: EnvConfig | null = null;

/**
 * Gets the validated environment configuration
 * Loads and caches on first access
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = loadEnvConfig();
  }
  return envConfig;
}

/**
 * Get environment configuration with build-time fallbacks
 * Used for serverless compatibility during build
 */
export function getEnvConfigSafe(): EnvConfig {
  const isBuildTime = process.env.NODE_ENV === 'production' || process.env.SKIP_ENV_VALIDATION === 'true';
  
  if (isBuildTime) {
    // Return safe defaults during build
    return {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build-time-fallback',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build',
      NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'build-time-fallback',
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'build-time-fallback',
      NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '11155111',
      NEXT_PUBLIC_NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia',
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || '',
      PINATA_API_KEY: process.env.PINATA_API_KEY || 'build-time-fallback',
      PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY || 'build-time-fallback',
      PINATA_JWT: process.env.PINATA_JWT || 'build-time-fallback',
      NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/',
      NEXT_PUBLIC_IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'TrustBridge',
      NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Blockchain Document Verification',
      NEXT_PUBLIC_ENABLE_TESTNETS: process.env.NEXT_PUBLIC_ENABLE_TESTNETS || 'true',
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE || 'false',
    };
  }
  
  return getEnvConfig();
}

/**
 * Resets the cached environment configuration
 * Useful for testing or when environment changes
 */
export function resetEnvConfig(): void {
  envConfig = null;
}

// Export types
export type { EnvConfig };