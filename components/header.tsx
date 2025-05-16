'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Navbar } from '@/components/navbar';

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background'>
      <div className='container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Left side - Site name */}
        <div className='flex items-center'>
          <Link href='/' className='text-xl font-bold'>
            Black Pride Network
          </Link>
        </div>

        {/* Center - Navigation (desktop) */}
        <div className='hidden md:flex md:justify-center md:flex-1'>
          <Navbar />
        </div>

        {/* Right side - CTA Button */}
        <div className='flex items-center gap-4'>
          <Button className='hidden md:inline-flex' asChild>
            <Link href='/#subscribe'>Join mailing list</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className='p-3' side='right'>
              <div className='flex flex-col gap-6 py-6'>
                <Navbar orientation='vertical' />
                <Button className='w-full' asChild>
                  <Link href='/#subscribe'>Join mailing list</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
