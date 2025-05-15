import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon } from 'lucide-react';

export type Event = {
  id: string;
  slug: string;
  image?: string;
  name: string;
  city: string;
  date: string;
};

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      key={event.id}
      href={`/events/${event.slug}`}
      className='group block h-full'>
      <div className='bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col'>
        {/* Event image */}
        <div className='relative h-48 w-full'>
          <Image
            src={event.image || '/placeholder.svg'}
            alt={event.name}
            fill
            className='object-cover'
          />
        </div>

        {/* Event details */}
        <div className='p-4 flex flex-col flex-1'>
          <h3 className='font-bold text-lg mb-2 group-hover:text-primary transition-colors'>
            {event.name}
          </h3>

          <div className='flex items-center text-muted-foreground mb-2'>
            <MapPinIcon className='h-4 w-4 mr-1' />
            <span className='text-sm'>{event.city}</span>
          </div>

          <div className='flex items-center text-muted-foreground mt-auto'>
            <CalendarIcon className='h-4 w-4 mr-1' />
            <span className='text-sm'>{event.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
