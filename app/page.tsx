import { MainBanner } from '@/components/main-banner';
import { PopularCities } from '@/components/popular-cities';
import { Subscribe } from '@/components/subscribe';
import { UpcomingEvents } from '@/components/upcoming-events';

export default function Home() {
  return (
    <div className='flex flex-col'>
      <MainBanner />
      <PopularCities />
      <UpcomingEvents />
      <Subscribe />
    </div>
  );
}
