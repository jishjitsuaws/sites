/** @type {import('next').NextConfig} */

// Parse allowed origins from environment variable
const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
console.log('[Next.js Config] Allowed origins for CSP:', ALLOWED_ORIGINS);

// Extract hostnames for image domains configuration
const IMAGE_HOSTNAMES = ALLOWED_ORIGINS
  .map(origin => {
    try {
      const url = new URL(origin);
      return { hostname: url.hostname, protocol: url.protocol.replace(':', ''), port: url.port || (url.protocol === 'https:' ? '443' : '80') };
    } catch (e) {
      return null;
    }
  })
  .filter(Boolean);

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
              `img-src 'self' data: blob: https: ${ALLOWED_ORIGINS.join(' ')}`,
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' ${ALLOWED_ORIGINS.join(' ')}`,
              `media-src 'self' ${ALLOWED_ORIGINS.join(' ')}`,
              "frame-src 'self' https://www.youtube.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              `form-action 'self' ${ALLOWED_ORIGINS.join(' ')}`,
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
    domains: ['localhost', ...IMAGE_HOSTNAMES.map(h => h.hostname)],
    remotePatterns: IMAGE_HOSTNAMES.map(host => ({
      protocol: host.protocol,
      hostname: host.hostname,
      port: host.port,
      pathname: '/uploads/**',
    })),
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
