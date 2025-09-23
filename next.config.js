// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the invalid allowedDevOrigins option
  experimental: {
    // Add valid experimental options if needed
    // serverComponentsExternalPackages: [],
    // appDir: true, // This is default in Next.js 13+
  },
  
  // If you need to allow external hosts for images
  images: {
    domains: ['192.168.31.210'], // Add your LAN IP if needed for images
  },
  
  // If you need custom headers for CORS or LAN access
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Be more restrictive in production
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
  
  // Enable standalone output if you plan to deploy
  // output: 'standalone',
  
  // Webpack configuration if needed
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    return config;
  },
};

module.exports = nextConfig;