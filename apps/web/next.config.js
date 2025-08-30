// const { i18n } = require('./next-i18next.config'); // Disabled for static export

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
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