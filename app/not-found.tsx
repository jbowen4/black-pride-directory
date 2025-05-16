import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='min-h-[70vh] flex flex-col items-center justify-center text-center py-16'>
        {/* Small centered image */}
        <div className='relative w-40 h-40 mb-8 rounded-full overflow-hidden'>
          <Image
            src='/images/black-pride.jpeg'
            alt='Black Pride Symbol - Page not found'
            fill
            className='object-cover'
          />
        </div>

        {/* Heading */}
        <h1 className='text-4xl font-bold mb-4'>Oops! Page not found!</h1>

        {/* Paragraph */}
        <p className='text-muted-foreground max-w-md mb-8'>
          The page you&rsquo;re looking for doesn&rsquo;t seem to exist. But don&rsquo;t worry,
          we&rsquo;ve got plenty of other amazing events & content for you.
        </p>

        {/* Button */}
        <Button asChild size='lg'>
          <Link href='/'>Return to home</Link>
        </Button>
      </div>
    </div>
  );
}
