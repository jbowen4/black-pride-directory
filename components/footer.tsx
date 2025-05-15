import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-background border-t'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Left Column - Brand Info */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold'>Black Pride Network</h3>
            <p className='text-muted-foreground max-w-md'>
              Connecting the Black LGBTQ+ community through events
            </p>

            {/* Social Links */}
            <div className='flex space-x-4 pt-2'>
              <Link
                href='https://instagram.com'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='Instagram'>
                <Instagram className='h-5 w-5' />
              </Link>
              <Link
                href='https://twitter.com'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='X (Twitter)'>
                <Twitter className='h-5 w-5' />
              </Link>
              <Link
                href='https://linkedin.com'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='LinkedIn'>
                <Linkedin className='h-5 w-5' />
              </Link>
              <Link
                href='https://facebook.com'
                className='text-muted-foreground hover:text-primary transition-colors'
                aria-label='Facebook'>
                <Facebook className='h-5 w-5' />
              </Link>
            </div>
          </div>

          {/* Right Column - Links */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
            {/* Site Map */}
            <div className='space-y-4'>
              <h4 className='text-sm font-semibold uppercase tracking-wider'>
                Site Map
              </h4>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/'
                    className='text-muted-foreground hover:text-primary transition-colors'>
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href='/about'
                    className='text-muted-foreground hover:text-primary transition-colors'>
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href='/events'
                    className='text-muted-foreground hover:text-primary transition-colors'>
                    All Events
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className='space-y-4'>
              <h4 className='text-sm font-semibold uppercase tracking-wider'>
                Legal
              </h4>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/terms'
                    className='text-muted-foreground hover:text-primary transition-colors'>
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link
                    href='/privacy'
                    className='text-muted-foreground hover:text-primary transition-colors'>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href='/cookies'
                    className='text-muted-foreground hover:text-primary transition-colors'>
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Banner */}
      <div className='border-t'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4'>
          <p className='text-sm text-muted-foreground text-center'>
            © {currentYear} Black Pride Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
