import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dcblackpride.org',
      },
      {
        protocol: 'https',
        hostname: 'img.evbuc.com',
      },
      {
        protocol: 'https',
        hostname: 'dallassouthernpride.com',
      },
      {
        protocol: 'https',
        hostname: 'pridechicago.org',
      },
      {
        protocol: 'https',
        hostname: 'scontent-mia3-1.xx.fbcdn.net',
      },
    ],
  },
};

export default nextConfig;
