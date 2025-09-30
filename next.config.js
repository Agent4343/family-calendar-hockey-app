/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint completely during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize for production
  compress: true,
  
  // PWA and mobile optimization
  assetPrefix: '', 
  
  // Optimize images
  images: {
    domains: [
      'placehold.co',
      'storage.googleapis.com',
      'raw.githubusercontent.com'
    ],
  },
  
  // Optimize for mobile and PWA
  poweredByHeader: false,
  
  // Optimize bundle
  experimental: {
    optimizeFonts: {
      googleFonts: ['Inter']
    }
  },
  
  // Redirects for SPA
  async rewrites() {
    return [];
  },
  
  // Headers for security and PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          { 
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
