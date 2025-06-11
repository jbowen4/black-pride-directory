'use client';

import Link from 'next/link';
import { EventMetadata } from '@/lib/events';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { categories, city_names, formatDate } from '@/lib/utils';
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

export default function EventsWithSearch({
  events,
}: {
  events: EventMetadata[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [eventView, setEventView] = useState<ToggleOption>('list');
  const filteredEvents = events.filter((event) => {
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

      <div className='w-full flex justify-start pb-10'>
        <TogglePill value={eventView} onChange={setEventView} />
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
                  <Image
                    src={event.image || '/placeholder.svg'}
                    alt={event.event_name ?? ''}
                    fill
                    className='object-cover'
                    //onError={() => setImgSrc('/placeholder.svg')}
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
        </div>
      )}

      {eventView === 'calendar' && <></>}
    </>
  );
}
