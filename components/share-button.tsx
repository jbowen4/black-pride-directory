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
          title: document.title,
          text: 'Check this out!',
          url: window.location.href,
        });
        console.log('Page shared successfully');
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    } else {
      alert(
        'Sharing not supported on this browser. Try Safari on iPhone or macOS.'
      );
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
