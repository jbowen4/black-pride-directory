'use client';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type Props = Omit<ImageProps, 'onError'> & { fallbackSrc?: string };

export function ImageWithFallback({
  src,
  fallbackSrc = '/images/black-gay-pride.png',
  className,
  ...props
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      <Image
        {...props}
        src={imgSrc}
        className={`${className ?? ''} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
        }}
      />
    </>
  );
}
