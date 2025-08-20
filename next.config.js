/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['react-icons', 'swiper'],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression and optimization
  compress: true,
  
  // Webpack configuration to handle path issues
  webpack: (config, { dev, isServer }) => {
    // Handle path issues with special characters
    if (process.platform === 'win32') {
      // Use relative paths for Windows to avoid special character issues
      config.context = undefined;
      config.output.path = undefined;
      
      // Set cache directory to avoid path issues
      if (config.cache) {
        config.cache.cacheDirectory = undefined;
      }
    }
    
    // Bundle analyzer (optional - uncomment to analyze bundle)
    // if (!dev && !isServer) {
    //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    //   config.plugins.push(new BundleAnalyzerPlugin());
    // }
    
    return config;
  },
  
  // Output configuration to avoid path issues
  distDir: '.next',
  
  // Security headers
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // PWA support (optional)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

export default nextConfig;
