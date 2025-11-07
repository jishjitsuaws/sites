/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Security headers
  async headers() {
    // Only enable strict security in production
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Only enable HSTS in production (it forces HTTPS)
          ...(isDev ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }]),
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: http://localhost:5000 http://10.244.0.147:5000 https://sites.isea.in/ https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' http://localhost:5000 http://10.244.0.147:5000 https://sites.isea.in/",
              "media-src 'self' http://localhost:5000 http://10.244.0.147:5000 https://sites.isea.in/",
              "frame-src 'self' https://www.youtube.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' http://localhost:5000 http://10.244.0.147:5000 https://sites.isea.in/",
              "frame-ancestors 'self'",
              // Remove upgrade-insecure-requests in development
              ...(isDev ? [] : ["upgrade-insecure-requests"])
            ].filter(Boolean).join('; ')
          }
        ],
      },
    ];
  },
  
  images: {
    domains: ['localhost', '10.244.0.147', 'https://sites.isea.in/'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sites.isea.in',
        port: '443',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '10.244.0.147',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
