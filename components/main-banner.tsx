import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function MainBanner() {
  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center'>
        <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6'>
          Welcome to Black Pride Network
        </h1>
        <p className='text-xl text-muted-foreground mb-12 max-w-2xl mx-auto'>
          Your directory for community events and resources.
        </p>

        <div className='flex justify-center'>
          <Link href='/events'>
            <Button size='lg' className='hover:cursor-pointer'>
              Find events
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
