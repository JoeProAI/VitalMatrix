const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Focus only on NutriLens scanner for deployment
  webpack: (config, { isServer }) => {
    // Disable VitalTrailMap imports using absolute path instead of require.resolve
    config.resolve.alias['src/components/VitalTrailMap'] = path.join(__dirname, 'src/components/placeholder.js');
    return config;
  },
  // Disable specific page routes not related to NutriLens
  async redirects() {
    return [
      {
        source: '/vitaltrail',
        destination: '/',
        permanent: false,
      },
      {
        source: '/community',
        destination: '/',
        permanent: false,
      }
    ]
  },
  // Transpile specific modules that need it
  transpilePackages: ['@zxing/library'],
}

module.exports = nextConfig
