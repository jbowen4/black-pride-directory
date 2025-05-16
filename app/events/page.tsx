import { DropdownMenuCheckboxes } from '@/components/dropdown';
import { EventCard } from '@/components/event-card';
import Events from '@/components/events-grid';
import EventsWithSearch from '@/components/events-grid-with-search';
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
import { getEvents } from '@/lib/events';

export default async function EventPage() {
  const events = await getEvents();

  return (
    <>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-4xl font-bold text-center mb-16'>Events</h1>
        <EventsWithSearch events={events} />
        {/* <div className='flex w-full max-w-4xl flex-col lg:flex-row mx-auto items-stretch gap-2 pb-10'>
          <Input
            type='text'
            placeholder='Search an event...'
            className='w-full h-12 min-h-12 focus:outline-none flex-[1]'
          />
          <div className='w-full flex gap-2 flex-[1]'>
            <Select>
              <SelectTrigger className='w-[180px] py-6'>
                <SelectValue placeholder='Event Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value='apple'>Apple</SelectItem>
                  <SelectItem value='banana'>Banana</SelectItem>
                  <SelectItem value='blueberry'>Blueberry</SelectItem>
                  <SelectItem value='grapes'>Grapes</SelectItem>
                  <SelectItem value='pineapple'>Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className='w-[180px] py-6'>
                <SelectValue placeholder='City' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cities</SelectLabel>
                  <SelectItem value='apple'>Apple</SelectItem>
                  <SelectItem value='banana'>Banana</SelectItem>
                  <SelectItem value='blueberry'>Blueberry</SelectItem>
                  <SelectItem value='grapes'>Grapes</SelectItem>
                  <SelectItem value='pineapple'>Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button className='flex-[1.5] w-full h-13' type='submit'>
              Search
            </Button>
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          <Events events={events} />
        </div> */}
        {/* <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div> */}
      </div>
    </>
  );
}
