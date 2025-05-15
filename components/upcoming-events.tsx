import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { EventCard } from './event-card';

// Sample event data
const events = [
  {
    id: '1',
    name: 'Black Pride Festival',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Atlanta',
    date: 'June 15, 2025',
    slug: 'black-pride-festival',
  },
  {
    id: '2',
    name: 'Community Mixer',
    image: '/placeholder.svg?height=200&width=300',
    city: 'New York',
    date: 'July 8, 2025',
    slug: 'community-mixer',
  },
  {
    id: '3',
    name: 'Pride Parade',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Chicago',
    date: 'August 22, 2025',
    slug: 'pride-parade',
  },
  {
    id: '4',
    name: 'LGBTQ+ Conference',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Los Angeles',
    date: 'September 5, 2025',
    slug: 'lgbtq-conference',
  },
];

export function UpcomingEvents() {
  return (
    <section className='py-16'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-center mb-12'>
          Upcoming Events
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
