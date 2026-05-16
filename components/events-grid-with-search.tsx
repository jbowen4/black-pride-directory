'use client';

import Link from 'next/link';
import { EventMetadata } from '@/lib/events';
import Image from 'next/image';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import {
  categories,
  city_names,
  formatDate,
  getEventPlaceholder,
  isStrapiImage,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import TogglePill, { ToggleOption } from './toggle-pill';
import Calendar31 from './calendar-31';
import EventsMap from './events-map';

export default function EventsWithSearch({
  events,
}: {
  events: EventMetadata[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [eventView, setEventView] = useState<ToggleOption>('list');
  const [showPast, setShowPast] = useState(false);

  const isUpcoming = (event: EventMetadata) => {
    if (!event.start_date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const relevantDate = new Date(event.end_date ?? event.start_date);
    relevantDate.setHours(0, 0, 0, 0);
    return relevantDate >= today;
  };

  const pastCount = events.filter((e) => !isUpcoming(e)).length;

  const filteredEvents = events
    .filter((event) => showPast || isUpcoming(event))
    .filter((event) => {
      return (
        event.event_name?.toLowerCase().includes(query.toLowerCase()) &&
        (category
          ? Array.isArray(event.categories) &&
            event.categories
              .map((c: string) => c.toLowerCase())
              .includes(category.toLowerCase())
          : true) &&
        (city
          ? event.city?.toLowerCase() === city.toLowerCase() ||
            event.city_category?.toLowerCase() === city.toLowerCase()
          : true)
      );
    });

  const resetFields = () => {
    setQuery('');
    setCategory('');
    setCity('');
  };

  // const city_names = (await getCities())
  //   .map((city) => city.city_name)
  //   .filter((city_name): city_name is string => typeof city_name === 'string');

  return (
    <>
      <div className='flex w-full max-w-4xl flex-col lg:flex-row mx-auto items-stretch gap-2 pb-8'>
        <Input
          type='text'
          placeholder='Search an event...'
          className='w-full h-12 min-h-12 focus:outline-none focus:outline-hidden flex-[1]'
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <div className='w-full flex gap-2 flex-[1]'>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className='w-[180px] py-6'>
              <SelectValue placeholder='Event Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className='w-[180px] py-6'>
              <SelectValue placeholder='City' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cities</SelectLabel>
                {city_names.map((city) => (
                  <SelectItem key={city.dbName} value={city.dbName}>
                    {city.displayName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            className='flex-[1.5] w-full h-13 hover:cursor-pointer'
            onClick={resetFields}>
            Reset
          </Button>
        </div>
      </div>

      <div className='flex items-center gap-2 text-sm md:text-lg text-muted-foreground pb-4'>
        <span>
          {showPast ? 'Showing all events' : 'Showing upcoming events'}
        </span>
        {pastCount > 0 && (
          <button
            onClick={() => setShowPast((v) => !v)}
            className='underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer'>
            {showPast
              ? 'Show upcoming only'
              : `Show past events (${pastCount})`}
          </button>
        )}
      </div>

      <div className='w-full flex justify-between items-center pb-10'>
        <TogglePill value={eventView} onChange={setEventView} />
        <span className='text-lg md:text-xl font-bold text-black'>
          {filteredEvents.length} events
        </span>
      </div>

      {eventView === 'list' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          {filteredEvents.map((event) => (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className='group block h-full'>
              <div className='bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col'>
                {/* Event image */}
                <div className='relative h-48 w-full'>
                  {isStrapiImage(event.image) ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_STRAPI_CMS_URL}${event.image.url}`}
                      alt={event.image.alternativeText ?? ''}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <ImageWithFallback
                      src={event.image || getEventPlaceholder(event)}
                      alt={event.event_name ?? ''}
                      fill
                      className='object-cover'
                    />
                  )}
                </div>

                {/* Event details */}
                <div className='p-4 flex flex-col flex-1'>
                  <h3 className='font-bold text-lg mb-2 group-hover:text-primary transition-colors'>
                    {event.event_name}
                  </h3>

                  <div className='flex items-center text-muted-foreground mb-2'>
                    <MapPinIcon className='h-4 w-4 mr-1' />
                    <span className='text-sm'>
                      {typeof event.city === 'object'
                        ? event.city_name!
                        : event.city}
                      , {event.state}
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
        </div>
      )}

      {eventView === 'calendar' && <Calendar31 events={filteredEvents} />}

      {eventView === 'map' && <EventsMap events={filteredEvents} />}
    </>
  );
}
