import Image from 'next/image';
import { StatsCard } from '@/components/stats-card';
import { TeamMember } from '@/components/team-member';
import { FaqSection } from '@/components/faq-section';
import { countEvents } from '@/lib/events';
import { countCities } from '@/lib/cities';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
};

export default function AboutPage() {
  const eventCount = countEvents();
  const cityCount = countCities();

  return (
    <>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        {/* Page Header */}
        <h1 className='text-4xl font-bold text-center mb-16'>About Us</h1>

        {/* Mission Section - 2 columns */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 items-center'>
          {/* Left column - Mission text */}
          <div>
            <h2 className='text-2xl font-bold mb-4'>Our Mission</h2>
            <p className='text-muted-foreground'>
              Black Pride Network is dedicated to connecting and empowering the
              Black LGBTQ+ community through events, resources, and community
              building. We believe in creating spaces where everyone can
              celebrate their authentic selves while honoring the rich diversity
              within our community. Our platform showcases events across the
              country, making it easier for people to find and participate in
              gatherings that affirm their identities and foster connection.
              Through our work, we aim to strengthen bonds, increase visibility,
              and promote the well-being of Black LGBTQ+ individuals everywhere.
            </p>
          </div>

          {/* Right column - Image */}
          <div className='flex justify-center'>
            <div className='relative w-full max-w-md h-80 rounded-xl overflow-hidden'>
              <Image
                src='/images/black_pride.jpg'
                alt='Black Pride Network community'
                fill
                className='object-cover'
              />
            </div>
          </div>
        </div>

        {/* Stats Section - 3 columns with black border */}
        <div className='border-2 border-black rounded-xl p-8 mb-20'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
            <StatsCard number={eventCount} label='Events showcased' />
            <StatsCard number={cityCount} label='Cities included' />
            <StatsCard number={1} label='Community' />
          </div>
        </div>

        {/* Team Section */}
        <div className='mb-20'>
          <h2 className='text-3xl font-bold text-center mb-10'>
            Meet our team
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto'>
            <TeamMember
              name='Josh Bowen'
              role='Founder & Executive Director'
              description='Josh is passionate about creating inclusive spaces for the Black LGBTQ+ community.'
              imageSrc='/images/profilepic.jpg'
            />
            <TeamMember
              name='Marcus Williams'
              role='Community Outreach Director'
              description='Marcus works with organizations across the country to expand our network of events.'
              imageSrc='/placeholder.svg?height=200&width=200'
            />
          </div>
        </div>

        {/* FAQ Section - 2 columns */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
          {/* Left column - Title */}
          <div>
            <h2 className='text-3xl font-bold mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-muted-foreground'>
              Find answers to common questions about Black Pride Network.
            </p>
          </div>

          {/* Right column - FAQ Accordion */}
          <div className='lg:col-span-2'>
            <FaqSection />
          </div>
        </div>
      </div>
    </>
  );
}
