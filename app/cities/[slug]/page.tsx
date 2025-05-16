import { getCities, getCityBySlug } from '@/lib/cities';
import { notFound } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram, Globe } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getEvents } from '@/lib/events';
import Events from '@/components/events-grid';

export async function generateStaticParams() {
  const cities = await getCities();
  const slugs = cities.map((city) => ({ slug: city.slug }));
  return slugs;
}

export default async function CityPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const city = await getCityBySlug(slug);
  const events = await getEvents();
  const filteredEvents = events.filter(
    (event) =>
      event.city?.toLowerCase() === city?.metadata.city_name?.toLowerCase()
  );

  if (!city) {
    notFound();
  }

  const { metadata, content } = city;
  const {
    event_name,
    city_name,
    image,
    organizers,
    sponsors,
    instagram,
    website,
    description,
  } = metadata;

  return (
    <div>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4'>
        {/* City Image */}
        <div className='flex justify-center mb-8'>
          <div className='relative w-full max-h-[400px] overflow-hidden rounded-lg'>
            {image && (
              <Image
                src={image || '/placeholder.svg'}
                alt={event_name || 'Placeholder Image'}
                width={1200}
                height={400}
                className='object-cover w-full max-h-[400px]'
              />
            )}
          </div>
        </div>

        {/* City Details - Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16'>
          {/* Left Column - 2/3 width */}
          <div className='lg:col-span-2'>
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>
              {event_name}
            </h1>

            <div className='mb-4'>
              <span className='font-medium'>Organizer(s): </span>
              <span>{organizers}</span>
            </div>

            <div className='text-muted-foreground'>{description}</div>
          </div>

          {/* Right Column - 1/3 width */}
          <div>
            <div className='flex justify-end gap-2 mb-6'>
              <Button variant='outline' size='icon' asChild>
                <Link
                  href={`https://instagram.com/${instagram}`}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <Instagram className='h-5 w-5' />
                  <span className='sr-only'>Instagram</span>
                </Link>
              </Button>
              <Button variant='outline' size='icon' asChild>
                <Link
                  href={website || ''}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <Globe className='h-5 w-5' />
                  <span className='sr-only'>Website</span>
                </Link>
              </Button>
            </div>

            <div className='mb-4'>
              <span className='font-medium'>Sponsors: </span>
              {sponsors?.map((sponsor, index) => (
                <span key={index}>
                  {sponsor}
                  {index < sponsors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* List of Events Section */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          <Events events={filteredEvents} />
        </div>
      </div>
    </div>
  );
}
