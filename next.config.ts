import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['127.0.0.1'],
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
      {
        protocol: 'https',
        hostname: 'dice-media.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'posh.vip',
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'partiful.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'dice-media.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'instagram.ftpa1-1.fna.fbcdn.net',
      },
      // {
      //   protocol: 'http',
      //   hostname: process.env.STRAPI_CMS_URL || '',
      // },
      // {
      //   protocol: 'http',
      //   hostname: 'localhost:1337',
      // },
    ],
  },
};

export default nextConfig;
