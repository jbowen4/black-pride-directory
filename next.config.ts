import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://dcblackpride.org/**')],
  },
};

export default nextConfig;
