import { DropdownMenuCheckboxes } from '@/components/dropdown';
import { EventCard } from '@/components/event-card';
import Events from '@/components/events-grid';
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

/*const events = [
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
  {
    id: '5',
    name: 'Equality Gala',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Houston',
    date: 'October 10, 2025',
    slug: 'equality-gala',
  },
  {
    id: '6',
    name: 'Unity Picnic',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Miami',
    date: 'May 20, 2025',
    slug: 'unity-picnic',
  },
  {
    id: '7',
    name: 'Empowerment Workshop',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Philadelphia',
    date: 'April 12, 2025',
    slug: 'empowerment-workshop',
  },
  {
    id: '8',
    name: 'Queer Arts Showcase',
    image: '/placeholder.svg?height=200&width=300',
    city: 'San Francisco',
    date: 'June 28, 2025',
    slug: 'queer-arts-showcase',
  },
  {
    id: '9',
    name: 'Trans Visibility March',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Seattle',
    date: 'March 31, 2025',
    slug: 'trans-visibility-march',
  },
  {
    id: '10',
    name: 'Pride Family Day',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Dallas',
    date: 'July 19, 2025',
    slug: 'pride-family-day',
  },
  {
    id: '11',
    name: 'Drag Brunch',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Denver',
    date: 'August 2, 2025',
    slug: 'drag-brunch',
  },
  {
    id: '12',
    name: 'Youth Pride Rally',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Boston',
    date: 'May 5, 2025',
    slug: 'youth-pride-rally',
  },
  {
    id: '13',
    name: 'Black Queer Film Night',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Detroit',
    date: 'September 18, 2025',
    slug: 'black-queer-film-night',
  },
  {
    id: '14',
    name: 'Health & Wellness Fair',
    image: '/placeholder.svg?height=200&width=300',
    city: 'Baltimore',
    date: 'October 25, 2025',
    slug: 'health-wellness-fair',
  },
]; */

export default async function EventPage() {
  const events = await getEvents();

  return (
    <>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-4xl font-bold text-center mb-16'>Events</h1>
        <div className='flex w-full max-w-4xl flex-col lg:flex-row mx-auto items-stretch gap-2 pb-10'>
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
        </div>
        {/* <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div> */}
      </div>
    </>
  );
}
