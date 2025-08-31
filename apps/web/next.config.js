// const { i18n } = require('./next-i18next.config'); // Disabled for static export

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to prevent WalletConnect double initialization
  swcMinify: true,
  // output: 'export', // Disabled to support server-side features like authentication
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Suppress environment validation warnings in development
  env: {
    SKIP_ENV_VALIDATION: process.env.NODE_ENV === 'development' ? 'true' : 'false'
  },
  
  // Existing configuration
  experimental: {
    // appDir: true, // Using app directory structure
  },
  
  // Webpack configuration for handling locale files
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;