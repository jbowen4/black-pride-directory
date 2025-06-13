import Link from 'next/link';
import { EventMetadata } from '@/lib/events';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Events({ events }: { events: EventMetadata[] }) {
  return (
    <>
      {events.map((event) => (
        <Link
          key={event.slug}
          href={`/events/${event.slug}`}
          className='group block h-full'>
          <div className='bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col'>
            {/* Event image */}
            <div className='relative h-48 w-full'>
              <Image
                src={
                  event.image ||
                  `/images/${event.city?.toLowerCase().replace(/\s+/g, '-')}.jpg` ||
                  '/images/black-gay-pride.png'
                }
                alt={event.event_name ?? ''}
                fill
                className='object-cover'
              />
            </div>

            {/* Event details */}
            <div className='p-4 flex flex-col flex-1'>
              <h3 className='font-bold text-lg mb-2 group-hover:text-primary transition-colors'>
                {event.event_name}
              </h3>

              <div className='flex items-center text-muted-foreground mb-2'>
                <MapPinIcon className='h-4 w-4 mr-1' />
                <span className='text-sm'>
                  {event.city}, {event.state}
                </span>
              </div>

              <div className='flex items-center text-muted-foreground mt-auto'>
                <CalendarIcon className='h-4 w-4 mr-1' />
                <span className='text-sm'>
                  {formatDate(event.start_date ?? '')}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
