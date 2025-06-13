import { getEvents } from '@/lib/events';
import Events from './events-grid';

export async function UpcomingEvents() {
  const events = (await getEvents())
    .filter((event) => {
      // Keep only events with dates on or after today
      const today = new Date();
      const eventDate = new Date(event.end_date ?? event.start_date ?? '');
      // Normalize both dates to ignore time part
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .slice(0, 4);

  return (
    <section className='py-16'>
      <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-center mb-12'>
          Upcoming Events
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Events events={events} />
        </div>
      </div>
    </section>
  );
}
