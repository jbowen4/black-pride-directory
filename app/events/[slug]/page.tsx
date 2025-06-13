import { getEventBySlug, getEvents } from '@/lib/events';
import { notFound } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram, Globe } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';
import ShareAndAddToCalendar from '@/components/share-and-calendar';
import { getCityBySlug } from '@/lib/cities';

export async function generateStaticParams() {
  const events = await getEvents();
  const slugs = events.map((event) => ({ slug: event.slug }));
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  const citySlug = (event?.metadata.city_category || event?.metadata.city)
    ?.toLowerCase()
    .replace(/\s+/g, '-');
  const city = citySlug ? await getCityBySlug(citySlug) : null;

  const title = event?.metadata.event_name || 'Black LGBTQ+ Event Details';
  const description = event?.metadata.description || 'Check out this event!';
  const imageUrl =
    event?.metadata.image ||
    city?.metadata.image ||
    '/images/black-gay-pride.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${slug}`,
      images: [
        {
          url: imageUrl,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const { metadata } = event;
  const {
    event_name,
    location_name,
    street_address,
    city,
    state,
    zip_code,
    //country,
    start_date,
    end_date,
    start_time,
    end_time,
    time_zone,
    organizer,
    image,
    rsvp_required,
    price,
    instagram,
    website,
    description,
  } = metadata;

  return (
    <div>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4'>
        {/* Event Image */}
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

        {/* Event Details - Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - 2/3 width */}
          <div className='lg:col-span-2'>
            <h1 className='text-3xl md:text-4xl font-bold mb-4'>
              {event_name}
            </h1>

            <div className='flex items-center mb-4'>
              <div className='font-medium'>
                {formatDate(start_date ?? '')}
                {end_date && end_date !== '' && end_date !== start_date && (
                  <> - {formatDate(end_date)}</>
                )}
              </div>
              <div className='mx-2'>•</div>
              <div className='font-mono text-muted-foreground'>
                {start_time} - {end_time} {time_zone}
              </div>
            </div>

            <div className='mb-1 font-semibold'>{location_name}</div>
            <div className='mb-4 text-muted-foreground'>
              {street_address} {street_address ? ',' : ''} {city}, {state}{' '}
              {zip_code}
            </div>

            <div className='mb-4'>
              <span className='font-medium'>Organizer: </span>
              <span>{organizer}</span>
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

            <div className='border rounded-lg p-4'>
              <div className='flex items-center mb-2'>
                <span className='text-xl font-bold'>${price}+</span>
                <span className='ml-2 text-xs uppercase tracking-wider text-muted-foreground'>
                  Ticket Price
                </span>
              </div>

              <div className='font-semibold mb-3'>
                RSVP {rsvp_required ? '' : 'NOT'} REQUIRED
              </div>

              <p className='text-sm text-muted-foreground'>
                Please check the website, as prices and availability are subject
                to change. Only starting prices are listed.
              </p>
            </div>

            <ShareAndAddToCalendar event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
