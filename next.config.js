/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic Next.js configuration
  reactStrictMode: true,
  
  // Environment variables (if needed)
  env: {
    // Add any custom environment variables here if needed
  },
  
  // Image domains (if you need to load images from external sources)
  images: {
    domains: ['192.168.31.210'], // Add your LAN IP if needed for images
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.31.210',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  
  // CORS headers for LAN access (if needed)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://192.168.31.210:3000', // More secure than '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Turbopack configuration (replaces webpack)
  turbopack: {
    // Add any Turbopack-specific configuration here if needed
    rules: {
      // Example: If you need SVG support
      // '*.svg': {
      //   loaders: ['@svgr/webpack'],
      //   as: '*.js',
      // },
    },
    resolveAlias: {
      // Example: Add aliases if needed
      // '@': './src',
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  
  // Experimental features (if needed)
  experimental: {
    // Add experimental features here if needed
    // optimizeCss: true,
  },
};

module.exports = nextConfig;
