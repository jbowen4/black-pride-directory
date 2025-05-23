import Link from 'next/link';
import Image from 'next/image';
import { getCities } from '@/lib/cities';

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8'>
      <h2 className='text-3xl font-bold text-center mb-12'>Cities</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className='group block'>
            <div className='relative h-64 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg'>
              {/* Background image */}
              <Image
                src={city.image || '/placeholder.svg'}
                alt={`${city.event_name} city`}
                fill
                className='object-cover'
              />

              {/* Gradient overlay to ensure text visibility */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-black/20' />

              {/* City name */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <h3 className='text-2xl font-bold text-white'>
                  {city.event_name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
