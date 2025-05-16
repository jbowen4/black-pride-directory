import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Black Pride Network',
    template: '%s | Black Pride Network',
  },
  description:
    'Your directory for Black LGBTQIA+ community events and resources.',
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`flex min-h-screen flex-col font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main className='flex-1 pt-10 pb-8'>{children}</main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
