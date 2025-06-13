'use client';

import React from 'react';
import { Button } from './ui/button';
import { Share } from 'lucide-react';

const ShareButton = () => {
  const handleShare = async () => {
    if (navigator.share) {
      console.log(window.location.href);
      try {
        await navigator.share({
          url: window.location.href,
        });
        console.log('Page shared successfully');
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    } else {
      // Fallback if Web Share API is not supported
      window.open(`sms:&body=${encodeURIComponent(window.location.href)}`);
    }
  };

  return (
    <Button
      className='flex-1 font-bold rounded-lg py-6 hover:cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 transition-transform duration-200 hover:scale-105'
      variant='secondary'
      onClick={handleShare}>
      <Share />
      Share
    </Button>
  );
};

export default ShareButton;
